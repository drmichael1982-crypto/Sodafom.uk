import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveAuthBaseURL, getSessionRecoveryURL, isCurrentSession, isChildAccount,
  canUseParentArea, canUseAdminArea, restrictedAccountArea, postLoginPath,
  browserStorage, readLoginEmail, rememberLoginEmail, clearClientAuthHints,
  requestSessionRecovery, authJsonRequest, validResetLink, passwordResetCallback,
} from '../src/lib/auth/account-reliability.ts';

const parent = { id: 'test-parent', role: 'parent', isAdmin: false };
const child = { id: 'test-child', role: 'child', isAdmin: false };
const teacher = { id: 'test-teacher', role: 'teacher', isAdmin: false };
const admin = { id: 'test-admin', role: 'parent', isAdmin: true };
const now = Date.parse('2026-09-13T00:00:00Z');
const session = { user: parent, session: { expiresAt: new Date(now + 60_000) } };

for (const origin of ['https://sodafom.uk', 'https://www.sodafom.uk', 'https://example.up.railway.app']) {
  test(`web auth keeps API origin: ${origin}`, () => assert.equal(resolveAuthBaseURL('/api', origin), origin));
}
test('native configured API and recovery use backend once', () => {
  assert.equal(resolveAuthBaseURL('https://backend.example/api', 'capacitor://localhost'), 'https://backend.example');
  assert.equal(getSessionRecoveryURL('https://backend.example/api/'), 'https://backend.example/api/auth/get-session?clearCookies=1');
});
test('same-origin recovery does not duplicate /api', () => assert.equal(getSessionRecoveryURL('/api'), '/api/auth/get-session?clearCookies=1'));
test('invalid API protocol cannot create an auth endpoint', () => assert.equal(resolveAuthBaseURL('javascript:bad'), undefined));
test('fresh authenticated session is accepted after refresh', () => assert.equal(isCurrentSession(session, null, false, now), true));
for (const [label, data, error, pending] of [
  ['expired', { ...session, session: { expiresAt: new Date(now) } }, null, false],
  ['missing expiry', { user: parent }, null, false],
  ['invalid expiry', { ...session, session: { expiresAt: 'invalid' } }, null, false],
  ['missing user', { session: session.session }, null, false],
  ['cached user with request error', session, { status: 503 }, false],
  ['still pending', session, null, true],
  ['logged out', null, null, false],
]) test(`deny unconfirmed session: ${label}`, () => assert.equal(isCurrentSession(data, error, pending, now), false));

test('role matrix: parent, child, teacher, administrator and unknown', () => {
  for (const [user, parentAllowed, adminAllowed] of [[parent,true,false],[child,false,false],[teacher,false,false],[admin,true,true],[null,false,false],[{ id:'unknown' },false,false]]) {
    assert.equal(canUseParentArea(user), parentAllowed);
    assert.equal(canUseAdminArea(user), adminAllowed);
  }
});
for (const role of ['child', 'student', 'pupil', 'CHILD', ' child ']) {
  test(`child role overrides a conflicting admin flag: ${role}`, () => {
    const user = { id: 'test', role, isAdmin: true };
    assert.equal(isChildAccount(user), true);
    assert.equal(canUseParentArea(user), false);
    assert.equal(canUseAdminArea(user), false);
    assert.equal(postLoginPath('/admin-panel', user), '/');
  });
}
for (const path of ['/hub', '/hub/profile', '/parent-dashboard/chores', '/parent-area', '/pocket-money/setup', '/HUB/PROFILE/']) {
  test(`child cannot be sent to adult path ${path}`, () => {
    assert.equal(restrictedAccountArea(path), 'parent');
    assert.equal(postLoginPath(path, child), '/');
  });
}
test('legitimate return path preserves query and fragment', () => assert.equal(postLoginPath('/hub/progress?childId=3#reading', parent), '/hub/progress?childId=3#reading'));
for (const path of ['https://bad.example', '//bad.example', '/\\bad.example', '/hub/login', '/hub/login?from=/hub', '/hub/signup', '/hub/reset-password?token=test', '/api/auth/sign-out', '/api', '/%68ub/login', '/hub/../hub/login', '/%2f%2fbad.example', '/%252f%252fbad.example', '/hub\n/login', '/%00bad', '/%ZZ']) {
  test(`reject unsafe or looping destination ${JSON.stringify(path)}`, () => assert.equal(postLoginPath(path, parent), '/hub'));
}
test('teacher and administrator land in their own areas', () => {
  assert.equal(postLoginPath(undefined, teacher), '/teacher-hub');
  assert.equal(postLoginPath('/admin-panel', parent), '/hub');
  assert.equal(postLoginPath(undefined, admin), '/admin-panel');
  assert.equal(postLoginPath('/teacher-hub/student/1', teacher), '/teacher-hub/student/1');
});
test('public password/login routes remain available', () => {
  for (const path of ['/hub/login', '/hub/signup', '/hub/forgot-password', '/hub/reset-password', '/teacher-hub/login']) assert.equal(restrictedAccountArea(path), null);
});

