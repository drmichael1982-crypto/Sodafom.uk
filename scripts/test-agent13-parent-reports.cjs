/*
 * Run with:
 * NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node --test scripts/test-agent13-parent-reports.cjs
 *
 * Focused source/model/API contract tests. React, authentication, database,
 * content and network are mocked: this script never contacts production.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const files = [
  "src/lib/parent-reports.ts",
  "src/server/api/parent/dashboard/GET.ts",
  "src/server/api/children/[childId]/progress/GET.ts",
  "src/components/parent/usePrivateGet.ts",
  "src/components/parent/ParentChildReport.tsx",
  "src/pages/parent-dashboard.tsx",
];

function source(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function compile(file) {
  const output = ts.transpileModule(source(file), {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
    },
  });
  const errors = (output.diagnostics || []).filter(
    (item) => item.category === ts.DiagnosticCategory.Error,
  );
  assert.equal(errors.length, 0, file);
  return output.outputText;
}

function load(file, mocks = {}) {
  const module = { exports: {} };
  new Function("require", "module", "exports", compile(file))(
    (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id];
      throw new Error("Unmocked dependency: " + id);
    },
    module,
    module.exports,
  );
  return module.exports;
}

for (const file of files) {
  test("TypeScript/TSX syntax: " + file, () => compile(file));
}

const model = load("src/lib/parent-reports.ts");
const child = {
  id: 1,
  name: "Test Learner",
  age_group: "8-10",
  total_stars: 12,
};
const now = new Date("2026-09-13T10:00:00Z");
const catalog = [
  { id: "game-number-pop", title: "Number Pop", slug: "number-pop" },
  { id: "game-reading-quest", title: "Reading Quest", slug: "reading-quest" },
];
const gameIds = model.knownGameIds(catalog);

function row(id, overrides = {}) {
  return {
    id,
    child_id: 1,
    subject: "maths",
    activity_id: "number-pop",
    activity_title: "Number Pop",
    score: 8,
    max_score: 10,
    duration_seconds: 60,
    stars_earned: 2,
    completed_at: "2026-09-12T10:00:00Z",
    ...overrides,
  };
}

function report(rows = [], overrides = {}) {
  return model.buildChildReport(child, rows, {
    days: 30,
    now,
    gameIds,
    ...overrides,
  });
}

function category(data, kind) {
  return data.categories.find((item) => item.kind === kind);
}

test("strict child identifiers and reporting periods reject ambiguous values", () => {
  assert.equal(model.parseChildId("12"), 12);
  for (const value of [
    undefined,
    null,
    1,
    "1x",
    "1.5",
    "-1",
    "0",
    "01",
    " 1",
    ["1"],
    "9007199254740992",
  ]) {
    assert.equal(model.parseChildId(value), null);
  }
  assert.equal(model.parseReportDays(undefined), 30);
  for (const value of ["7", "30", "90"])
    assert.equal(model.parseReportDays(value), Number(value));
  for (const value of ["0", "365", "", ["30"], 30])
    assert.equal(model.parseReportDays(value), null);
});

test("child profile parser accepts only the display fields needed by reports", () => {
  assert.deepEqual(
    model.parseChildren([
      {
        id: 1,
        name: child.name,
        ageGroup: "8-10",
        totalStars: 12,
        parentId: "private",
        email: "private",
      },
    ]),
    [child],
  );
  assert.deepEqual(
    model.parseChildren({
      children: [{ ...child, id: "1", total_stars: "12" }],
    }),
    [child],
  );
  assert.deepEqual(model.parseChildren([]), []);
  for (const value of [
    null,
    {},
    [null],
    [{ id: 0, name: "No" }],
    [child, child],
  ]) {
    assert.throws(() => model.parseChildren(value));
  }
});

test("scores are percentages; genuine zero is distinct from missing or impossible scores", () => {
  assert.equal(model.scorePercent(25, 50), 50);
  assert.equal(model.scorePercent(0, 10), 0);
  for (const pair of [
    [null, 10],
    [undefined, 100],
    ["", 10],
    [10, 0],
    [-1, 10],
    [11, 10],
  ]) {
    assert.equal(model.scorePercent(pair[0], pair[1]), null);
  }
});

test("saved lesson, game, reading and homework activity stay distinct", () => {
  const data = report([
    row(1),
    row(2, { activity_id: "lesson-maths-1" }),
    row(3, { activity_id: "reading-book-1", subject: "reading" }),
    row(4, { activity_id: "homework-1" }),
    row(5, { activity_id: "reading-quest", subject: "reading" }),
    row(6, { activity_id: "legacy-mystery" }),
  ]);
  assert.equal(category(data, "games").sessions, 2);
  for (const kind of ["lessons", "reading", "homework", "other"]) {
    assert.equal(category(data, kind).sessions, 1);
  }
  assert.equal(
    data.categories.reduce((total, item) => total + item.sessions, 0),
    6,
  );
});

test("known game IDs cover title slugs and scanner activity IDs classify safely", () => {
  assert.ok(gameIds.has("number-pop"));
  assert.ok(gameIds.has("game-number-pop"));
  assert.equal(model.activityKind("game-new-one", "science", gameIds), "games");
  assert.equal(
    model.activityKind("scan-reading:page", "english", gameIds),
    "reading",
  );
  assert.equal(
    model.activityKind("scan-homework:page", "maths", gameIds),
    "homework",
  );
});

test("report calculation removes cross-child, duplicate, invalid, future and expired records", () => {
  const data = report([
    row(1),
    row(1),
    row(2, { child_id: 2 }),
    row(3, { completed_at: "invalid" }),
    row(4, { completed_at: "2026-09-14T10:00:00Z" }),
    row(5, { completed_at: "2026-01-01T10:00:00Z" }),
    row(6, { completed_at: null }),
    row(-1),
  ]);
  assert.equal(data.totalSessions, 1);
  assert.deepEqual(
    data.recent.map((item) => item.id),
    [1],
  );
});

test("date boundaries, stars, recent ordering and record cap remain honest", () => {
  const boundary = report(
    [
      row(1, { completed_at: "2026-09-06T10:00:00Z", stars_earned: 4 }),
      row(2, { completed_at: now, stars_earned: 2 }),
      row(3, { completed_at: "2026-09-06T09:59:59Z" }),
    ],
    { days: 7 },
  );
  assert.equal(boundary.totalSessions, 2);
  assert.equal(boundary.subjects[0].stars, 6);
  const many = report(
    Array.from({ length: 30 }, (_, index) => row(index + 1)),
    { truncated: true },
  );
  assert.equal(many.recent.length, 20);
  assert.equal(many.recent[0].id, 30);
  assert.equal(many.truncated, true);
});

test("strength/support labels require enough marked evidence and use percentage thresholds", () => {
  assert.equal(report([row(1), row(2)]).subjects[0].status, "early");
  assert.equal(report([row(1), row(2), row(3)]).subjects[0].status, "strength");
  for (const pair of [
    [59, "practice"],
    [60, "building"],
    [79, "building"],
    [80, "strength"],
  ]) {
    const data = report(
      [1, 2, 3].map((id) => row(id, { score: pair[0], max_score: 100 })),
    );
    assert.equal(data.subjects[0].status, pair[1]);
  }
  const unmarked = report([
    row(1, { score: 0 }),
    row(2, { score: null }),
    row(3, { score: null }),
  ]);
  assert.equal(unmarked.subjects[0].assessed, 1);
  assert.equal(unmarked.needsHelp.length, 0);
});

test("trends and suggestions are age-aware, local and never generated as navigation", () => {
  const trend = report([
    row(4, { score: 10 }),
    row(2, { score: 50, max_score: 100 }),
    row(1, { score: 5 }),
    row(3, { score: 100, max_score: 100 }),
  ]);
  assert.equal(trend.subjects[0].averageScore, 75);
  assert.equal(trend.subjects[0].trend, 50);
  const recommendations = report(
    [1, 2, 3].flatMap((id) => [
      row(id),
      row(id + 10, { subject: "reading", activity_id: "book-one", score: 3 }),
    ]),
  ).recommendations;
  assert.equal(recommendations[0].href, "/reading");
  assert.ok(
    recommendations.every(
      (item) => item.href === "/reading" || item.href === "/lesson-library",
    ),
  );
  assert.match(recommendations[0].guidance, /8-10/);
});

async function parentApi(options = {}) {
  const config = {
    session: { user: { id: "parent-A" } },
    query: { childId: "1" },
    childRows: [child],
    activityRows: [],
    failure: false,
    ...options,
  };
  const queries = [];
  const headers = {};
  const handler = load("src/server/api/parent/dashboard/GET.ts", {
    "@/server/db/client": {
      db: {
        execute: async (query) => {
          queries.push(query);
          if (config.failure) throw new Error("secret SQL parent details");
          return [
            queries.length === 1 ? config.childRows : config.activityRows,
          ];
        },
      },
    },
    "drizzle-orm": {
      sql: (strings, ...values) => ({ text: strings.join("?"), values }),
    },
    "@/lib/auth/auth": {
      getAuth: () => ({ api: { getSession: async () => config.session } }),
    },
    "virtual:content": { games: { games: catalog } },
    "@/lib/parent-reports": model,
  }).default;
  const response = {
    code: 200,
    setHeader(key, value) {
      headers[key] = value;
    },
    vary(value) {
      headers.Vary = [headers.Vary, value].filter(Boolean).join(", ");
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  await handler({ headers: {}, query: config.query }, response);
  return { ...response, queries, headers };
}

test("parent report API rejects unauthorised or malformed reads before DB activity", async () => {
  const unauthenticated = await parentApi({ session: null });
  assert.equal(unauthenticated.code, 401);
  assert.equal(unauthenticated.queries.length, 0);
  for (const query of [
    { childId: "1x" },
    { childId: ["1"] },
    { childId: "1", days: "365" },
    {},
  ]) {
    const result = await parentApi({ query });
    assert.equal(result.code, 400);
    assert.equal(result.queries.length, 0);
  }
});

test("parent report API returns a non-enumerating result before activity data for non-owners", async () => {
  const result = await parentApi({ childRows: [] });
  assert.equal(result.code, 404);
  assert.equal(result.queries.length, 1);
  assert.ok(result.queries[0].text.includes("parent_id = ?"));
  assert.ok(result.queries[0].values.includes("parent-A"));
});

test("parent report API scopes both selects, limits history and preserves certificate subjects", async () => {
  const result = await parentApi({
    activityRows: [row(1, { completed_at: new Date() })],
  });
  assert.equal(result.code, 200);
  assert.equal(result.body.report.childId, 1);
  assert.equal(result.body.report.totalSessions, 1);
  assert.deepEqual(result.body.subjects, [
    { subject: "maths", games_played: 1, stars: 2 },
  ]);
  assert.equal(result.queries.length, 2);
  assert.ok(
    result.queries.every((query) => query.text.trim().startsWith("SELECT")),
  );
  assert.ok(result.queries.every((query) => query.values.includes("parent-A")));
  assert.ok(result.queries[1].text.includes("FROM activity_sessions"));
  assert.ok(result.queries[1].values.includes(501));
});

test("parent report API makes the 500-record cap explicit and sanitises errors", async () => {
  const capped = await parentApi({
    activityRows: Array.from({ length: 501 }, (_, index) =>
      row(index + 1, { completed_at: new Date() }),
    ),
  });
  assert.equal(capped.body.report.totalSessions, 500);
  assert.equal(capped.body.report.truncated, true);
  for (const options of [
    {},
    { session: null },
    { childRows: [] },
    { failure: true },
    { query: {} },
  ]) {
    const result = await parentApi(options);
    assert.match(result.headers["Cache-Control"], /private, no-store/);
    assert.equal(result.headers.Vary, "Cookie");
    assert.equal(result.headers["X-Robots-Tag"], "noindex, nofollow");
    assert.doesNotMatch(JSON.stringify(result.body), /secret SQL/);
  }
});

function chain(result, calls, name) {
  return {
    from(table) {
      calls.push({ name, stage: "from", table });
      return this;
    },
    where(condition) {
      calls.push({ name, stage: "where", condition });
      return this;
    },
    orderBy(order) {
      calls.push({ name, stage: "orderBy", order });
      return this;
    },
    limit(value) {
      calls.push({ name, stage: "limit", value });
      return Promise.resolve(result);
    },
  };
}

async function progressApi(options = {}) {
  const config = {
    session: { user: { id: "parent-A" } },
    params: { childId: "1" },
    childRows: [{ id: 1, totalStars: 9 }],
    recent: [{ id: 8 }],
    summaries: [{ id: 6 }],
    failure: false,
    ...options,
  };
  const calls = [];
  const headers = {};
  let unshapedSelects = 0;
  const db = {
    select(fields) {
      calls.push({ name: "select", fields });
      if (config.failure) throw new Error("database child details");
      if (fields) return chain(config.childRows, calls, "owner");
      unshapedSelects += 1;
      return chain(
        unshapedSelects === 1 ? config.recent : config.summaries,
        calls,
        unshapedSelects === 1 ? "recent" : "summaries",
      );
    },
  };
  const columns = {
    children: {
      id: "child-id",
      parentId: "parent-id",
      totalStars: "total-stars",
    },
    activitySessions: {
      childId: "activity-child-id",
      completedAt: "completed-at",
    },
    progressSummaries: { childId: "summary-child-id", weekStart: "week-start" },
  };
  const handler = load("src/server/api/children/[childId]/progress/GET.ts", {
    "../../../../db/client.js": { db },
    "../../../../db/schema.js": columns,
    "drizzle-orm": {
      eq: (left, right) => ({ eq: [left, right] }),
      and: (...items) => ({ and: items }),
      desc: (column) => ({ desc: column }),
    },
    "@/lib/auth/auth": {
      getAuth: () => ({ api: { getSession: async () => config.session } }),
    },
    "@/lib/parent-reports": model,
  }).default;
  const response = {
    code: 200,
    setHeader(key, value) {
      headers[key] = value;
    },
    vary(value) {
      headers.Vary = [headers.Vary, value].filter(Boolean).join(", ");
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  await handler({ headers: {}, params: config.params }, response);
  return { ...response, calls, headers };
}

test("child progress read authenticates and validates before selecting data", async () => {
  const unauthenticated = await progressApi({ session: null });
  assert.equal(unauthenticated.code, 401);
  assert.equal(unauthenticated.calls.length, 0);
  const malformed = await progressApi({ params: { childId: "1x" } });
  assert.equal(malformed.code, 400);
  assert.equal(malformed.calls.length, 0);
});

test("child progress read checks ownership before recent or summary records", async () => {
  const missing = await progressApi({ childRows: [] });
  assert.equal(missing.code, 404);
  assert.equal(
    missing.calls.filter((item) => item.name === "select").length,
    1,
  );
  const ownerWhere = missing.calls.find(
    (item) => item.name === "owner" && item.stage === "where",
  );
  assert.deepEqual(
    ownerWhere.condition.and.map((item) => item.eq[1]),
    [1, "parent-A"],
  );
});

test("child progress read returns only the verified profile and private cache headers", async () => {
  const result = await progressApi();
  assert.equal(result.code, 200);
  assert.deepEqual(result.body, {
    recent: [{ id: 8 }],
    summaries: [{ id: 6 }],
    totalStars: 9,
  });
  assert.equal(result.calls.filter((item) => item.name === "select").length, 3);
  assert.match(result.headers["Cache-Control"], /private, no-store/);
  assert.equal(result.headers.Vary, "Cookie");
});

test("child progress errors are generic and do not expose DB messages", async () => {
  const result = await progressApi({ failure: true });
  assert.equal(result.code, 500);
  assert.doesNotMatch(JSON.stringify(result.body), /database child details/);
});

test("client report parser rejects a different child and strips extra profile fields", () => {
  const parser = load("src/components/parent/ParentChildReport.tsx", {
    react: { useCallback: (fn) => fn },
    "react/jsx-runtime": {
      jsx: () => ({}),
      jsxs: () => ({}),
      Fragment: "fragment",
    },
    "react-router": { Link: "Link" },
    "@/lib/parent-reports": model,
    "./usePrivateGet": { usePrivateGet: () => ({}) },
  }).parseDashboard;
  const data = { child: { ...child, parent_id: "private" }, report: report() };
  assert.equal(parser(data, 1).child.parent_id, undefined);
  assert.throws(() => parser(data, 2));
  assert.throws(() =>
    parser({ ...data, report: { ...data.report, childId: 2 } }, 1),
  );
});

test("parent report sources avoid device memory, automatic reports, payment controls and payload logging", () => {
  const changed = files.map(source).join("\n");
  for (const prohibited of [
    "localStorage",
    "sessionStorage",
    "loadTutorMemory",
    "weekly-email",
    "ParentSubscriptionStatus",
    "console.log",
    "console.error",
  ]) {
    assert.doesNotMatch(changed, new RegExp(prohibited.replace(".", "\\.")));
  }
  const page = source("src/pages/parent-dashboard.tsx");
  assert.match(page, /key=\{user.id\}/);
  const childReportKey =
    "key={" +
    String.fromCharCode(96) +
    "$" +
    "{selected.id}:$" +
    "{days}" +
    String.fromCharCode(96) +
    "}";
  assert.ok(page.includes(childReportKey));
  const hook = source("src/components/parent/usePrivateGet.ts");
  assert.match(hook, /credentials:\s*["']include["']/);
  assert.match(hook, /cache:\s*["']no-store["']/);
  assert.match(hook, /AbortController/);
});
