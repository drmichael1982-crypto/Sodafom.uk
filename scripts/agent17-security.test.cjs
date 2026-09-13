/* Focused, offline regression tests. Run: node --test scripts/agent17-security.test.cjs
 * Requires the project's TypeScript devDependency. External services, database,
 * React hooks and devices are mocked. This is not a full build/browser test.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const ROOT = path.resolve(__dirname, '..');

function sandbox(env = {}, mocks = {}, globals = {}) {
  const logs = [], cache = new Map();
  const context = vm.createContext({
    Buffer, URL, Headers, Request, Response, Error, Date, Blob,
    process: { env: { NODE_ENV: 'production', ...env } },
    console: Object.fromEntries(['log', 'error', 'warn'].map(level => [level, (...args) => logs.push(args)])),
    ...globals,
  });
  function load(relative) {
    const file = path.resolve(ROOT, relative);
    if (cache.has(file)) return cache.get(file).exports;
    const source = fs.readFileSync(file, 'utf8');
    const compiled = ts.transpileModule(source, {
      fileName: file, reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    assert.deepEqual((compiled.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error), [], relative);
    const mod = { exports: {} }; cache.set(file, mod);
    function localRequire(spec) {
      if (Object.hasOwn(mocks, spec)) return mocks[spec];
      if (spec.startsWith('node:')) return require(spec);
      const candidate = spec.startsWith('@/') ? path.join(ROOT, 'src', spec.slice(2))
        : spec.startsWith('.') ? path.resolve(path.dirname(file), spec) : null;
      if (candidate) {
        for (const suffix of ['', '.ts', '.tsx']) if (fs.existsSync(candidate + suffix)) return load(candidate + suffix);
      }
      throw new Error(`Unmocked dependency: ${spec}`);
    }
    const execute = vm.runInContext(`(function(require,module,exports){${compiled.outputText}\n})`, context, { filename: file });
    execute(localRequire, mod, mod.exports);
    return mod.exports;
  }
  return { load, logs, env: context.process.env };
}
function req(overrides = {}) { return { method: 'POST', path: '/api/example', headers: {}, query: {}, body: {}, ...overrides }; }
function res() {
  return {
    statusCode: 200, headers: {}, body: undefined, headersSent: false, cookies: [],
    setHeader(k,v) { this.headers[k.toLowerCase()] = v; return this; },
    vary(value) { const old = this.headers.vary || ''; this.headers.vary = [...new Set([...old.split(',').map(v=>v.trim()).filter(Boolean), value])].join(', '); return this; },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; return this; },
    type(value) { this.setHeader('Content-Type', value); return this; },
    send(value) { this.body = value; return this; },
    end() { this.ended = true; return this; },
    cookie(...args) { this.cookies.push(args); },
  };
}
const plain = value => JSON.parse(JSON.stringify(value));

test('Origin policy preserves exact site and native origins', () => {
  const { isTrustedOrigin } = sandbox().load('src/lib/auth/trusted-origins.ts');
  for (const origin of ['https://sodafom.uk','https://www.sodafom.uk','https://app.sodafom.uk','http://localhost','https://localhost','capacitor://localhost']) assert.equal(isTrustedOrigin(origin), true);
});
test('Origin policy rejects attacker, opaque, wildcard, malformed and tenant origins', () => {
  const { isTrustedOrigin } = sandbox().load('src/lib/auth/trusted-origins.ts');
  for (const origin of [null, undefined, [], 'null', '*', 'https://evil.example', 'https://sodafom.uk.evil.example', 'https://other.sodafom.uk', 'https://anything.airoapp.ai', 'http://sodafom.uk', 'https://sodafom.uk/path', 'https://sodafom.uk?x=1', 'https://user@sodafom.uk', 'https://sodafom.uk#x', ' https://sodafom.uk', 'https://sodafom.uk:444', 'http://localhost:5173']) assert.equal(isTrustedOrigin(origin), false, String(origin));
});
test('Preview trust requires an explicitly configured individual HTTPS origin', () => {
  const { isTrustedOrigin } = sandbox({ AIRO_PREVIEW: 'true', SODAFOM_TRUSTED_ORIGINS: 'https://preview.airoapp.ai,*,https://*.example,http://evil.example,https://x.example/path,https://user@x.example' }).load('src/lib/auth/trusted-origins.ts');
  assert.equal(isTrustedOrigin('https://preview.airoapp.ai'), true);
  for (const origin of ['https://other.airoapp.ai','http://evil.example','https://x.example']) assert.equal(isTrustedOrigin(origin), false);
});
test('Development loopback ports and explicit LAN origin do not broaden production trust', () => {
  const dev = sandbox({ NODE_ENV: 'development', SODAFOM_TRUSTED_ORIGINS: 'http://192.0.2.3:5173' }).load('src/lib/auth/trusted-origins.ts');
  for (const origin of ['http://localhost:5173','http://127.0.0.1:5173','http://[::1]:5173','http://192.0.2.3:5173']) assert.equal(dev.isTrustedOrigin(origin), true);
  assert.equal(dev.isTrustedOrigin('http://192.0.2.4:5173'), false);
  const prod = sandbox({ SODAFOM_TRUSTED_ORIGINS: 'http://192.0.2.3:5173' }).load('src/lib/auth/trusted-origins.ts');
  assert.equal(prod.isTrustedOrigin('http://192.0.2.3:5173'), false);
});
test('CORS denies untrusted reads, writes and preflights before handlers', () => {
  const { httpSecurity } = sandbox().load('src/server/http-security.ts');
  for (const method of ['GET','POST','DELETE','OPTIONS']) {
    const output = res(); let reached = false;
    httpSecurity(req({ method, headers: { origin: 'https://evil.example' } }), output, () => reached = true);
    assert.equal(reached, false); assert.equal(output.statusCode,403);
    assert.equal(output.headers['access-control-allow-origin'], undefined);
    assert.equal(output.headers['access-control-allow-credentials'], undefined);
  }
});
test('Allowed CORS preserves credentialed clients and merges Vary safely', () => {
  const { httpSecurity } = sandbox().load('src/server/http-security.ts');
  const output = res(); output.setHeader('Vary','Accept-Encoding'); let reached = false;
  httpSecurity(req({ headers: { origin:'https://sodafom.uk' } }), output, () => reached = true);
  assert.equal(reached,true); assert.equal(output.headers['access-control-allow-origin'],'https://sodafom.uk');
  assert.equal(output.headers['access-control-allow-credentials'],'true');
  assert.equal(output.headers.vary,'Accept-Encoding, Origin');
  assert.equal(output.headers['cache-control'],'private, no-store');
  assert.equal(output.headers['permissions-policy'],'camera=(self), microphone=(self)');
  assert.equal(output.headers['referrer-policy'],'strict-origin');
  assert.equal(output.headers['x-content-type-options'],'nosniff');
});
test('Headerless signed webhook/native requests are preserved without wildcard CORS', () => {
  const { httpSecurity } = sandbox().load('src/server/http-security.ts');
  const output = res(); let reached = false;
  httpSecurity(req({ path:'/api/webhook/stripe' }),output,()=>reached=true);
  assert.equal(reached,true); assert.equal(output.headers['access-control-allow-origin'],undefined);
});
test('Browser writes cannot bypass origin checks by omitting Origin', () => {
  const { httpSecurity } = sandbox().load('src/server/http-security.ts');
  for (const site of ['same-site','cross-site']) {
    const output=res(); let reached=false;
    httpSecurity(req({headers:{'sec-fetch-site':site}}),output,()=>reached=true);
    assert.equal(reached,false); assert.equal(output.statusCode,403);
  }
  let reached=false;
  httpSecurity(req({headers:{'sec-fetch-site':'same-origin'}}),res(),()=>reached=true);
  assert.equal(reached,true);
});
test('Allowed API preflight completes without reaching handlers', () => {
  const { httpSecurity }=sandbox().load('src/server/http-security.ts');
  const output=res(); let reached=false;
  httpSecurity(req({method:'OPTIONS',headers:{origin:'http://localhost'}}),output,()=>reached=true);
  assert.equal(reached,false); assert.equal(output.statusCode,204); assert.equal(output.ended,true);
});
test('Error responses and request metadata exclude tokens, paths, queries and raw errors', () => {
  const box=sandbox(); const {apiErrorHandler,requestMetadata}=box.load('src/server/http-security.ts');
  const request=req({path:'/api/parent/private-child-id',url:'/api/parent/private-child-id?token=PRIVATE_VALUE'});
  const output=res(); apiErrorHandler(new Error('PRIVATE_VALUE mysql password'),request,output,()=>{});
  assert.equal(output.statusCode,500); assert.equal(JSON.stringify(output.body).includes('PRIVATE_VALUE'),false);
  assert.equal(JSON.stringify(box.logs).includes('PRIVATE_VALUE'),false);
  assert.equal(JSON.stringify(box.logs).includes('private-child-id'),false);
  assert.deepEqual(plain(requestMetadata(request)),{method:'POST',area:'parent'});
});
test('Body-parser errors preserve safe status codes without reflecting body content', () => {
  const {apiErrorHandler}=sandbox().load('src/server/http-security.ts');
  for (const [type,status] of [['entity.too.large',413],['entity.parse.failed',400]]) {
    const output=res();apiErrorHandler({type,body:'PRIVATE_VALUE'},req(),output,()=>{});assert.equal(output.statusCode,status);
    assert.equal(JSON.stringify(output.body).includes('PRIVATE_VALUE'),false);
  }
});
test('Partially sent API errors do not write a second response or forward raw error', () => {
  const {apiErrorHandler}=sandbox().load('src/server/http-security.ts');
  const output=res(); output.headersSent=true; let forwarded;
  apiErrorHandler(new Error('PRIVATE_VALUE'),req(),output,error=>forwarded=error);
  assert.equal(output.body,undefined);assert.equal(forwarded.message,'API response failed');
});

function authConfig(env={}, getSecret=()=> 'test-only-session-secret-not-a-real-credential') {
  let config; const emails=[];
  const box=sandbox(env, {
    'better-auth':{betterAuth:value=>{config=value;return {}; }},
    'better-auth/adapters/drizzle':{drizzleAdapter:()=>({})},
    '@/server/db/client':{db:{}},'@/server/db/schema':{},
    '#airo/secrets':{getSecret},'@/server/email':{sendEmail:async value=>emails.push(value)},
  });
  const auth=box.load('src/lib/auth/auth.ts');
  return {box,auth,emails,config:()=>config};
}
test('Auth configuration enables CSRF and prohibits client-written roles/admin status', () => {
  const h=authConfig();h.auth.getAuth(); const c=h.config();
  assert.equal(c.advanced.disableCSRFCheck,false);
  assert.equal(c.user.additionalFields.role.input,false);
  assert.equal(c.user.additionalFields.isAdmin.input,false);
  assert.equal(c.user.additionalFields.isAdmin.defaultValue,false);
  assert.equal(c.trustedOrigins(new Request('https://sodafom.uk',{headers:{origin:'https://evil.example'}})).includes('https://evil.example'),false);
  assert.equal(c.emailAndPassword.enabled,true);
});
test('Preview keeps CSRF enabled while preserving secure partitioned cookies', () => {
  const h=authConfig({AIRO_PREVIEW:'true'});h.auth.getAuth(); const c=h.config();
  assert.equal(c.advanced.disableCSRFCheck,false);
  assert.deepEqual(plain(c.advanced.defaultCookieAttributes),{sameSite:'none',secure:true,partitioned:true});
});
test('Missing auth secret fails closed without issuing a session', () => {
  const h=authConfig({},()=>null);assert.throws(()=>h.auth.getAuth(),/BETTER_AUTH_SECRET/);assert.equal(h.config(),undefined);
});
test('Signup and reset email HTML escape user content; operational logs omit personal data', async () => {
  const h=authConfig();h.auth.getAuth();const c=h.config();
  const user={name:'<img src=x onerror=bad>',email:'fixture@example.invalid',phoneNumber:'<b>PRIVATE_PHONE</b>'};
  await c.databaseHooks.user.create.after(user);
  assert.equal(h.emails[0].html.includes('<img src=x'),false);assert.ok(h.emails[0].html.includes('&lt;img'));
  await c.emailAndPassword.sendResetPassword({user,url:'https://sodafom.uk/reset?token=TEST_TOKEN&x=1'});
  assert.ok(h.emails[1].html.includes('TEST_TOKEN&amp;x=1'));
  assert.equal(JSON.stringify(h.box.logs).includes('fixture@example.invalid'),false);
  assert.equal(JSON.stringify(h.box.logs).includes('PRIVATE_PHONE'),false);
});
test('Auth adapter never clones or logs a rejected authentication body', async () => {
  let forwarded;const response={ok:false,status:401,clone:()=>{throw new Error('must not clone');}};
  const box=sandbox({}, {'@/lib/auth/auth':{getAuth:()=>({handler:async()=>response})},
    '@/lib/auth/express-adapter':{toWebRequest:r=>r,sendWebResponse:async value=>forwarded=value},
    '@/lib/auth/session-cookies':{tryClearStaleSession:()=>false}});
  await box.load('src/server/auth-middleware.ts').authHandler(req({path:'/api/auth/sign-in/PRIVATE_VALUE'}),res());
  assert.equal(forwarded,response);assert.equal(JSON.stringify(box.logs).includes('PRIVATE_VALUE'),false);
});
test('Auth infrastructure errors stay generic and private', async () => {
  for (const message of ['BETTER_AUTH_SECRET PRIVATE_VALUE','ECONNREFUSED PRIVATE_VALUE','ER_NO_SUCH_TABLE PRIVATE_VALUE','PRIVATE_VALUE']) {
    const box=sandbox({}, {'@/lib/auth/auth':{getAuth:()=>{throw new Error(message);}},
      '@/lib/auth/express-adapter':{},'@/lib/auth/session-cookies':{tryClearStaleSession:()=>false}});
    const output=res();await box.load('src/server/auth-middleware.ts').authHandler(req(),output);
    assert.equal(JSON.stringify([box.logs,output.body]).includes('PRIVATE_VALUE'),false);
    assert.ok([500,503].includes(output.statusCode));
  }
});
test('Stale-cookie recovery still works without initialising auth', async () => {
  const box=sandbox({}, {'@/lib/auth/auth':{getAuth:()=>{throw new Error('must not initialise');}},
    '@/lib/auth/express-adapter':{},'@/lib/auth/session-cookies':{tryClearStaleSession:()=>true}});
  await box.load('src/server/auth-middleware.ts').authHandler(req(),res());assert.equal(box.logs.length,0);
});

function parentHandler(user, rows=[], failure=null) {
  const queries=[];
  const box=sandbox({}, {'@/lib/auth/auth':{getAuth:()=>({api:{getSession:async()=>user?{user}:null}})},
    'drizzle-orm':{sql:(strings,...values)=>({text:strings.join('?'),values})},
    '@/server/db/client':{db:{execute:async query=>{queries.push(query);if(failure)throw failure;return [rows[queries.length-1]||[]];}}}});
  return {handler:box.load('src/server/api/parent/dashboard/GET.ts').default,queries,box};
}
test('Parent report rejects unauthenticated callers before querying data', async () => {
  const h=parentHandler(null);const output=res();await h.handler(req({query:{childId:'1'}}),output);
  assert.equal(output.statusCode,401);assert.equal(h.queries.length,0);
});
test('Child, teacher, missing and forged client roles cannot read parent reports', async () => {
  for (const role of ['child','student','teacher','admin',undefined]) {
    const h=parentHandler({id:'caller',role});const output=res();
    await h.handler(req({query:{childId:'1',role:'parent'},body:{role:'parent',isAdmin:true}}),output);
    assert.equal(output.statusCode,403);assert.equal(h.queries.length,0);
  }
});
test('Parent report rejects malformed, repeated and unsafe child IDs before SQL', async () => {
  for (const childId of ['0','-1','1suffix','1.5','1e2','9007199254740992',['1','2'],undefined]) {
    const h=parentHandler({id:'parent-a',role:'parent'});const output=res();
    await h.handler(req({query:{childId}}),output);assert.equal(output.statusCode,400);assert.equal(h.queries.length,0);
  }
});
test('Cross-parent access stops at the ownership check; browser parent ID is ignored', async () => {
  const h=parentHandler({id:'parent-a',role:'parent'});const output=res();
  await h.handler(req({query:{childId:'7',parentId:'parent-b'},body:{parentId:'parent-b'}}),output);
  assert.equal(output.statusCode,403);assert.equal(h.queries.length,1);
  assert.deepEqual(plain(h.queries[0].values),[7,'parent-a']);assert.match(h.queries[0].text,/parent_id = \?/);
});
test('Legitimate parent report retains all six queries and response fields', async () => {
  const h=parentHandler({id:'parent-a',role:'parent'},[[{id:7,name:'Fixture child',age_group:'5-7',total_stars:3}],[],[{total:2}],[],[],[{total:1}]]);
  const output=res();await h.handler(req({query:{childId:'7'}}),output);
  assert.equal(output.statusCode,200);assert.equal(h.queries.length,6);
  assert.equal(output.body.totalGames,2);assert.equal(output.body.badgeCount,1);
  assert.deepEqual(Object.keys(output.body).sort(),['badgeCount','child','daily','recent','subjects','totalGames']);
});
test('Parent report errors never reveal SQL, identifiers or secrets', async () => {
  const h=parentHandler({id:'parent-a',role:'parent'},[],new Error('PRIVATE_VALUE SQL connection'));const output=res();
  await h.handler(req({query:{childId:'7'}}),output);
  assert.equal(output.statusCode,500);assert.equal(JSON.stringify([h.box.logs,output.body]).includes('PRIVATE_VALUE'),false);
});

function admin(user=null,env={},globals={}) {
  const box=sandbox(env,{'@/lib/auth/auth':{getAuth:()=>({api:{getSession:async()=>user?{user}:null}})}},globals);
  return {box,api:box.load('src/server/admin-auth.ts')};
}
test('Existing admin guard rejects child/parent sessions and production open mode', async () => {
  for (const user of [null,{role:'child'},{role:'parent'},{isAdmin:'true'}]) {
    const h=admin(user,{ADMIN_OPEN_MODE:'true'});
    assert.equal(await h.api.hasAdminAccess(req({body:{isAdmin:true},query:{role:'admin'}})),false);
  }
});
test('Existing admin guard accepts server admin or verified configured founder only', async () => {
  assert.equal(await admin({isAdmin:true}).api.hasAdminAccess(req()),true);
  const env={FOUNDER_EMAIL:'owner@example.invalid'};
  assert.equal(await admin({email:'owner@example.invalid',emailVerified:false},env).api.hasAdminAccess(req()),false);
  assert.equal(await admin({email:'owner@example.invalid',emailVerified:true},env).api.hasAdminAccess(req()),true);
});
test('Founder codes fail closed when missing, incorrect or malformed', () => {
  assert.equal(admin().api.isConfiguredAdminCode('test-code'),false);
  const h=admin(null,{ADMIN_MASTER_CODE:'test-code',ADMIN_MASTER_CODE_HASH:'malformed'});
  assert.equal(h.api.isConfiguredAdminCode('test-code'),false);
  for (const code of [null,{},'', 'x'.repeat(129)]) assert.equal(h.api.isConfiguredAdminCode(code),false);
});
test('Scrypt founder code verifies without plaintext client state', () => {
  const salt='11'.repeat(16),hash=crypto.scryptSync('test-code',Buffer.from(salt,'hex'),32).toString('hex');
  const h=admin(null,{ADMIN_MASTER_CODE_HASH:`scrypt$${salt}$${hash}`});
  assert.equal(h.api.isConfiguredAdminCode('test-code'),true);assert.equal(h.api.isConfiguredAdminCode('wrong'),false);
});
test('Founder cookies are HttpOnly/Secure/Strict and reject tampering, expiry and key rotation', () => {
  let now=Date.now(); class Clock extends Date {static now(){return now;}}
  const h=admin(null,{ADMIN_MASTER_CODE:'test-code',BETTER_AUTH_SECRET:'test-only-signing-secret'},{Date:Clock});
  const output=res();assert.equal(h.api.issueFounderSession(output),true);
  const [name,value,options]=output.cookies[0]; const request=req({headers:{cookie:`${name}=${value}`}});
  assert.equal(options.httpOnly,true);assert.equal(options.secure,true);assert.equal(options.sameSite,'strict');
  assert.equal(h.api.hasFounderSession(request),true);
  assert.equal(h.api.hasFounderSession(req({headers:{cookie:`${name}=${value.slice(0,-1)}${value.endsWith('0')?'1':'0'}`}})),false);
  now+=2*60*60*1000;assert.equal(h.api.hasFounderSession(request),false);now-=2*60*60*1000;
  h.box.env.ADMIN_MASTER_CODE='rotated-test-code';assert.equal(h.api.hasFounderSession(request),false);
  for (const cookie of [`${name}=%ZZ`,`${name}=bad`,`${name}=${'x'.repeat(17000)}`]) assert.equal(h.api.hasFounderSession(req({headers:{cookie}})),false);
});
test('Teacher password hashing uses unique salts and rejects wrong passwords', async () => {
  const p=sandbox().load('src/server/teacher-password.ts');
  const a=await p.hashTeacherPassword('Test password only'),b=await p.hashTeacherPassword('Test password only');
  assert.notEqual(a,b);assert.ok(a.startsWith('scrypt$'));assert.equal(a.includes('Test password only'),false);
  assert.equal((await p.verifyTeacherPassword('Test password only',a)).valid,true);
  assert.equal((await p.verifyTeacherPassword('incorrect',a)).valid,false);
  assert.equal((await p.verifyTeacherPassword('anything','scrypt$')).valid,false);
});
test('Legacy teacher hash requests upgrade only after caller verifies validity', async () => {
  const p=sandbox().load('src/server/teacher-password.ts');
  const hash=crypto.createHash('sha256').update('test-password'+'sodafom-teacher-salt').digest('hex');
  const result=await p.verifyTeacherPassword('test-password',hash);
  assert.equal(result.valid,true);assert.equal(result.needsUpgrade,true);
  assert.equal((await p.verifyTeacherPassword('incorrect',hash)).valid,false);
});

function photo(billing=true) {
  const calls=[];class OpenAI {constructor(options){this.responses={create:async body=>{calls.push({options,body});return {output_text:'Fixture explanation'};}};}}
  const box=sandbox({OPENAI_API_KEY:'test-only-key-not-real'}, {'openai':OpenAI,'@/server/paid-ai-guard':{requirePaidAiBilling:()=>billing}});
  return {handler:box.load('src/server/api/ai-teacher/read-page/POST.ts').default,calls,box};
}
test('Photo requests disable response storage without changing model or tutoring behavior', async () => {
  const h=photo();const output=res();await h.handler(req({body:{image:'data:image/png;base64,dGVzdA==',age:8,mode:'homework'}}),output);
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].body.store,false);assert.equal(h.calls[0].body.model,'gpt-4o-mini');
  assert.equal(h.calls[0].body.max_output_tokens,900);assert.equal(output.body,'Fixture explanation');
  assert.equal(JSON.stringify([output.body,h.box.logs]).includes('test-only-key'),false);
});
test('Photo privacy change cannot bypass the existing paid-AI guard', async () => {
  const h=photo(false);await h.handler(req({body:{image:'data:image/png;base64,dGVzdA=='}}),res());assert.equal(h.calls.length,0);
});
test('Invalid photo types fail before provider access', async () => {
  const h=photo();const output=res();await h.handler(req({body:{image:'data:text/html;base64,dGVzdA=='}}),output);
  assert.equal(output.statusCode,400);assert.equal(h.calls.length,0);
});

// Minimal hook/device harness executes the actual component's lifecycle code.
// It is deliberately not a claim of React DOM or physical-device coverage.
function voice(options={}) {
  const slots=[], effects=[], pending=[], timers=new Map(), instances=[], readers=[], saves=[], alerts=[];
  let cursor=0, disposed=false, setterAfterUnmount=0, requestCount=0, nextTimer=1, grant, reject;
  let compact=options.compact || false;
  const track={stops:0,stop(){this.stops++;}};
  const stream={getTracks:()=>[track]};
  const permission=options.pending ? new Promise((resolve,deny)=>{grant=resolve;reject=deny;}) : Promise.resolve(stream);
  const react={
    useState(initial){const index=cursor++;if(!slots[index])slots[index]={value:initial};return [slots[index].value,value=>{if(disposed)setterAfterUnmount++;slots[index].value=value;}];},
    useRef(initial){const index=cursor++;if(!slots[index])slots[index]={current:initial};return slots[index];},
    useEffect(fn,deps){const index=cursor++;const previous=effects[index];if(!previous || deps.some((d,i)=>d!==previous.deps[i]))pending.push(()=>{previous?.cleanup?.();effects[index]={fn,deps,cleanup:fn()};});},
  };
  class Recorder {
    constructor(value){if(options.constructorFailure)throw new Error('fixture construction failure');this.stream=value;this.state='inactive';this.mimeType='audio/webm';instances.push(this);}
    static isTypeSupported(){return true;}
    start(){if(options.startFailure)throw new Error('fixture start failure');this.state='recording';}
    stop(){if(options.stopFailure)throw new Error('fixture stop failure');if(this.state==='inactive')throw new Error('double stop');this.state='inactive';queueMicrotask(()=>{this.ondataavailable?.({data:new Blob(['fixture audio'])});this.onstop?.();});}
  }
  class Reader {
    constructor(){this.readyState=0;this.result=null;readers.push(this);}
    readAsDataURL(){this.readyState=1;if(!options.pendingReader)queueMicrotask(()=>{this.readyState=2;this.result='data:audio/webm;base64,dGVzdA==';this.onloadend?.();});}
    abort(){this.aborted=true;this.readyState=2;this.onloadend?.();}
  }
  const jsx=(type,props)=>({type,props});
  const box=sandbox({}, {
    'react':react,'react/jsx-runtime':{jsx,jsxs:jsx,Fragment:'fragment'},
    'motion/react':{motion:{div:'motion.div',button:'motion.button'},AnimatePresence:'presence'},
    'lucide-react':Object.fromEntries(['Mic','Square','Play','Trash2','Check','RefreshCw'].map(k=>[k,k])),
    '@/lib/voice-context':{useVoice:()=>({clips:{},saveClip:(...args)=>saves.push(args),deleteClip:()=>{}})},
  }, {navigator:{mediaDevices:{getUserMedia:()=>{requestCount++;return permission;}}},MediaRecorder:Recorder,FileReader:Reader,
      setInterval:fn=>{const id=nextTimer++;timers.set(id,fn);return id;},clearInterval:id=>timers.delete(id),
      alert:value=>alerts.push(value),Audio:class {pause(){}play(){return Promise.resolve();}}});
  const Component=box.load('src/components/VoiceRecorder.tsx').default;
  let tree;
  function render(){cursor=0;tree=Component({clipKey:'well-done',label:'Fixture',prompt:'Fixture words',compact});pending.splice(0).forEach(fn=>fn());return tree;}
  function find(node,predicate){if(!node||typeof node!=='object')return null;if(predicate(node))return node;for(const child of [node.props?.children].flat(Infinity)){const match=find(child,predicate);if(match)return match;}return null;}
  function click(label){render();const target=find(tree,node=>typeof node.props?.onClick==='function' && (label ? [node.props.children].flat().some(c=>typeof c==='string'&&c.includes(label)) : true));assert.ok(target,`button ${label||'record'}`);target.props.onClick();}
  async function flush(){await Promise.resolve();await Promise.resolve();await Promise.resolve();}
  async function tick(count=1){for(let i=0;i<count;i++){for(const [id,fn] of [...timers])if(timers.has(id))fn();await flush();}}
  function unmount(){disposed=true;for(const effect of effects)effect?.cleanup?.();}
  render();
  return {click,tick,flush,unmount,render,track,instances,readers,saves,alerts,timers,
    grant:()=>grant?.(stream),deny:()=>reject?.(new Error('Permission denied')),
    get requestCount(){return requestCount;},get state(){return slots[0].value;},get setterAfterUnmount(){return setterAfterUnmount;}};
}
test('Recorder asks for no microphone access until an explicit click and countdown', async () => {
  const h=voice();assert.equal(h.requestCount,0);h.click();await h.tick(2);assert.equal(h.requestCount,0);await h.tick();assert.equal(h.requestCount,1);h.unmount();
});
test('Repeated compact recorder clicks cannot create multiple timers or streams', async () => {
  const h=voice({compact:true});h.click();h.click();h.click();assert.equal(h.timers.size,1);await h.tick(3);assert.equal(h.requestCount,1);h.unmount();
});
test('Navigation during countdown cancels the pending microphone request', async () => {
  const h=voice();h.click();h.unmount();await h.tick(4);assert.equal(h.requestCount,0);assert.equal(h.timers.size,0);
});
test('A late microphone grant after unmount is immediately stopped and never recorded', async () => {
  const h=voice({pending:true});h.click();await h.tick(3);h.unmount();h.grant();await h.flush();
  assert.equal(h.track.stops,1);assert.equal(h.instances.length,0);assert.equal(h.setterAfterUnmount,0);assert.equal(h.saves.length,0);
});
test('Navigating away from an active recording stops tracks, timers and saves nothing', async () => {
  const h=voice();h.click();await h.tick(3);assert.equal(h.state,'recording');h.unmount();await h.flush();
  assert.ok(h.track.stops>0);assert.equal(h.timers.size,0);assert.equal(h.saves.length,0);assert.equal(h.setterAfterUnmount,0);
});
test('Recorder construction and start failures cannot leave the microphone running', async () => {
  for(const flag of ['constructorFailure','startFailure']){
    const h=voice({[flag]:true});h.click();await h.tick(3);assert.ok(h.track.stops>0);assert.equal(h.state,'idle');assert.equal(h.timers.size,0);h.unmount();
  }
});
test('Denied microphone permission returns to idle and does not auto-retry', async () => {
  const h=voice({pending:true});h.click();await h.tick(3);h.deny();await h.flush();await h.tick(5);
  assert.equal(h.state,'idle');assert.equal(h.requestCount,1);assert.equal(h.alerts.length,1);h.unmount();
});
test('Recorder errors stop capture without producing or saving a partial clip', async () => {
  const h=voice();h.click();await h.tick(3);h.instances[0].onerror();await h.flush();
  assert.ok(h.track.stops>0);assert.equal(h.state,'idle');assert.equal(h.saves.length,0);assert.equal(h.timers.size,0);h.unmount();
});
test('Normal stop retains preview and only saves after the explicit Save button', async () => {
  const h=voice();h.click();await h.tick(3);h.click('Stop recording');await h.flush();
  assert.equal(h.state,'preview');assert.ok(h.track.stops>0);assert.equal(h.saves.length,0);
  h.click('Save it!');assert.equal(h.saves.length,1);assert.equal(h.state,'saved');h.unmount();
});
test('Automatic eight-second stop releases microphone and retains preview', async () => {
  const h=voice();h.click();await h.tick(3);await h.tick(8);await h.flush();
  assert.equal(h.state,'preview');assert.ok(h.track.stops>0);assert.equal(h.timers.size,0);assert.equal(h.saves.length,0);h.unmount();
});
test('Stop failures still release tracks and return safely to idle', async () => {
  const h=voice({stopFailure:true});h.click();await h.tick(3);h.click('Stop recording');await h.flush();
  assert.ok(h.track.stops>0);assert.equal(h.state,'idle');assert.equal(h.saves.length,0);h.unmount();
});
test('Navigation aborts an unfinished audio FileReader without updating stale state', async () => {
  const h=voice({pendingReader:true});h.click();await h.tick(3);h.click('Stop recording');await h.flush();
  assert.equal(h.readers.length,1);h.unmount();await h.flush();assert.equal(h.readers[0].aborted,true);assert.equal(h.setterAfterUnmount,0);
});

test('Security middleware runs before routes and preserves raw webhook ordering', () => {
  const source=fs.readFileSync(path.join(ROOT,'src/server/entry.ts'),'utf8');
  assert.ok(source.indexOf('app.use(httpSecurity)') < source.indexOf('app.post("/api/webhook/stripe"'));
  assert.ok(source.indexOf('app.post("/api/webhook/stripe"') < source.indexOf('app.use(express.json())'));
  assert.ok(source.indexOf('app.use(express.json())') < source.indexOf('// <api-registrations>'));
  assert.ok(source.includes('app.use("/api", apiErrorHandler)'));
  assert.equal(source.includes('url: req.url'),false);
  assert.equal(source.includes('Access-Control-Allow-Origin'),false);
});
test('All changed TypeScript files parse without syntax errors (not a full type check)', () => {
  const files=['src/lib/auth/trusted-origins.ts','src/lib/auth/auth.ts','src/server/http-security.ts','src/server/entry.ts','src/server/auth-middleware.ts','src/server/api/parent/dashboard/GET.ts','src/server/api/ai-teacher/read-page/POST.ts','src/components/VoiceRecorder.tsx'];
  for(const file of files){
    const source=ts.createSourceFile(file,fs.readFileSync(path.join(ROOT,file),'utf8'),ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
    assert.equal(source.parseDiagnostics.length,0,file);
  }
});

test('Admin account list rejects non-admin callers and selects no password/token columns', async () => {
  let allowed=false;const queries=[];
  const box=sandbox({}, {'@/server/admin-auth':{hasAdminAccess:async()=>allowed},
    'drizzle-orm':{sql:strings=>strings.join('?')},
    '@/server/db/client':{db:{execute:async query=>{queries.push(query);return [[{id:'fixture',name:'Fixture',email:'fixture@example.invalid',created_at:'2026-01-01'}]];}}}});
  const handler=box.load('src/server/api/admin/list-users/GET.ts').default;
  const denied=res();await handler(req(),denied);assert.equal(denied.statusCode,403);assert.equal(queries.length,0);
  allowed=true;const output=res();await handler(req(),output);
  assert.equal(output.body.users.length,1);assert.match(queries[0],/SELECT id, name, email, created_at FROM user/);
  assert.doesNotMatch(queries[0],/password|token|SELECT \*/i);assert.equal(output.headers['cache-control'],'private, no-store');
});
test('Admin account list sanitises database errors', async () => {
  const box=sandbox({}, {'@/server/admin-auth':{hasAdminAccess:async()=>true},'drizzle-orm':{sql:()=>({})},
    '@/server/db/client':{db:{execute:async()=>{throw new Error('PRIVATE_VALUE database password');}}}});
  const output=res();await box.load('src/server/api/admin/list-users/GET.ts').default(req(),output);
  assert.equal(output.statusCode,500);assert.equal(JSON.stringify([box.logs,output.body]).includes('PRIVATE_VALUE'),false);
});
test('Child progress preserves ownership filtering and sanitises authentication failures', async () => {
  let fail=false;const filters=[];
  const query={from(){return this;},where(filter){filters.push(filter);return this;},limit:async()=>[]};
  const box=sandbox({}, {'@/lib/auth/auth':{getAuth:()=>({api:{getSession:async()=>{if(fail)throw new Error('PRIVATE_VALUE');return {user:{id:'parent-a'}};}}})},
    '../../../../db/client.js':{db:{select:()=>query}},
    '../../../../db/schema.js':{children:{id:'child-id',parentId:'parent-id',totalStars:'total-stars'}},
    'drizzle-orm':{eq:(field,value)=>[field,value],and:(...values)=>values}});
  const handler=box.load('src/server/api/children/[childId]/progress/GET.ts').default;
  const output=res();await handler(req({params:{childId:'7'}}),output);
  assert.equal(output.statusCode,404);assert.deepEqual(plain(filters),[[['child-id',7],['parent-id','parent-a']]]);
  fail=true;const failed=res();await handler(req(),failed);assert.equal(failed.statusCode,500);
  assert.equal(JSON.stringify([box.logs,failed.body]).includes('PRIVATE_VALUE'),false);
});