test('SSR and denied storage never break login', () => {
  const original = globalThis.window;
  try {
    delete globalThis.window;
    assert.equal(readLoginEmail(), '');
    assert.doesNotThrow(() => rememberLoginEmail('test@example.test', true));
    globalThis.window = Object.defineProperties({}, {
      localStorage: { get() { throw new Error('SecurityError'); } },
      sessionStorage: { get() { throw new Error('SecurityError'); } },
    });
    assert.equal(browserStorage('localStorage'), undefined);
    assert.equal(readLoginEmail(), '');
    assert.doesNotThrow(() => rememberLoginEmail('test@example.test', true));
    assert.doesNotThrow(clearClientAuthHints);
  } finally { if (original === undefined) delete globalThis.window; else globalThis.window = original; }
});
test('logout hint cleanup preserves learning and remembered email', () => {
  const original = globalThis.window;
  const values = new Map([['learning-progress', 'keep'], ['sodafom_remembered_login_email','keep@example.test'], ['sodafom_teacher_token','test-only'],['sodafom_free_access','test-only']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) };
  try {
    globalThis.window = { localStorage: storage, sessionStorage: storage };
    rememberLoginEmail('  TEST@EXAMPLE.TEST ', true);
    clearClientAuthHints();
    assert.equal(values.get('learning-progress'), 'keep');
    assert.equal(values.get('sodafom_remembered_login_email'), 'test@example.test');
    assert.equal(values.has('sodafom_teacher_token'), false);
    assert.equal(values.has('sodafom_free_access'), false);
  } finally { if (original === undefined) delete globalThis.window; else globalThis.window = original; }
});
test('recovery requires one explicit successful HTTP request', async () => {
  let calls = 0;
  await requestSessionRecovery('/api', async (url, init) => {
    calls++;
    assert.equal(url, '/api/auth/get-session?clearCookies=1');
    assert.equal(init.credentials, 'include');
    assert.equal(init.cache, 'no-store');
    assert.ok(init.signal instanceof AbortSignal);
    return Response.json({ cleared: true });
  });
  assert.equal(calls, 1);
});
for (const [label, response] of [['unauthorised',() => Response.json({error:'failure'}, {status:401})],['unavailable',() => Response.json({cleared:true}, {status:503})],['wrong body',() => Response.json({cleared:false})],['HTML fallback',() => new Response('<html>not API</html>')]]) {
  test(`recovery rejects ${label}; never claims success`, async () => await assert.rejects(requestSessionRecovery('/api', async () => response())));
}
test('network failures do not trigger automatic retries', async () => {
  let calls = 0;
  await assert.rejects(requestSessionRecovery('/api', async () => { calls++; throw new Error('offline'); }));
  assert.equal(calls, 1);
});
test('password reset request distinguishes HTTP failure from acceptance', async () => {
  await authJsonRequest('/api/auth/forgot-password', {method:'POST'}, 'ok', async () => Response.json({ok:true}));
  await assert.rejects(authJsonRequest('/api/auth/forgot-password', {method:'POST'}, 'ok', async () => Response.json({ok:true}, {status:500})));
  await assert.rejects(authJsonRequest('/api/auth/forgot-password', {method:'POST'}, 'ok', async () => Response.json({error:'not accepted'})));
});
test('missing, invalid and expired reset links are not submittable', () => {
  assert.equal(validResetLink(null,null), false);
  assert.equal(validResetLink('',null), false);
  assert.equal(validResetLink(' ',null), false);
  assert.equal(validResetLink('test-token','INVALID_TOKEN'), false);
  assert.equal(validResetLink('test-token',null), true);
});
test('reset callback ignores untrusted production hosts and preserves local ports', () => {
  assert.equal(passwordResetCallback(false,'https://bad.example'), 'https://sodafom.uk/hub/reset-password');
  assert.equal(passwordResetCallback(true,'http://localhost:5173'), 'http://localhost:5173/hub/reset-password');
  assert.equal(passwordResetCallback(true,'http://127.0.0.1:3000'), 'http://127.0.0.1:3000/hub/reset-password');
  assert.equal(passwordResetCallback(true,'https://bad.example'), 'https://sodafom.uk/hub/reset-password');
  assert.equal(passwordResetCallback(true,'http://user:pass@localhost'), 'https://sodafom.uk/hub/reset-password');
});

