/** Executes real handler source with isolated dependency doubles, not a live database/browser. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import * as policy from '../src/lib/auth/account-reliability.ts';
import * as cookies from '../src/lib/auth/session-cookies.ts';
const require = createRequire(import.meta.url);
const ts = require(process.env.AGENT29_TYPESCRIPT_PATH || 'typescript');

function load(path, overrides = {}, env = {}) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
  assert.equal(compiled.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length, 0);
  const module = { exports: {} };
  const dependencies = { '@/lib/auth/account-reliability': policy, './auth/account-reliability': policy, '@/lib/auth/session-cookies': cookies, ...overrides };
  const logs = [];
  const sandbox = {
    module, exports: module.exports, Buffer, Headers, Request, Response, Error, Date,
    process: { env: { NODE_ENV: 'test', ...env } },
    console: { error: (...args) => logs.push(args), warn: (...args) => logs.push(args) },
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name === 'node:crypto') return require(name);
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(compiled.outputText, sandbox, { filename: path });
  return { ...module.exports, logs };
}
function response() {
  return { statusCode: 200, headers: {}, body: undefined,
    setHeader(key,value) { this.headers[key.toLowerCase()] = value; return this; },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
  };
}
const req = { headers: {}, query: { childId: '7' }, body: {}, protocol: 'https', get: () => 'untrusted.example' };

for (const user of [null, {id:'child',role:'child'}, {id:'student',role:'student'}, {id:'teacher',role:'teacher'}, {id:'child',role:'child',isAdmin:true}, {id:'unknown'}]) {
  test(`parent API denies ${user?.role || 'unauthenticated/unknown'} before any data query`, async () => {
    let queries = 0;
    const { default: handler } = load('src/server/api/parent/dashboard/GET.ts', {
      '@/lib/auth/auth': { getAuth: () => ({api:{getSession:async () => user ? {user} : null}}) },
      '@/server/db/client': {db:{execute:async () => {queries++; return [[]];}}},
      'drizzle-orm': {sql:()=>null},
    });
    const res=response(); await handler(req,res);
    assert.equal(res.statusCode, user ? 403 : 401); assert.equal(queries,0);
  });
}
test('parent API preserves the child ownership restriction', async () => {
  let query;
  const {default:handler}=load('src/server/api/parent/dashboard/GET.ts', {
    '@/lib/auth/auth':{getAuth:()=>({api:{getSession:async()=>({user:{id:'test-parent',role:'parent'}})}})},
    '@/server/db/client':{db:{execute:async q=>{query=q; return [[]];}}},
    'drizzle-orm':{sql:(strings,...values)=>({strings,values})},
  });
  const res=response(); await handler(req,res);
  assert.equal(res.statusCode,403); assert.deepEqual(query.values,[7,'test-parent']);
});
test('parent API returns owned child data after role and ownership checks', async () => {
  const results=[[[{id:7,name:'Test Child',age_group:'5-7',total_stars:3}]], [[]], [[{total:0}]], [[]], [[]], [[{total:0}]]];
  const {default:handler}=load('src/server/api/parent/dashboard/GET.ts', {
    '@/lib/auth/auth':{getAuth:()=>({api:{getSession:async()=>({user:{id:'test-parent',role:'parent'}})}})},
    '@/server/db/client':{db:{execute:async()=>results.shift()}}, 'drizzle-orm':{sql:()=>null},
  });
  const res=response(); await handler(req,res);
  assert.equal(res.statusCode,200); assert.equal(res.body.child.id,7); assert.equal(results.length,0);
  assert.equal(res.headers['cache-control'],'no-store');
});
for (const [user, expected] of [[null,false],[{id:'parent',role:'parent'},false],[{id:'teacher',role:'teacher'},false],[{id:'child',role:'child',isAdmin:true},false],[{id:'admin',role:'parent',isAdmin:true},true]]) {
  test(`server admin authorization: ${JSON.stringify(user)} => ${expected}`, async () => {
    const auth=load('src/server/admin-auth.ts', {'@/lib/auth/auth':{getAuth:()=>({api:{getSession:async()=>user?{user}:null}})}});
    assert.equal(await auth.hasAdminAccess({headers:{}}),expected);
  });
}
test('a valid old founder cookie cannot override a child account', async () => {
  let currentUser = null;
  const auth=load('src/server/admin-auth.ts', {'@/lib/auth/auth':{getAuth:()=>({api:{getSession:async()=>currentUser?{user:currentUser}:null}})}}, {
    BETTER_AUTH_SECRET:'isolated-agent29-test-signing-key-never-for-production', ADMIN_MASTER_CODE:'isolated-test-code',
  });
  let issued;
  assert.equal(auth.issueFounderSession({cookie:(name,value)=>{issued=`${name}=${value}`;}}),true);
  assert.equal(await auth.hasAdminAccess({headers:{cookie:issued}}),true);
  currentUser={id:'child',role:'child',isAdmin:true};
  assert.equal(await auth.hasAdminAccess({headers:{cookie:issued}}),false);
});
test('server admin fails closed when session lookup fails', async () => {
  const auth=load('src/server/admin-auth.ts', {'@/lib/auth/auth':{getAuth:()=>{throw new Error('unavailable');}}});
  assert.equal(await auth.hasAdminAccess({headers:{}}),false);
});
for (const email of ['known@example.test','unknown@example.test']) {
  test(`reset request uses fixed safe callback and generic response for ${email}`, async () => {
    let payload;
    const {default:handler}=load('src/server/api/auth/forgot-password/POST.ts', {
      '@/lib/auth/auth':{getAuth:()=>({api:{requestPasswordReset:async value=>{payload=value;}}})},
    }, {NODE_ENV:'production'});
    const res=response(); await handler({...req,body:{email}},res);
    assert.equal(res.body.ok,true); assert.equal(payload.body.redirectTo,'https://sodafom.uk/hub/reset-password');
    assert.equal(res.headers['cache-control'],'no-store');
  });
}
test('reset configuration failure is not reported as successful delivery', async () => {
  const {default:handler,logs}=load('src/server/api/auth/forgot-password/POST.ts', {'@/lib/auth/auth':{getAuth:()=>{throw new Error('private diagnostic');}}});
  const res=response(); await handler({...req,body:{email:'test@example.test'}},res);
  assert.equal(res.statusCode,503); assert.equal(res.body.ok,undefined);
  assert.doesNotMatch(JSON.stringify([res.body,logs]),/private diagnostic|test@example.test/);
});
test('reset processing errors remain generic to avoid revealing account existence', async () => {
  const {default:handler,logs}=load('src/server/api/auth/forgot-password/POST.ts', {'@/lib/auth/auth':{getAuth:()=>({api:{requestPasswordReset:async()=>{throw new Error('private mail detail');}}})}});
  const res=response(); await handler({...req,body:{email:'test@example.test'}},res);
  assert.equal(res.body.ok,true); assert.doesNotMatch(JSON.stringify(logs),/private mail detail|test@example.test/);
});
for (const email of ['',{},'not-an-address','a'.repeat(255)+'@example.test']) {
  test(`invalid reset input ${typeof email} is rejected before auth`, async () => {
    const {default:handler}=load('src/server/api/auth/forgot-password/POST.ts', {'@/lib/auth/auth':{getAuth:()=>{throw new Error('must not call');}}});
    const res=response(); await handler({...req,body:{email}},res); assert.equal(res.statusCode,400);
  });
}
test('successful account logout clears founder and BetterAuth cookies together', async () => {
  let forwarded;
  const {authHandler}=load('src/server/auth-middleware.ts', {
    '@/lib/auth/auth':{getAuth:()=>({handler:async()=>Response.json({success:true},{headers:{'set-cookie':'better-auth.session_token=; Path=/; Max-Age=0'}})})},
    '@/lib/auth/express-adapter':{toWebRequest:()=>new Request('https://localhost/api/auth/sign-out',{method:'POST'}),sendWebResponse:async r=>{forwarded=r;}},
  }, {NODE_ENV:'production'});
  await authHandler({...req,method:'POST',path:'/api/auth/sign-out',secure:true},response());
  const setCookies=forwarded.headers.getSetCookie();
  assert.equal(setCookies.length,2); assert.ok(setCookies.some(c=>c.startsWith('sodafom_founder_session=;')&&c.includes('; Secure')));
});
test('failed logout does not falsely clear founder credentials', async () => {
  let forwarded;
  const {authHandler}=load('src/server/auth-middleware.ts', {
    '@/lib/auth/auth':{getAuth:()=>({handler:async()=>Response.json({error:'unavailable'},{status:503})})},
    '@/lib/auth/express-adapter':{toWebRequest:()=>new Request('https://localhost'),sendWebResponse:async r=>{forwarded=r;}},
  });
  await authHandler({...req,method:'POST',path:'/api/auth/sign-out'},response());
  assert.equal(forwarded.headers.getSetCookie().length,0); assert.equal(forwarded.status,503);
});
test('teacher helper handles disabled browser storage without a blank page', () => {
  const auth=load('src/lib/teacher-auth.ts');
  assert.equal(auth.getTeacherToken(),null); assert.equal(auth.getTeacherProfile(),null);
  assert.doesNotThrow(auth.clearTeacherSession);
  assert.throws(()=>auth.saveTeacherSession('test-only',{id:1,name:'Test',email:'test@example.test',className:'Test'}),/could not be saved/);
});
function authConfiguration(sendEmail = async () => {}) {
  let options;
  const auth=load('src/lib/auth/auth.ts', {
    'better-auth':{betterAuth:value=>{options=value; return {options};}},
    'better-auth/adapters/drizzle':{drizzleAdapter:()=>({})},
    'node:fs':{existsSync:()=>false,readFileSync:()=>{throw new Error('must not read files');}},
    '@/server/db/client':{db:{}}, '@/server/db/schema':{user:{},session:{},account:{},verification:{}},
    '#airo/secrets':{getSecret:()=> 'isolated-test-signing-key-not-a-production-secret'},
    '@/server/email':{sendEmail},
  },{NODE_ENV:'production'});
  auth.getAuth(); return options;
}
test('auth configuration revokes existing sessions after a password reset', () => {
  assert.equal(authConfiguration().emailAndPassword.revokeSessionsOnPasswordReset,true);
});
test('signup does not allow client-supplied roles or administrator status', () => {
  const fields=authConfiguration().user.additionalFields;
  assert.equal(fields.role.input,false); assert.equal(fields.isAdmin.input,false);
  assert.equal(fields.role.defaultValue,'parent'); assert.equal(fields.isAdmin.defaultValue,false);
});
test('signup completion is not blocked by a pending owner notification', async () => {
  let called=false;
  const options=authConfiguration(()=>{called=true;return new Promise(()=>{});});
  await options.databaseHooks.user.create.after({name:'Test Account',email:'test@example.test'});
  assert.equal(called,true);
});
