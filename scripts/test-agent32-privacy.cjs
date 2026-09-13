/*
 * Agent32 isolated privacy regression tests.
 * Run after installing the project's dependencies:
 *   node --test scripts/test-agent32-privacy.cjs
 * Executes the actual TS/TSX source with synthetic auth, database and browser
 * adapters. This is NOT a real-browser, database or device end-to-end suite.
 * No network, real credentials, live accounts or real media are used.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const ts = require("typescript");
const root = path.resolve(
  process.env.AGENT32_SOURCE_ROOT || path.join(__dirname, ".."),
);
const plain = (value) => JSON.parse(JSON.stringify(value));
const sentinel = "fixture-child@example.invalid fixture-token-not-live";

function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  assert.equal(
    (result.diagnostics || []).filter(
      (d) => d.category === ts.DiagnosticCategory.Error,
    ).length,
    0,
  );
  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    Buffer,
    Headers,
    Date,
    Error,
    Blob,
    console: { error() {}, warn() {}, info() {}, log() {} },
    process: { env: { NODE_ENV: "production" } },
    require(id) {
      if (Object.hasOwn(dependencies, id)) return dependencies[id];
      if (id === "node:crypto") return crypto;
      throw new Error(`Unmocked dependency in privacy test: ${id}`);
    },
    ...globals,
  };
  vm.runInNewContext(result.outputText, context, {
    filename: file,
    timeout: 3000,
  });
  return module.exports;
}
function response() {
  return {
    statusCode: 200,
    body: undefined,
    cookies: [],
    headers: {},
    headersSent: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    },
    type() {
      return this;
    },
    cookie(...args) {
      this.cookies.push(args);
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    vary(value) {
      this.headers.Vary = [this.headers.Vary, value].filter(Boolean).join(", ");
      return this;
    },
    end() {
      this.headersSent = true;
      return this;
    },
  };
}
function assertPrivate(value) {
  const text = JSON.stringify(value);
  for (const part of sentinel.split(" "))
    assert.ok(!text.includes(part), "Synthetic private data leaked");
  assert.ok(!text.includes("mysql://"), "Connection information leaked");
}

function authHarness({ failure, webResponse, stale = false } = {}) {
  const logs = [],
    forwarded = [];
  let authCalls = 0;
  const module = load(
    "src/server/auth-middleware.ts",
    {
      "@/lib/auth/auth": {
        getAuth() {
          authCalls++;
          if (failure) throw failure;
          return { handler: async () => webResponse };
        },
      },
      "@/lib/auth/express-adapter": {
        toWebRequest: (req) => req,
        sendWebResponse: async (value) => forwarded.push(value),
      },
      "@/lib/auth/session-cookies": { tryClearStaleSession: () => stale },
    },
    { console: { error: (...args) => logs.push(args) } },
  );
  return { module, logs, forwarded, authCalls: () => authCalls };
}
for (const contentType of ["JSON", "non-JSON"]) {
  test(`Auth ${contentType} failure: no body consumption, personal URL or response logging`, async () => {
    const body = contentType === "JSON" ? { message: sentinel } : sentinel;
    let cloneCalls = 0;
    const webResponse = {
      ok: false,
      status: 401,
      clone() {
        cloneCalls++;
        return { json: async () => body, text: async () => sentinel };
      },
    };
    const h = authHarness({ webResponse });
    const res = response();
    await h.module.authHandler({ path: "/sign-in/" + sentinel }, res);
    assert.equal(cloneCalls, 0);
    assert.equal(h.forwarded[0], webResponse);
    assertPrivate(h.logs);
    assert.deepEqual(plain(h.logs[0]), [
      "[auth] request rejected",
      { status: 401 },
    ]);
    assert.match(res.headers["Cache-Control"], /private, no-store/);
  });
}
for (const [name, message, status] of [
  ["missing configuration", "BETTER_AUTH_SECRET " + sentinel, 503],
  ["database unavailable", "ECONNREFUSED mysql://fixture " + sentinel, 503],
  ["missing table", "ER_NO_SUCH_TABLE " + sentinel, 503],
  ["unexpected exception", sentinel, 500],
]) {
  test(`Auth ${name}: generic response and metadata-only logging`, async () => {
    const h = authHarness({ failure: new Error(message) });
    const res = response();
    await h.module.authHandler({ path: "/sign-in/" + sentinel }, res);
    assert.equal(res.statusCode, status);
    assertPrivate([res.body, h.logs]);
    assert.ok(!JSON.stringify(res.body).includes("BETTER_AUTH_SECRET"));
    assert.ok(!JSON.stringify(res.body).includes("migrations"));
  });
}
test("Auth success still forwards the untouched response", async () => {
  const webResponse = { ok: true, status: 200 };
  const h = authHarness({ webResponse });
  await h.module.authHandler({ path: "/sign-in/email" }, response());
  assert.equal(h.forwarded[0], webResponse);
  assert.equal(h.logs.length, 0);
});
test("Stale-session recovery still happens before authentication access", async () => {
  const h = authHarness({ stale: true, failure: new Error(sentinel) });
  await h.module.authHandler({ path: "/get-session" }, response());
  assert.equal(h.authCalls(), 0);
});

// In-memory adapter evaluates the predicates supplied by the real route code.
const orm = {
  eq: (column, value) => (row) => row[column] === value,
  gt: (column, value) => (row) => row[column] > value,
  and:
    (...predicates) =>
    (row) =>
      predicates.every((predicate) => predicate(row)),
  desc: (column) => column,
};
function table(name, columns) {
  return Object.fromEntries([
    ["tableName", name],
    ...columns.map((key) => [key, key]),
  ]);
}
function database(fixtures, fail = false) {
  const queries = [];
  return {
    queries,
    select(selection) {
      let current,
        predicate = () => true;
      return {
        from(value) {
          current = value.tableName;
          queries.push(current);
          return this;
        },
        where(value) {
          predicate = value;
          return this;
        },
        orderBy() {
          return this;
        },
        async limit(count) {
          if (fail) throw new Error("mysql://fixture " + sentinel);
          const rows = (fixtures[current] || [])
            .filter(predicate)
            .slice(0, count);
          return selection
            ? rows.map((row) =>
                Object.fromEntries(
                  Object.entries(selection).map(([key, column]) => [
                    key,
                    row[column],
                  ]),
                ),
              )
            : rows;
        },
      };
    },
  };
}
function progressHarness(user, fail = false) {
  const schema = {
    children: table("children", ["id", "parentId", "totalStars"]),
    activitySessions: table("activities", ["childId", "completedAt"]),
    progressSummaries: table("summaries", ["childId", "weekStart"]),
  };
  const db = database(
    {
      children: [
        { id: 1, parentId: "parent-a", totalStars: 5 },
        { id: 2, parentId: "parent-b", totalStars: 99 },
      ],
      activities: [
        { childId: 1, subject: "Maths", completedAt: new Date() },
        { childId: 2, subject: "PRIVATE-OTHER-CHILD" },
      ],
      summaries: [{ childId: 1 }, { childId: 2, private: sentinel }],
    },
    fail,
  );
  const module = load("src/server/api/children/[childId]/progress/GET.ts", {
    "../../../../db/client.js": { db },
    "../../../../db/schema.js": schema,
    "drizzle-orm": orm,
    "@/lib/auth/auth": {
      getAuth: () => ({
        api: { getSession: async () => (user ? { user } : null) },
      }),
    },
  });
  return { module, db };
}
test("Progress: unauthenticated request never reads the database", async () => {
  const h = progressHarness(null),
    res = response();
  await h.module.default({ headers: {}, params: { childId: "1" } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(h.db.queries.length, 0);
  assert.match(res.headers["Cache-Control"], /private, no-store/);
  assert.equal(res.headers.Vary, "Cookie");
});
for (const id of ["0", "-1", "1.5", "invalid"]) {
  test(`Progress: invalid identifier ${id} is rejected before data access`, async () => {
    const h = progressHarness({ id: "parent-a" }),
      res = response();
    await h.module.default({ headers: {}, params: { childId: id } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(h.db.queries.length, 0);
  });
}
for (const [role, id] of [
  ["other parent", "parent-b"],
  ["child", "child-a"],
  ["teacher", "teacher-a"],
]) {
  test(`Progress: ${role} cannot read another account's child`, async () => {
    const h = progressHarness({ id, role }),
      res = response();
    await h.module.default(
      {
        headers: {},
        params: { childId: "1" },
        query: { parentId: "parent-a" },
      },
      res,
    );
    assert.equal(res.statusCode, 404);
    assert.deepEqual(h.db.queries, ["children"]);
    assertPrivate(res.body);
  });
}
test("Progress: owning parent receives only that child's results", async () => {
  const h = progressHarness({ id: "parent-a" }),
    res = response();
  await h.module.default({ headers: {}, params: { childId: "1" } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.totalStars, 5);
  assert.ok(res.body.recent.every((row) => row.childId === 1));
  assert.ok(res.body.summaries.every((row) => row.childId === 1));
  assertPrivate(res.body);
  assert.match(res.headers["Cache-Control"], /private, no-store/);
});
test("Progress: database exception cannot expose personal or connection details", async () => {
  const h = progressHarness({ id: "parent-a" }, true),
    res = response();
  await h.module.default({ headers: {}, params: { childId: "1" } }, res);
  assert.equal(res.statusCode, 500);
  assertPrivate(res.body);
});

// Minimal hook lifecycle adapter: executes the actual component's callbacks.
// It is intentionally not labelled a DOM/React-renderer or real-device test.
function recorderHarness(options = {}) {
  const hooks = [],
    scheduledEffects = [],
    timers = new Map(),
    events = [],
    requested = [],
    recorders = [],
    readers = [],
    saved = [],
    deleted = [],
    alerts = [],
    audio = [];
  let cursor = 0,
    timerId = 0,
    dirty = false,
    mounted = true,
    lateUpdates = 0;
  let props = {
    clipKey: "welcome",
    label: "Welcome",
    prompt: "Hello",
    compact: !!options.compact,
  };
  const voice = {
    childId: "fixture-child-a",
    clips: options.clips || {},
    saveClip: (...args) => saved.push(args),
    deleteClip: (key) => deleted.push(key),
  };
  const changed = (a, b) =>
    !a || !b || a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));
  const React = {
    useState(initial) {
      const i = cursor++;
      if (!hooks[i])
        hooks[i] = {
          kind: "state",
          value: typeof initial === "function" ? initial() : initial,
        };
      return [
        hooks[i].value,
        (value) => {
          if (!mounted) lateUpdates++;
          const next =
            typeof value === "function" ? value(hooks[i].value) : value;
          if (!Object.is(next, hooks[i].value)) {
            hooks[i].value = next;
            dirty = true;
          }
        },
      ];
    },
    useRef(initial) {
      const i = cursor++;
      if (!hooks[i]) hooks[i] = { kind: "ref", current: initial };
      return hooks[i];
    },
    useCallback(fn, deps) {
      const i = cursor++;
      if (!hooks[i] || changed(hooks[i].deps, deps))
        hooks[i] = { kind: "callback", fn, deps };
      return hooks[i].fn;
    },
    useEffect(fn, deps) {
      const i = cursor++;
      if (!hooks[i] || changed(hooks[i].deps, deps)) {
        const previous = hooks[i];
        hooks[i] = { kind: "effect", deps, cleanup: previous?.cleanup };
        scheduledEffects.push(() => {
          hooks[i].cleanup?.();
          hooks[i].cleanup = fn();
        });
      }
    },
  };
  function eventTarget(extra = {}) {
    const listeners = new Map();
    return {
      ...extra,
      addEventListener(name, fn) {
        if (!listeners.has(name)) listeners.set(name, new Set());
        listeners.get(name).add(fn);
      },
      removeEventListener(name, fn) {
        listeners.get(name)?.delete(fn);
      },
      emit(name) {
        for (const fn of [...(listeners.get(name) || [])]) fn();
      },
      listenerCount() {
        return [...listeners.values()].reduce((sum, set) => sum + set.size, 0);
      },
    };
  }
  const document = eventTarget({ visibilityState: "visible" }),
    window = eventTarget();
  const track = {
    stopCalls: 0,
    stop() {
      this.stopCalls++;
    },
  };
  const stream = { getTracks: () => [track] };
  class MediaRecorder {
    static isTypeSupported() {
      return true;
    }
    constructor(value, settings) {
      if (options.constructorFailure) throw new Error(sentinel);
      this.stream = value;
      this.mimeType = settings?.mimeType || "audio/webm";
      this.state = "inactive";
      this.stopCalls = 0;
      recorders.push(this);
    }
    start() {
      if (options.startFailure) throw new Error(sentinel);
      this.state = "recording";
    }
    stop() {
      assert.notEqual(this.state, "inactive");
      this.stopCalls++;
      this.state = "inactive";
      events.push(() => {
        this.ondataavailable?.({ data: new Blob(["synthetic-audio"]) });
        this.onstop?.();
      });
    }
  }
  class FileReader {
    constructor() {
      this.readyState = 0;
      this.result = null;
      this.aborted = false;
      readers.push(this);
    }
    readAsDataURL() {
      this.readyState = 1;
      events.push(() => {
        if (this.aborted) return;
        this.readyState = 2;
        this.result = "data:audio/webm;base64,ZmFrZQ==";
        this.onloadend?.();
      });
    }
    abort() {
      this.aborted = true;
      this.readyState = 2;
    }
  }
  class Audio {
    constructor(url) {
      this.url = url;
      this.paused = false;
      audio.push(this);
    }
    play() {
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
  }
  const jsx = (type, value) => ({ type, props: value || {} });
  const module = load(
    "src/components/VoiceRecorder.tsx",
    {
      react: React,
      "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
      "motion/react": {
        motion: new Proxy({}, { get: (_, name) => "motion." + name }),
        AnimatePresence: "AnimatePresence",
      },
      "lucide-react": Object.fromEntries(
        ["Mic", "Square", "Play", "Trash2", "Check", "RefreshCw"].map(
          (name) => [name, name],
        ),
      ),
      "@/lib/voice-context": { useVoice: () => voice },
    },
    {
      document,
      window,
      MediaRecorder,
      FileReader,
      Audio,
      alert: (message) => alerts.push(message),
      navigator: {
        mediaDevices: {
          getUserMedia(constraints) {
            requested.push(constraints);
            return options.acquire
              ? options.acquire(stream)
              : Promise.resolve(stream);
          },
        },
      },
      setInterval(fn) {
        const id = ++timerId;
        timers.set(id, fn);
        return id;
      },
      clearInterval(id) {
        timers.delete(id);
      },
    },
  );
  let tree;
  function render() {
    let runs = 0;
    do {
      dirty = false;
      cursor = 0;
      tree = module.default(props);
      while (scheduledEffects.length) scheduledEffects.shift()();
      assert.ok(++runs < 20, "Render loop");
    } while (dirty);
    return tree;
  }
  function walk(node, predicate) {
    if (Array.isArray(node))
      return node.flatMap((child) => walk(child, predicate));
    if (!node || typeof node !== "object") return [];
    return [
      ...(predicate(node) ? [node] : []),
      ...walk(node.props?.children, predicate),
    ];
  }
  function text(node) {
    if (Array.isArray(node)) return node.map(text).join("");
    if (node == null || typeof node === "boolean") return "";
    if (typeof node !== "object") return String(node);
    return text(node.props?.children);
  }
  function click(label) {
    render();
    const button = walk(
      tree,
      (node) =>
        typeof node.props.onClick === "function" &&
        (text(node).includes(label) ||
          String(node.props.title || "").includes(label)),
    )[0];
    assert.ok(button, "Missing button: " + label);
    button.props.onClick();
    render();
  }
  async function settle() {
    for (let i = 0; i < 4; i++) await Promise.resolve();
    if (mounted) render();
  }
  async function tick(count) {
    for (let i = 0; i < count; i++) {
      for (const [id, fn] of [...timers]) if (timers.has(id)) fn();
      await settle();
    }
  }
  function flushOneEvent() {
    events.shift()?.();
    if (mounted) render();
  }
  function flushEvents() {
    while (events.length) flushOneEvent();
  }
  function unmount() {
    for (const hook of hooks) if (hook.kind === "effect") hook.cleanup?.();
    mounted = false;
  }
  render();
  return {
    requested,
    recorders,
    readers,
    saved,
    deleted,
    alerts,
    audio,
    track,
    timers,
    document,
    window,
    voice,
    click,
    tick,
    settle,
    flushOneEvent,
    flushEvents,
    unmount,
    render,
    state: () =>
      hooks.filter((hook) => hook.kind === "state").map((hook) => hook.value),
    lateUpdates: () => lateUpdates,
    changeChild() {
      voice.childId = "fixture-child-b";
      voice.clips = {};
      render();
    },
    changeClip() {
      props = { ...props, clipKey: "well-done" };
      render();
    },
    hide() {
      document.visibilityState = "hidden";
      document.emit("visibilitychange");
      render();
    },
    show() {
      document.visibilityState = "visible";
      document.emit("visibilitychange");
      render();
    },
  };
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
// Full mode uses different button wording, so tests use this explicit helper.
async function begin(h, compact = false) {
  h.click(compact ? "Record your voice" : "Tap to record");
  await h.tick(3);
}
test("Recorder mount never requests microphone or camera access", () => {
  const h = recorderHarness();
  assert.equal(h.requested.length, 0);
  h.unmount();
});
test("Explicit Record requests only audio after the countdown", async () => {
  const h = recorderHarness();
  h.click("Tap to record");
  await h.tick(2);
  assert.equal(h.requested.length, 0);
  await h.tick(1);
  assert.deepEqual(plain(h.requested), [{ audio: true, video: false }]);
  h.unmount();
});
test("Repeated compact taps cannot start parallel permission requests", async () => {
  const d = deferred(),
    h = recorderHarness({ compact: true, acquire: () => d.promise });
  h.click("Record your voice");
  h.click("Record your voice");
  await h.tick(3);
  h.click("Record your voice");
  await h.tick(3);
  assert.equal(h.requested.length, 1);
  h.unmount();
  d.reject(new Error("cancelled"));
  await h.settle();
});
test("Leaving during countdown prevents a later permission request", async () => {
  const h = recorderHarness();
  h.click("Tap to record");
  h.unmount();
  await h.tick(3);
  assert.equal(h.requested.length, 0);
});
for (const action of ["unmount", "changeChild", "changeClip", "hide"]) {
  test(`Late microphone grant after ${action} is stopped without recording`, async () => {
    const d = deferred();
    let acquired;
    const h = recorderHarness({
      acquire: (stream) => {
        acquired = stream;
        return d.promise;
      },
    });
    await begin(h);
    h[action]();
    d.resolve(acquired);
    await h.settle();
    assert.equal(h.track.stopCalls, 1);
    assert.equal(h.recorders.length, 0);
    assert.equal(h.saved.length, 0);
    assert.equal(h.lateUpdates(), 0);
    if (action !== "unmount") h.unmount();
  });
}
test("Permission denied is optional, private and never automatically retried", async () => {
  const h = recorderHarness({
    acquire: () => Promise.reject(new Error(sentinel)),
  });
  await begin(h);
  await h.tick(20);
  assert.equal(h.requested.length, 1);
  assert.equal(h.state()[0], "idle");
  assertPrivate(h.alerts);
  assert.ok(h.alerts[0].includes("optional"));
  h.unmount();
});
test("Late permission rejection after exit does not show an alert or update state", async () => {
  const d = deferred(),
    h = recorderHarness({ acquire: () => d.promise });
  await begin(h);
  h.unmount();
  d.reject(new Error(sentinel));
  await h.settle();
  assert.equal(h.alerts.length, 0);
  assert.equal(h.lateUpdates(), 0);
});
for (const failure of ["constructorFailure", "startFailure"]) {
  test(`Recorder ${failure} releases an already-granted microphone`, async () => {
    const h = recorderHarness({ [failure]: true });
    await begin(h);
    assert.equal(h.track.stopCalls, 1);
    assert.equal(h.timers.size, 0);
    assert.equal(h.state()[0], "idle");
    assertPrivate(h.alerts);
    h.unmount();
  });
}
test("Stopping releases microphone immediately, not after the queued stop callback", async () => {
  const h = recorderHarness();
  await begin(h);
  h.click("Stop recording");
  assert.equal(h.track.stopCalls, 1);
  assert.equal(h.readers.length, 0);
  h.flushEvents();
  assert.equal(h.state()[0], "preview");
  h.unmount();
});
test("Repeated stop clicks are safe and stop the recorder once", async () => {
  const h = recorderHarness();
  await begin(h);
  h.click("Stop recording");
  h.click("Stop recording");
  assert.equal(h.recorders[0].stopCalls, 1);
  h.flushEvents();
  h.unmount();
});
test("Recorder error stops capture, clears timers and never saves", async () => {
  const h = recorderHarness();
  await begin(h);
  assert.equal(typeof h.recorders[0].onerror, "function");
  h.recorders[0].onerror(new Error(sentinel));
  h.flushEvents();
  assert.equal(h.track.stopCalls, 1);
  assert.equal(h.timers.size, 0);
  assert.equal(h.saved.length, 0);
  assertPrivate(h.alerts);
  h.unmount();
});
for (const action of ["unmount", "hide"]) {
  test(`Active recording is discarded on ${action}`, async () => {
    const h = recorderHarness();
    await begin(h);
    h[action]();
    h.flushEvents();
    assert.equal(h.track.stopCalls, 1);
    assert.equal(h.timers.size, 0);
    assert.equal(h.readers.length, 0);
    assert.equal(h.saved.length, 0);
    assert.equal(h.lateUpdates(), 0);
    if (action !== "unmount") h.unmount();
  });
}
test("Pagehide stops capture and returning to the page never restarts it", async () => {
  const h = recorderHarness();
  await begin(h);
  h.window.emit("pagehide");
  h.show();
  await h.tick(20);
  assert.equal(h.track.stopCalls, 1);
  assert.equal(h.requested.length, 1);
  h.unmount();
});
test("Pending file read is aborted when leaving, with no retained preview", async () => {
  const h = recorderHarness();
  await begin(h);
  h.click("Stop recording");
  h.flushOneEvent();
  assert.equal(h.readers[0].readyState, 1);
  h.unmount();
  h.flushEvents();
  assert.equal(h.readers[0].aborted, true);
  assert.equal(h.lateUpdates(), 0);
  assert.equal(h.saved.length, 0);
});
test("Recording duration remains bounded to eight seconds", async () => {
  const h = recorderHarness();
  await begin(h);
  await h.tick(8);
  assert.equal(h.recorders[0].state, "inactive");
  assert.equal(h.track.stopCalls, 1);
  h.flushEvents();
  assert.equal(h.state()[0], "preview");
  h.unmount();
});
test("Preview is not saved until the explicit Save action", async () => {
  const h = recorderHarness();
  await begin(h);
  h.click("Stop recording");
  h.flushEvents();
  assert.equal(h.saved.length, 0);
  h.click("Save it!");
  assert.equal(h.saved.length, 1);
  assert.equal(h.saved[0][0], "welcome");
  h.unmount();
});
test("Switching child clears a previous child's saved preview and stops playback", () => {
  const h = recorderHarness({
    clips: { welcome: { dataUrl: "data:audio/webm;base64,ZmFrZQ==" } },
  });
  h.click("Play back");
  h.changeChild();
  assert.equal(h.state()[0], "idle");
  assert.equal(h.state()[3], null);
  assert.equal(h.audio[0].paused, true);
  h.unmount();
});
test("Deleting a saved recording still calls the existing delete operation", () => {
  const h = recorderHarness({
    clips: { welcome: { dataUrl: "data:audio/webm;base64,ZmFrZQ==" } },
  });
  h.click("Delete recording");
  assert.deepEqual(h.deleted, ["welcome"]);
  assert.equal(h.state()[3], null);
  h.unmount();
});
test("Recorder unmount removes visibility and pagehide listeners", () => {
  const h = recorderHarness();
  h.unmount();
  assert.equal(h.document.listenerCount(), 0);
  assert.equal(h.window.listenerCount(), 0);
});

function scanHarness({ failure = false } = {}) {
  const calls = [];
  class OpenAI {
    constructor() {
      this.responses = {
        create: async (args) => {
          calls.push(args);
          if (failure) throw new Error(sentinel);
          return { output_text: "Fixture explanation" };
        },
      };
    }
  }
  return {
    calls,
    module: load(
      "src/server/api/ai-teacher/read-page/POST.ts",
      {
        openai: OpenAI,
      },
      { process: { env: { OPENAI_API_KEY: "fixture-key-not-live" } } },
    ),
  };
}
test("Child page scan disables provider response-state storage and HTTP caching", async () => {
  const h = scanHarness(),
    res = response();
  await h.module.default(
    { body: { image: "data:image/png;base64,ZmFrZQ==", age: 8 } },
    res,
  );
  assert.equal(res.statusCode, 200);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].store, false);
  assert.equal(h.calls[0].model, "gpt-4o-mini");
  assertPrivate(res.body);
  assert.match(res.headers["Cache-Control"], /private, no-store/);
  assert.equal(res.headers["X-Robots-Tag"], "noindex, nofollow");
});
for (const image of [
  "data:text/html;base64,ZmFrZQ==",
  "data:image/png;base64," + "A".repeat(8_500_000),
]) {
  test(`Invalid scan ${image.startsWith("data:text") ? "type" : "size"} never reaches the provider`, async () => {
    const h = scanHarness(),
      res = response();
    await h.module.default({ body: { image } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(h.calls.length, 0);
  });
}
test("Scan provider errors do not echo private content", async () => {
  const h = scanHarness({ failure: true }),
    res = response();
  await h.module.default(
    { body: { image: "data:image/png;base64,ZmFrZQ==" } },
    res,
  );
  assert.equal(res.statusCode, 502);
  assertPrivate(res.body);
});

function speechHarness({
  native = false,
  fail = false,
  stopFail = false,
  browserError = false,
} = {}) {
  const logs = [],
    spoken = [];
  const privateError = { message: sentinel, utterance: { text: sentinel } };
  const plugin = {
    speak: async ({ text }) => {
      spoken.push(text);
      if (fail) throw privateError;
      return { status: "done", privateDetail: sentinel };
    },
    stop: async () => {
      if (stopFail) throw privateError;
    },
  };
  const browser = {
    getVoices: () => [{ name: "Fixture voice", lang: "en-GB" }],
    cancel() {},
    speak(utterance) {
      spoken.push(utterance.text);
      if (browserError) utterance.onerror?.(privateError);
      else utterance.onend?.();
    },
  };
  const module = load(
    "src/lib/voice-context.tsx",
    {
      react: { createContext: (value) => value },
      "react/jsx-runtime": {},
      "@capacitor/core": {
        Capacitor: { isNativePlatform: () => native },
        registerPlugin: () => plugin,
      },
    },
    {
      window: { speechSynthesis: browser },
      SpeechSynthesisUtterance: class {
        constructor(text) {
          this.text = text;
        }
      },
      console: Object.fromEntries(
        ["error", "warn", "info", "log"].map((level) => [
          level,
          (...args) => logs.push([level, ...args]),
        ]),
      ),
    },
  );
  return {
    module,
    logs,
    spoken,
    async settle() {
      for (let i = 0; i < 5; i++) await Promise.resolve();
    },
  };
}
for (const native of [false, true]) {
  test(`Read-aloud ${native ? "native" : "browser"} success never logs spoken text or response content`, async () => {
    const h = speechHarness({ native });
    let ended = 0;
    h.module.ttsSpeak(sentinel, () => ended++);
    await h.settle();
    assert.deepEqual(h.spoken, [sentinel]);
    assert.equal(ended, 1);
    assertPrivate(h.logs);
  });
}
test("Native speech failure logs no private payload and preserves one browser fallback", async () => {
  const h = speechHarness({ native: true, fail: true });
  let ended = 0;
  h.module.ttsSpeak(sentinel, () => ended++);
  await h.settle();
  assert.deepEqual(h.spoken, [sentinel, sentinel]);
  assert.equal(ended, 1);
  assertPrivate(h.logs);
});
test("Browser speech failure does not log the utterance or error content", async () => {
  const h = speechHarness({ browserError: true });
  let ended = 0;
  h.module.ttsSpeak(sentinel, () => ended++);
  await h.settle();
  assert.equal(ended, 1);
  assertPrivate(h.logs);
});
test("Native speech stop failure logs no private error content", async () => {
  const h = speechHarness({ native: true, stopFail: true });
  h.module.stopTts();
  await h.settle();
  assertPrivate(h.logs);
});
