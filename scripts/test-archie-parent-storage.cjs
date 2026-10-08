const {spawn}=require('node:child_process'); const {mkdtempSync}=require('node:fs');const {randomBytes}=require('node:crypto');const assert=require('node:assert/strict');
const cwd=require('node:path').resolve(__dirname,'..'),base='http://127.0.0.1:4174';
const env={...process.env,PORT:'4174',NODE_ENV:'development',ARCHIE_PARENT_ACCOUNTS_ENABLED:'true',BETTER_AUTH_SECRET:randomBytes(32).toString('hex'),BETTER_AUTH_URL:base,ARCHIE_PARENT_SQLITE_PATH:mkdtempSync('/tmp/archie-store-')+'/parents.sqlite'};
let server;
async function start(){server=spawn(process.execPath,['--import','tsx','scripts/serve-archie-test.ts'],{cwd,env,stdio:'ignore'});for(let i=0;i<100;i++){try{if((await fetch(base+'/api/health')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('server unavailable');}
async function stop(){await new Promise(r=>{server.once('exit',r);server.kill()});}
async function post(path,body,cookie='',origin=base){return fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify(body)});}
(async()=>{await start(); assert.equal((await (await fetch(base+'/api/parents/account-status')).json()).ready,true);
const signup=await post('/api/auth/sign-up/email',{email:'parent@example.test',password:'Good-test-password-981',name:'Parent'});assert.equal(signup.status,200,await signup.text());const cookie=signup.headers.getSetCookie().map(s=>s.split(';')[0]).join('; ');assert.ok(cookie);
const session=await (await fetch(base+'/api/auth/get-session',{headers:{Cookie:cookie}})).json();assert.equal(session.user.isAdmin,false);assert.equal(session.user.role,'parent');
assert.equal((await post('/api/auth/sign-in/email',{email:'parent@example.test',password:'Good-test-password-981'},'', 'https://evil.example')).status,403);
const fake='sk-synthetic-only-ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';assert.equal((await post('/api/parents/ai/connect',{key:fake},cookie)).status,200);const status=await (await fetch(base+'/api/parents/ai/status',{headers:{Cookie:cookie}})).json();assert.equal(status.connected,true);assert.equal(JSON.stringify(status).includes(fake),false);
await stop();await start();const persisted=await(await fetch(base+'/api/auth/get-session',{headers:{Cookie:cookie}})).json();assert.equal(persisted.user.id,session.user.id);assert.equal((await(await fetch(base+'/api/parents/ai/status',{headers:{Cookie:cookie}})).json()).connected,false);
assert.equal((await post('/api/auth/sign-in/email',{email:'parent@example.test',password:'Good-test-password-981'})).status,200);
console.log('PASS real parent registration, signed session, persistence across restart, cross-origin rejection, temporary secret isolation and expiry on restart');await stop();})().catch(async e=>{console.error(e);if(server)await stop();process.exit(1)});
