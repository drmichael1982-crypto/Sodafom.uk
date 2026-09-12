// Focused regression tests; mocked HTTP/DB/provider boundaries, not a live-site test.
// Run: node --test scripts/test-admin-paid-ai-guard.mjs
import assert from 'node:assert/strict';
import { test, afterEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { scryptSync } from 'node:crypto';
const require = createRequire(import.meta.url);
let ts;
try { ts = require('typescript'); }
catch { ts = require(resolve(execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim(), 'typescript')); }
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const keys = ['NODE_ENV', 'ADMIN_MASTER_CODE', 'ADMIN_MASTER_CODE_HASH', 'BETTER_AUTH_SECRET', 'FOUNDER_EMAIL', 'ADMIN_OPEN_MODE', 'OPENAI_API_KEY'];
const saved = Object.fromEntries(keys.map(k => [k, process.env[k]]));
const realNow = Date.now;
afterEach(() => {
  Date.now = realNow;
  for (const k of keys) saved[k] === undefined ? delete process.env[k] : process.env[k] = saved[k];
});
function setup() {
  for (const k of keys) delete process.env[k];
  process.env.NODE_ENV = 'production';
  process.env.ADMIN_MASTER_CODE = '2468'; // Dummy test value, never the production code.
  process.env.BETTER_AUTH_SECRET = 'dummy-test-signing-secret-not-for-production';
  process.env.FOUNDER_EMAIL = 'owner@example.test';
}
function response() {
  return { statusCode: 200, body: undefined, headers: {}, cookies: {},
    status(n) { this.statusCode = n; return this; },
    json(v) { this.body = v; return this; }, send(v) { this.body = v; return this; },
    type(v) { this.headers['Content-Type'] = v; return this; },
    setHeader(k, v) { this.headers[k] = v; },
    cookie(k, v, options) { this.cookies[k] = { value: v, options }; return this; },
  };
}
const request = (body = {}, cookie = '') => ({ body, headers: { cookie }, ip: '192.0.2.1', socket: { remoteAddress: '192.0.2.1' } });
function harness() {
  setup();
  const state = { account: null, authError: false, providers: 0, reads: 0, writes: [], cache: new Map() };
  const db = {
    select() { state.reads++; return { from() { return { async orderBy() { return [{ id: 1, enabled: false }]; } }; } }; },
    update() { return { set(value) { return { async where() { state.writes.push(value); } }; } }; },
  };
  function load(path) {
    if (state.cache.has(path)) return state.cache.get(path);
    const source = readFileSync(resolve(root, path), 'utf8');
    const output = ts.transpileModule(source, { fileName: path, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true, strict: true } });
    assert.equal((output.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error).length, 0, `${path}: TypeScript syntax`);
    const mod = { exports: {} };
    const mockedRequire = name => {
      if (name === '@/lib/auth/auth') return { getAuth: () => ({ api: { getSession: async () => { if (state.authError) throw Error('mock DB offline'); return state.account ? { user: state.account } : null; } } }) };
      if (name === '@/server/admin-auth') return load('src/server/admin-auth.ts');
      if (name === '@/server/paid-ai-guard') return load('src/server/paid-ai-guard.ts');
      if (name === '@/server/db/client') return { db };
      if (name === '@/server/db/schema') return { aiVoucherPacks: { id: 'id', sortOrder: 'sortOrder' } };
      if (name === 'drizzle-orm') return { asc: x => x, eq: (...x) => x };
      if (name === '@/lib/chatbot/chat-config') return { SYSTEM_PROMPT: 'Mock tutor' };
      if (name === 'openai') { const Provider = class { constructor() { state.providers++; throw Error('Provider must not be called'); } }; return { __esModule: true, default: Provider, toFile: () => { throw Error('No upload permitted'); } }; }
      return require(name);
    };
    runInNewContext(output.outputText, { module: mod, exports: mod.exports, require: mockedRequire, process, Buffer, Headers, Date, console }, { filename: path });
    state.cache.set(path, mod.exports);
    return mod.exports;
  }
  const auth = load('src/server/admin-auth.ts');
  const signedRequest = (body = {}) => { const res = response(); assert.equal(auth.issueFounderSession(res), true); return request(body, `sodafom_founder_session=${res.cookies.sodafom_founder_session.value}`); };
  return { state, auth, load, signedRequest };
}
test('missing configuration fails closed', () => { const { auth } = harness(); delete process.env.ADMIN_MASTER_CODE; assert.equal(auth.adminSecurityConfigured(), false); assert.equal(auth.issueFounderSession(response()), false); });
test('code verification accepts only the correct string', () => { const { auth } = harness(); assert.equal(auth.isConfiguredAdminCode('2468'), true); for (const v of ['wrong', '', null, {}, 2468, [], 'x'.repeat(129)]) assert.equal(auth.isConfiguredAdminCode(v), false); });
test('salted hash is preferred over the legacy plaintext value', () => { const { auth } = harness(); const salt = 'ab'.repeat(16); process.env.ADMIN_MASTER_CODE_HASH = `scrypt$${salt}$${scryptSync('9753', Buffer.from(salt, 'hex'), 32).toString('hex')}`; assert.equal(auth.isConfiguredAdminCode('9753'), true); assert.equal(auth.isConfiguredAdminCode('2468'), false); });
test('malformed configured hash cannot fall back to a legacy code', () => { const { auth } = harness(); process.env.ADMIN_MASTER_CODE_HASH = 'broken'; assert.equal(auth.isConfiguredAdminCode('2468'), false); });
test('founder cookie is HTTP-only, secure and short-lived', () => { const { auth } = harness(); const r = response(); assert.equal(auth.issueFounderSession(r), true); const c = r.cookies.sodafom_founder_session; assert.equal(c.options.httpOnly, true); assert.equal(c.options.secure, true); assert.equal(c.options.sameSite, 'strict'); assert.equal(c.options.maxAge, 7200000); assert.equal(auth.hasFounderSession(request({}, `sodafom_founder_session=${c.value}`)), true); });
test('changing the code revokes old founder sessions', () => { const { auth, signedRequest } = harness(); const req = signedRequest(); process.env.ADMIN_MASTER_CODE = '9753'; assert.equal(auth.hasFounderSession(req), false); });
test('cookie tampering and malformed encoding are rejected without throwing', () => { const { auth, signedRequest } = harness(); const req = signedRequest(); for (const cookie of ['sodafom_founder_session=%XX', req.headers.cookie + '.extra', 'sodafom_founder_session=0.abc.def', req.headers.cookie.slice(0, -1) + 'z']) assert.equal(auth.hasFounderSession(request({}, cookie)), false); });
test('expired founder session is rejected', () => { const { auth, signedRequest } = harness(); const req = signedRequest(); Date.now = () => realNow() + 7200001; assert.equal(auth.hasFounderSession(req), false); });
test('production open/testing mode cannot bypass Admin', async () => { const { auth } = harness(); process.env.ADMIN_OPEN_MODE = 'true'; assert.equal(await auth.hasAdminAccess(request()), false); });
test('an authenticated administrator can access Admin', async () => { const { auth, state } = harness(); state.account = { isAdmin: true }; assert.equal(await auth.hasAdminAccess(request()), true); });
test('claiming the owner email without verification does not grant Admin', async () => { const { auth, state } = harness(); state.account = { email: 'owner@example.test', emailVerified: false }; assert.equal(await auth.hasAdminAccess(request()), false); state.account.emailVerified = true; assert.equal(await auth.hasAdminAccess(request()), true); });
test('auth database failure does not grant Admin; a valid founder cookie still works', async () => { const { auth, state, signedRequest } = harness(); state.authError = true; assert.equal(await auth.hasAdminAccess(request()), false); assert.equal(await auth.hasAdminAccess(signedRequest()), true); });
test('verify endpoint creates a founder session for the correct code', async () => { const { load } = harness(); const r = response(); await load('src/server/api/admin/verify/POST.ts').default(request({ code: '2468' }), r); assert.equal(r.statusCode, 200); assert.equal(r.body.success, true); assert.ok(r.cookies.sodafom_founder_session); assert.equal(r.headers['Cache-Control'], 'no-store'); });
test('verify rejects malformed bodies and code types', async () => { const { load } = harness(); const verify = load('src/server/api/admin/verify/POST.ts').default; for (const body of [null, {}, { code: 2468 }, { code: {} }, { code: [] }]) { const r = response(); await verify(request(body), r); assert.equal(r.statusCode, 400); } });
test('five failed guesses lock the IP, including a subsequent correct guess', async () => { const { load } = harness(); const verify = load('src/server/api/admin/verify/POST.ts').default; for (let i=0; i<5; i++) { const r=response(); await verify(request({ code: 'wrong' }),r); assert.equal(r.statusCode,401); } const r=response(); await verify(request({ code:'2468' }),r); assert.equal(r.statusCode,429); assert.ok(Number(r.headers['Retry-After'])>0); });
test('global guess cap cannot be bypassed by changing client IP', async () => { const { load } = harness(); const verify = load('src/server/api/admin/verify/POST.ts').default; for(let i=0;i<25;i++){const r=response(); const req=request({code:'wrong'});req.ip=`192.0.2.${i+1}`;await verify(req,r);assert.equal(r.statusCode,401);} const req=request({code:'2468'});req.ip='198.51.100.1';const r=response();await verify(req,r);assert.equal(r.statusCode,429); });
test('guess lock expires after the configured window', async () => { const { load } = harness(); const verify=load('src/server/api/admin/verify/POST.ts').default;for(let i=0;i<5;i++)await verify(request({code:'wrong'}),response()); Date.now=()=>realNow()+16*60000;const r=response();await verify(request({code:'2468'}),r);assert.equal(r.statusCode,200); });
test('anonymous voucher requests cannot read or change packs', async () => { const { load,state }=harness();for(const method of ['GET','POST']){const r=response();await load(`src/server/api/admin/vouchers/${method}.ts`).default(request({id:1}),r);assert.equal(r.statusCode,403);}assert.equal(state.reads,0);assert.equal(state.writes.length,0); });
test('founder PIN session can read voucher settings without an account-admin flag', async()=>{const {load,signedRequest}=harness();const r=response();await load('src/server/api/admin/vouchers/GET.ts').default(signedRequest(),r);assert.equal(r.statusCode,200);assert.equal(r.body.success,true);assert.equal(r.body.paidAiAvailable,false);});
test('voucher update rejects malformed or misleading enabled values',async()=>{const{load,signedRequest,state}=harness();const route=load('src/server/api/admin/vouchers/POST.ts').default;for(const body of [null,{id:1,displayName:'Pack',enabled:'false'},{id:1,displayName:'Pack',enabled:true,stripeTestPriceId:{}},{id:1,displayName:'Pack',enabled:true}]){const r=response();await route(signedRequest(body),r);assert.equal(r.statusCode,400);}assert.equal(state.writes.length,0);});
test('saving a test voucher never claims to activate paid AI',async()=>{const{load,signedRequest,state}=harness();const r=response();await load('src/server/api/admin/vouchers/POST.ts').default(signedRequest({id:1,displayName:' Test pack ',enabled:true,stripeTestPriceId:'price_test123'}),r);assert.equal(r.statusCode,200);assert.equal(state.writes.length,1);assert.equal(state.writes[0].displayName,'Test pack');assert.equal(r.body.paidAiAvailable,false);});
for (const [name,path,body] of [
  ['chat','src/server/api/chat/POST.ts',{messages:[{role:'user',content:'What is a planet?'}]}],
  ['photo help','src/server/api/ai-teacher/read-page/POST.ts',{image:'data:image/png;base64,AA==',mode:'homework'}],
  ['transcription','src/server/api/ai/transcribe/POST.ts',{audio:'data:audio/webm;base64,AA=='}],
]) test(`paid ${name} is blocked before provider construction, even with forged credits and Admin session`,async()=>{const{load,signedRequest,state}=harness();process.env.OPENAI_API_KEY='dummy-test-key';const r=response();await load(path).default(signedRequest({...body,credits:999999,freeMode:true,voucher:'test',isAdmin:true}),r);assert.equal(r.statusCode,503);assert.equal(r.headers['X-Sodafom-AI-Status'],'voucher-billing-pending');assert.equal(state.providers,0);});