const { completeSignOut } = await import('../src/lib/auth/account-reliability.ts');
test('logout treats a returned error as failure', async () => {
  await assert.rejects(completeSignOut(async () => ({error:{status:503}})), /Could not sign out/);
});
test('logout propagates a network failure', async () => {
  await assert.rejects(completeSignOut(async () => { throw new Error('offline'); }), /offline/);
});
test('confirmed logout returns its successful result', async () => {
  assert.equal((await completeSignOut(async () => ({data:{success:true},error:null}))).data.success, true);
});
const { buildClearCookieHeaders, tryClearStaleSession } = await import('../src/lib/auth/session-cookies.ts');
test('session reset also clears founder access without affecting unrelated cookies', () => {
  const headers = buildClearCookieHeaders('better-auth.session_token=x; sodafom_founder_session=y; learning=keep; custom-better-auth=keep', {preview:false});
  assert.equal(headers.length, 2);
  assert.ok(headers.every(value => value.includes('Max-Age=0') && value.includes('HttpOnly')));
  assert.ok(headers[1].startsWith('sodafom_founder_session='));
});
test('preview recovery preserves partitioning requirements', () => {
  const headers = buildClearCookieHeaders('__Secure-better-auth.session_token=x; sodafom_founder_session=y', {preview:true});
  assert.match(headers[0], /SameSite=None; Secure; Partitioned/);
  assert.doesNotMatch(headers[1], /Partitioned/);
});
test('HTTP-local recovery clears normal cookies but retains secure cookie-prefix rules', () => {
  const headers = buildClearCookieHeaders('better-auth.session_token=x; __Secure-better-auth.session_token=y', {preview:false,secure:false});
  assert.doesNotMatch(headers[0], /; Secure/);
  assert.match(headers[1], /; Secure/);
});
test('ordinary session requests never clear cookies', () => {
  assert.equal(tryClearStaleSession({query:{},headers:{}}, {setHeader(){throw new Error('unexpected mutation');},status(){throw new Error('unexpected response');}}, {preview:false}), false);
});
const { safeSignupLocation } = await import('../src/lib/auth/account-reliability.ts');
for (const redirect of ['https://bad.example','//bad.example','/hub/login','/admin-panel','/teacher-hub']) {
  test(`signup boundary sanitizes redirect ${redirect} while preserving other parameters`, () => {
    const target=safeSignupLocation('/hub/signup',`?promo=TEST&ref=TEST&redirect=${encodeURIComponent(redirect)}`);
    const url=new URL(target,'https://sodafom.uk');
    assert.equal(url.searchParams.get('redirect'),'/hub');
    assert.equal(url.searchParams.get('promo'),'TEST'); assert.equal(url.searchParams.get('ref'),'TEST');
  });
}
test('signup boundary leaves the existing subscription destination unchanged', () => {
  assert.equal(safeSignupLocation('/hub/signup','?redirect=%2Fsubscribe'),null);
  assert.equal(safeSignupLocation('/hub/signup','?promo=TEST'),null);
  assert.equal(safeSignupLocation('/games','?redirect=//bad.example'),null);
});
test('legitimate encoded query values are preserved on internal destinations', () => {
  assert.equal(postLoginPath('/hub/progress?return=%2Freading', {role:'parent'}), '/hub/progress?return=%2Freading');
  assert.equal(safeSignupLocation('/hub/signup','?redirect=%2Fsubscribe%3Freturn%3D%252Fhub'), null);
});
