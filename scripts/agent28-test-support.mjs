/** Test-only synthetic fixtures. No credentials, production connections or real child records. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const plain = value => JSON.parse(JSON.stringify(value));

export async function loadSource(relativePath, overrides = {}, globals = {}) {
  const context = vm.createContext({
    console, Headers, Response, Request, AbortController, Event, URL,
    setTimeout, clearTimeout, setInterval, clearInterval, fetch, ...globals,
  });
  const modules = new Map();
  async function get(identifier) {
    if (modules.has(identifier)) return modules.get(identifier);
    if (Object.hasOwn(overrides, identifier)) {
      const exports = overrides[identifier];
      const module = new vm.SyntheticModule(Object.keys(exports), function () {
        for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
      }, { context, identifier });
      modules.set(identifier, module);
      return module;
    }
    const code = stripTypeScriptTypes(fs.readFileSync(identifier, 'utf8'), { mode: 'transform', sourceUrl: identifier });
    const module = new vm.SourceTextModule(code, { context, identifier });
    modules.set(identifier, module);
    await module.link(async (specifier, referencing) => {
      if (Object.hasOwn(overrides, specifier)) return get(specifier);
      let resolved = specifier.startsWith('@/') ? path.join(ROOT, 'src', specifier.slice(2))
        : path.resolve(path.dirname(referencing.identifier), specifier);
      if (resolved.endsWith('.js')) resolved = resolved.slice(0, -3) + '.ts';
      else if (!path.extname(resolved)) resolved += '.ts';
      return get(resolved);
    });
    return module;
  }
  const module = await get(path.join(ROOT, relativePath));
  await module.evaluate();
  return module.namespace;
}

export function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, String(value)); },
    removeItem: key => { values.delete(key); },
    clear: () => values.clear(),
    values,
  };
}
const columnNames = {
  children: ['id', 'parentId', 'totalStars'],
  gameLevels: ['id', 'childId', 'gameSlug', 'level', 'bestStars', 'playsAtLevel'],
  activitySessions: ['id', 'childId', 'subject', 'activityId', 'activityTitle', 'score', 'maxScore', 'durationSeconds', 'starsEarned', 'completedAt'],
  progressSummaries: ['id', 'childId', 'subject', 'weekStart', 'totalSessions', 'avgScore', 'totalMinutes'],
  starMilestones: ['id', 'childId', 'milestone', 'promoCode'],
  promoCodes: ['id', 'code', 'description'],
};
export const schema = Object.fromEntries(Object.entries(columnNames).map(([table, names]) => [table, {
  name: table, ...Object.fromEntries(names.map(name => [name, { table, name }])),
}]));
const match = (row, where) => !where || (where.op === 'and'
  ? where.items.every(item => match(row, item))
  : row[where.column.name] instanceof Date || where.value instanceof Date
    ? new Date(row[where.column.name]).getTime() === new Date(where.value).getTime()
    : row[where.column.name] === where.value);
export const orm = {
  eq: (column, value) => ({ op: 'eq', column, value }),
  and: (...items) => ({ op: 'and', items }),
  desc: column => column,
  sql: (_strings, column, amount) => ({ increment: true, column, amount }),
};

export function fakeDatabase(seed = {}) {
  // Transactions are deliberately simulated/serialized here. These tests prove
  // route orchestration and error paths, not MySQL locking or crash durability.
  let state = {
    children: [{ id: 1, parentId: 'parent-a', totalStars: 0 }, { id: 2, parentId: 'parent-b', totalStars: 0 }],
    gameLevels: [], activitySessions: [], progressSummaries: [], starMilestones: [], promoCodes: [],
    ...structuredClone(seed),
  };
  let failAt = null;
  let serial = Promise.resolve();
  const trace = [];
  function step(operation) {
    trace.push(operation);
    if (operation === failAt) throw new Error('synthetic-private-driver-detail');
  }
  function connection(getState) {
    return {
      select(selection) {
        let table, condition, maximum = Infinity, descending;
        const query = {
          from(value) { table = value.name; return query; },
          where(value) { condition = value; return query; },
          limit(value) { maximum = value; return query; },
          orderBy(value) { descending = value; return query; },
          for(value) { trace.push(`lock:${table}:${value}`); return query; },
          then(resolve, reject) {
            return Promise.resolve().then(() => {
              step(`select:${table}`);
              let rows = getState()[table].filter(row => match(row, condition));
              if (descending) rows = rows.slice().sort((a, b) => +new Date(b[descending.name]) - +new Date(a[descending.name]));
              return rows.slice(0, maximum).map(row => selection
                ? Object.fromEntries(Object.entries(selection).map(([key, col]) => [key, row[col.name]]))
                : structuredClone(row));
            }).then(resolve, reject);
          },
        };
        return query;
      },
      insert(table) {
        return { values: async value => {
          step(`insert:${table.name}`);
          const rows = getState()[table.name];
          rows.push({ id: Math.max(0, ...rows.map(row => row.id)) + 1, ...structuredClone(value) });
        } };
      },
      update(table) {
        return { set: value => ({ where: async condition => {
          step(`update:${table.name}`);
          for (const row of getState()[table.name].filter(row => match(row, condition))) {
            for (const [key, next] of Object.entries(value)) {
              row[key] = next?.increment ? row[next.column.name] + next.amount : structuredClone(next);
            }
          }
        } }) };
      },
    };
  }
  const db = {
    ...connection(() => state),
    transaction(callback) {
      const run = async () => {
        step('begin');
        const draft = structuredClone(state);
        try {
          const result = await callback(connection(() => draft));
          step('commit');
          state = draft;
          return result;
        } catch (error) { trace.push('rollback'); throw error; }
      };
      const result = serial.then(run);
      serial = result.catch(() => undefined);
      return result;
    },
  };
  return { db, trace, state: () => structuredClone(state), fail: point => { failAt = point; } };
}

export async function routes(database, getSession = async () => ({ user: { id: 'parent-a' } })) {
  const overrides = {
    [path.join(ROOT, 'src/server/db/client.ts')]: { db: database.db },
    [path.join(ROOT, 'src/server/db/schema.ts')]: schema,
    'drizzle-orm': orm,
    '@/lib/auth/auth': { getAuth: () => ({ api: { getSession } }) },
  };
  const base = 'src/server/api/children/[childId]/';
  return {
    gameGet: (await loadSource(base + 'game-level/[gameSlug]/GET.ts', overrides)).default,
    gamePost: (await loadSource(base + 'game-level/[gameSlug]/POST.ts', overrides)).default,
    progressPost: (await loadSource(base + 'progress/POST.ts', overrides)).default,
    progressGet: (await loadSource(base + 'progress/GET.ts', overrides)).default,
  };
}
export async function invoke(handler, { childId = '1', gameSlug = 'number-pop', body = {}, headers = {} } = {}) {
  const res = {
    code: 200, headers: {}, body: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = plain(body); return this; },
  };
  await handler({ params: { childId, gameSlug }, headers, body }, res);
  return res;
}
