# Agent SOD-03 — security handoff to Coordinator Codex

For Michael Davis. **Coordinator Codex is in charge.** Sodafom children's app only; Sodafoam Systems 797 is excluded.

**RED — security acceptance remains incomplete.** The stable checkpoint fixes the earlier cross-family game/progress access defect and strengthens child/Admin separation. Several high-severity public-access and payment-entitlement defects remain. This report changes no application code and does not certify launch readiness.

## Identity, ownership and exact commits

| Item | Evidence |
| --- | --- |
| Existing agent identity | SOD-03; not a new section lead |
| Original task | Read-only photo upload, homework scanner, AI teacher, paid-AI, parent/child ownership, CORS, CSRF and public-route security review |
| Original requested branch / snapshot | `codex/children-foundation-first-pass` / `81a78e12c5fd35cef4de24180047480364d0358b` |
| Current section | [SOD-FIN-05 / issue #22](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/22), security-review support only |
| Current code reviewed and tested | `442656b4e2ec76167b4d0b5fb7b804cf742904a5`, the exact stable QA checkpoint published by Coordinator Codex in [draft PR #25](https://github.com/drmichael1982-crypto/Sodafom.uk/pull/25) |
| Own report branch | `codex/sod03-security-report-20260916` |
| Report branch base / PR target | `3caea47a4f0cde7b76c0fb309e20ec017671c04a` / `integration/sodafom-big-jobs-20260915`, explicitly recorded as the review base in #25 |
| Owned file | `agent-reports/AGENT-SOD-03-REPORT.md` only |
| Application files edited | None |
| Prior work preserved | Original SOD-03 report and original foundation branch retained unchanged |
| Push and final report commit | Recorded in the draft PR after the commit/push, avoiding a self-referential commit hash |

The isolated local checkout first used the stable checkpoint for every test below. After testing, the unpushed, clean SOD-03 branch was based on the confirmed integration review base so the PR contains only this report, without resubmitting Coordinator Codex's 26-file stable-build changes. The report branch's application tree is therefore not the tested stable checkpoint; all findings and test results below refer explicitly to `442656b4e2ec76167b4d0b5fb7b804cf742904a5`.

All six work orders (#18–#23), existing acknowledgements, current reports and PR #25 were read. No `AGENTS.md` was found in this checkout. Existing ownership is preserved: Agent 13 parent reports, Agent 14 teacher work, Agent 29 account work, Agent 12 scanners, Agent 9 books; the work orders describe several leads as proposed, not acknowledged. SOD-BOOKS-QA's overlapping reader work is already reported in #20/#24. SOD-03 does not claim any of their implementation files.

Acknowledgement was posted to [issue #22](https://github.com/drmichael1982-crypto/Sodafom.uk/issues/22#issuecomment-5684379473) after reading its comments. Cross-section findings below are requests to existing owners through Coordinator Codex, not new assignments made by SOD-03.

## Acceptance checklist

These are **15 selected security checks**, not a whole-app or whole-section completion estimate: **3 PASS (20%), 11 FAIL, 1 NOT TESTED**. A FAIL can mean a defect demonstrated with synthetic data or a missing control established by source inspection; evidence is identified below. Overall status is RED.

| Check | Result | Evidence / remaining work |
| --- | --- | --- |
| Paid-provider spending remains blocked | PASS | Real guard denies chat fallback, image and transcription before provider construction |
| One parent cannot read/write another parent's child game/progress | PASS | Ownership checks plus isolated two-parent denial and transaction tests |
| Child accounts cannot inherit parent/Admin access | PASS | Current server and merged parent-dashboard role tests, including stale founder cookie |
| Student identity and awards require a strong scoped credential | FAIL | 16-bit public codes, pupil details and caller-controlled activity |
| Public reviews require moderation | FAIL | Anonymous review inserted with `approved: true` |
| Credentialed CORS and CSRF enforce trusted origins | FAIL | Arbitrary origin reflected; Better Auth CSRF checks disabled |
| School activation verifies purchaser and purchased entitlement | FAIL | Missing owner/product checks and client-selected device allowance |
| Checkout customer details require owner access | FAIL | Known checkout ID exposes data anonymously |
| Internal mutations require appropriate authority | FAIL | Anonymous migration, referral conversion and push deletion reach writes |
| Ordinary permitted photos reach bounded upload handling | FAIL | 150 KiB synthetic image payload rejected before route, returned as HTTP 500 |
| Teacher logout revokes its server credential | FAIL | Local removal only; no registered server logout/revocation |
| Paid-AI re-enablement has independent account/child/credit/media controls | FAIL | Not implemented in reviewed handlers; current guard must remain |
| Learned answers are isolated by account/child and screened for privacy | FAIL | One browser-wide key; private answer text accepted |
| Progress rewards resist replay of client-reported results | FAIL | Identical requests count as separate rewarded sessions |
| Browser/mobile/physical-device security journeys | NOT TESTED | No configured isolated full app/database or physical device in this review |

## Findings and severity

All paths/line numbers refer to the tested stable commit. HIGH means a material child-data, public-content or entitlement risk. “Before AI re-enablement” is conditional; no current paid-spending bypass is claimed.

### HIGH — Public student codes expose pupils and permit forged activity

- `src/server/api/teacher/students/POST.ts:12–17`: code uses `randomBytes(2)` (65,536 possible values).
- `src/server/api/teacher/student-lookup/GET.ts:12–25`: anonymous code lookup returns ID, name, age group, avatar and stars.
- `src/server/api/teacher/students/[studentId]/activity/POST.ts:17–37`: authenticates only by code, ignores the path student ID and trusts submitted awards, including negative stars.
- `src/server/entry.ts:177`: complete URL logging includes lookup codes. `src/server/db/schema.ts:331–341` has no code expiry/revocation field.

These server files are unchanged from the original review, where synthetic anonymous lookup and negative-star mutation were reproduced. Current status is reconfirmed by source comparison, not a new live attack. Require strong expiring enrollment/session credentials, scoped student identity, rate limits, log redaction and server-validated activity. Teacher-owned detail/notes already check teacher ownership; retain those checks. Owner routing: section 05 with section 01's agreed authentication interface.

### HIGH — Public reviews bypass moderation

- `src/server/api/reviews/POST.ts:19–25` inserts unauthenticated reviews as approved.
- `src/server/api/reviews/GET.ts:8–13` returns approved reviews publicly.
- `src/pages/reviews.tsx:85–98,198–200` supports reading submitted text aloud and displays a Verified badge.

Current isolated test reproduced auto-approval with harmless synthetic text. Abusive/private content could reach a children's site; this is not an XSS claim. Default to moderation pending, restrict/rate-limit submissions and display verification only when justified. Coordinator must nominate the public-content owner.

### HIGH — Arbitrary credentialed CORS and missing CSRF protection

- `src/server/entry.ts:183–214` reflects any supplied origin, allows credentials and approves broad preflight requests.
- `src/lib/auth/auth.ts:143–186` includes broad preview/development trust and unconditional `disableCSRFCheck: true`.
- Custom state-changing cookie routes have no common origin/CSRF defense before registration.

The extracted, unchanged current CORS middleware granted `https://untrusted.example` credentialed access. Browser exploitation was NOT TESTED: SameSite and cookie partitioning can restrict delivery, so this is not proof that every cross-site browser request carries credentials. Use explicit environment-scoped origin trust, restore the auth library's checks and protect custom state-changing routes. Shared `entry.ts`/auth files need Coordinator Codex's agreed writer; preserve legitimate mobile/preview access with tests.

### HIGH — School activation is not bound to the purchaser or purchase

- `src/server/api/subscription/activate-school/POST.ts:45–52` returns an existing activation's device codes without checking its owner.
- `:58–59` accepts paid OR complete status; `:68–84` assigns a school licence to the caller without checking actual owner, school product, mode or purchased quantity.
- `:39,84,89–94` accepts an unbounded caller device count.

Unchanged since the original synthetic Stripe tests. Possession of a valid checkout-session ID is required; no ID enumeration or real payment was attempted. Bind both paths to the authenticated purchaser, validate the actual entitlement and eligible payment state, derive device count server-side and issue licences transactionally/idempotently. The ordinary parent activation has owner/price checks at `src/server/api/subscription/activate/POST.ts:62–74`; school activation does not inherit them. Existing payment owner / section 05 must repair this.

### MEDIUM — Checkout customer details are public for a known session ID

`src/server/api/stripe/session/[sessionId]/GET.ts:23–64` retrieves customer name, payment and product details without session or ownership checks. Unchanged from the original synthetic disclosure test. Require owner verification and minimize returned data. No claim that checkout IDs are guessable.

### MEDIUM — Internal mutation endpoints are anonymous

- `src/server/api/newsletter/migrate/POST.ts:6` executes schema DDL from a public route.
- `src/server/api/referral/convert/POST.ts:11` accepts a user ID and marks referrals converted without payment verification.
- `src/server/api/push/unsubscribe/POST.ts:5` deletes by supplied endpoint without owner binding.

All three reached the corresponding fake-database writes in current isolated tests. Referral reward-code minting was not demonstrated; that path has a separate result-shape concern. Push deletion requires a known endpoint. Remove public migrations, trigger referral conversion from verified events, and use owner/scoped unsubscribe authorization.

### MEDIUM — Upload limits and error handling break normal photo requests

- `src/components/scanners/scanner-core.ts:3–10` and `src/pages/AITeacherPage.tsx:103` allow 6 MiB photos.
- `src/server/entry.ts:226` uses default `express.json()`; `:573–580` rewrites parser errors to 500 and exposes the error message.
- `src/server/api/ai-teacher/read-page/POST.ts:12` checks a data-URL prefix/string length, without decoded-image/dimension verification.

Using locked Express 5.2.1, the actual parser configuration and extracted current error handler, a local HTTP request containing 150 KiB of synthetic image bytes was rejected before the route and returned HTTP 500, “request entity too large”. This does not exercise a real camera or full app. Use route-scoped bounded parsing, meaningful 400/413 errors, decoded type/dimension checks and metadata minimization. Avoid raising every endpoint's limit. Coordinate with Agent 12 and the shared server-entry owner.

The new scanner flow has honest failure messages, explicit camera/mic activation, track cleanup and cancellation tests. The older `src/pages/AITeacherPage.tsx:124` still claims “I have looked at your book page photo!” after OCR failure; remove that misleading fallback through its owner.

### HIGH BEFORE AI RE-ENABLEMENT — Spending block is not user authorization

- `src/server/paid-ai-guard.ts:11–17` remains unconditional and effective.
- `src/server/api/chat/POST.ts:43–55` now correctly answers Local-first, then checks the paid guard. The earlier report's all-chat-requests-blocked description is superseded.
- `src/server/api/chat/POST.ts:28–30,70` still puts client `systemExtra` into the system prompt.
- `src/server/api/ai-teacher/read-page/POST.ts:16` and `src/server/api/ai/transcribe/POST.ts:13` guard before provider access.

These handlers still lack independent authenticated child scope, server-owned age, media permission, paid entitlement, quotas and atomic debit/refund checks. Keep the guard until those are implemented and tested; do not treat client flags or Admin access as payment authority. New scanner prompt text treats image text and questions as untrusted, which is useful but does not implement authorization or output moderation.

No real provider was called. Mock-provider successes in regression suites are simulations, not proof that paid AI is enabled. The image handler has no photo disk/database write, but would send the image to the provider when enabled; provider retention/account settings and parental processing approval remain unverified. No claim about actual provider retention is made.

### MEDIUM — Shared-device learned answers lack isolation

`src/lib/archie-device-memory.ts:12,23–48,52–73` uses one browser-wide key, no account/child scope or expiry, and checks a few question terms rather than private/unsafe answer content. A current isolated test stored and retrieved a synthetic email-bearing answer to a harmless question. The clear helper has no call sites; the routing layer still uses this cache. Scope by account/child, clear on identity changes, expire entries and screen private/unsafe content before reuse. No cloud or cross-device cache sharing was found.

### MEDIUM — Teacher sessions lack throttling and server revocation

- `src/server/api/teacher/login/POST.ts:8–25`: no application throttle; raw bearer token with seven-day expiry.
- `src/server/api/teacher/me/GET.ts:10–19`: raw-token lookup plus expiry.
- `src/lib/teacher-auth.ts:39–43`: logout only removes localStorage.
- `src/server/entry.ts:313–321`: no teacher logout/revocation registration.

Client storage error recovery improved; this does not revoke stolen tokens. Keep existing password hashing while adding throttling, server revocation and protected token storage/digests through the teacher/auth owners.

### MEDIUM — Client result replay can farm rewards for an owned child

`src/server/api/children/[childId]/progress/POST.ts:47–69` validates and scopes input but accepts client scores and rewards every submission. `src/server/db/schema.ts:134–145` has no attempt-ID uniqueness. The existing passing milestone test submits identical progress twice and expects stars 999→1005 and two sessions. This is separate from the repaired cross-family defect; milestone issuance itself is serialized and avoids duplicate issuance for one threshold. Agree attempt identity/server validation with the progress owner before adding replay protection.

## What improved and actually passed

- Game GET/POST and progress GET/POST now check `children.parentId` against the authenticated account. Writes are transactional and inputs bounded. Exact paths: `src/server/api/children/[childId]/game-level/[gameSlug]/GET.ts:17–19`, sibling `POST.ts:21–27`, and `src/server/api/children/[childId]/progress/POST.ts:52–58`.
- Current role checks deny child/student/teacher access to the parent dashboard; a child cannot use a stale founder cookie or conflicting Admin flag.
- Local-first routing works in isolated source tests and does not call the provider for local answers.
- Current image/transcription requests return 503 before provider construction; forged credit/Admin fields do not change that.
- Scanner cancellation/denial recovery and microphone/camera cleanup pass mocked regression checks. Real mobile camera/mic operation is not claimed.

## Tests actually executed by SOD-03

All tests ran against exact code commit `442656b4e2ec76167b4d0b5fb7b804cf742904a5`, Node 24.19.0. TypeScript 5.9.3 and Express 5.2.1 match this checkout's package lock and were installed only in an external scratch test-dependency folder with lifecycle scripts disabled; repository package/lockfiles were unchanged. `NODE_PATH` pointed to that temporary folder.

| Command / suite | Result |
| --- | --- |
| `node --test scripts/agent29-server-reliability.test.mjs` | **FAIL: 21 PASS, 8 FAIL.** Eight older dashboard tests cannot load newly imported `virtual:content`; stale test harness, not demonstrated product bypass. |
| `node --test scripts/stable-parent-dashboard-auth.test.mjs` | **PASS: 7/7.** Current merged dashboard role and ownership harness. |
| `node --test scripts/test-admin-paid-ai-guard.mjs` | **FAIL: 0 PASS, 24 FAIL.** Legacy mock loader cannot resolve new `@/lib/auth/account-reliability` import. No target handler execution reached in these failures. |
| `node --test scripts/test-agent31-ai-routing.cjs` | **PASS: 61/61.** Includes real source Local-first and actual billing guard with mocked provider. |
| `node --test tests/scanners/scanners.test.cjs` | **PASS: 40/40.** Camera/mic/speech/provider interfaces are mocked. |
| `node --experimental-vm-modules --test scripts/agent28-data-saving-check.mjs` | **PASS: 75/75.** Includes anonymous/two-parent denial, validation, transactions and save recovery. |
| SOD-03 isolated reproduction harness, below | **9/9 observations confirmed:** seven defects reproduced, two media spending protections confirmed. A reproduced defect is a security FAIL, not a passed product acceptance check. |
| Full application build, type-check, Vitest, real database | **NOT TESTED by SOD-03 this turn.** Coordinator #25 reports its own CI successes; those are separate evidence. |
| Actual UI journey, phone/tablet viewport simulation, physical phone/camera/mic, real browser cookies | **NOT TESTED.** Node mocks and local HTTP tests are not simulated phone tests. |
| Live Stripe, voucher accounting, cancellations, provider moderation/retention, Railway settings | **NOT TESTED; no live calls or changes.** |

The five-suite aggregate was **161 cases: 129 PASS, 32 FAIL**; child-data saving added **75 PASS**. Overall existing-suite result: **236 cases, 204 PASS, 32 FAIL**. Do not report all tests green.

Initial four-suite execution stopped for missing TypeScript; that environment prerequisite was resolved before results above. An initial child-data run omitted the required `--experimental-vm-modules` flag and failed at startup; rerunning the documented command produced 75/75.

The current stable CI workflow deliberately uses a name filter for the 21 compatible Agent29 server cases plus the separate seven-test merged-dashboard suite. It does not run the legacy Admin/paid-AI Node script. Therefore these two unfiltered harness failures do not contradict Coordinator #25's stated CI result, but the obsolete scripts need reconciliation by their owners.

## Coordinator decision and remaining acceptance

1. Confirm SOD-03's security-review support under section 05 and identify one writer for shared CORS/CSRF/server-entry/auth changes. Application repair ownership is the concrete blocker to further SOD-03 implementation; this agent owns only its report.
2. Prioritize student identity, public-review moderation, school entitlement binding and CORS/CSRF. Give each finding to its existing owner and request a fixed commit/PR.
3. Require two-family, anonymous, browser-origin and entitlement-negative tests on repaired source. Keep all payment work isolated and the paid-provider guard closed.
4. Reconcile legacy test harnesses; then perform the actual signed-in parent/child, teacher, upload-denied/cancelled/oversized and account-switch journeys on a simulated mobile viewport and physical device. Record each separately.
5. SOD-03's next item remains verification of those section-05 security repairs on the coordinator-selected commit. No other section takeover or duplicate feature work is authorized by this report.

No code was repaired by SOD-03 in this handoff. No merge, Railway deployment, production setting change, force-push, main/master modification or overwrite of another agent's work was performed. The only proposed repository change is this report. Final own-branch commit/push and the draft PR link are recorded in the PR conversation after publication.

## Reproduction harness

Run in a disposable checkout of the tested commit with its TypeScript/Express versions available. Save the following block as a temporary `.cjs` file outside the repository and run `node /path/to/harness.cjs /path/to/checkout`. It uses harmless synthetic values, mocked database/provider dependencies and an ephemeral loopback HTTP server; it never connects to the production app.

```javascript
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const ts = require('typescript');
const express = require('express');
const root = path.resolve(process.argv[2]);
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const quiet = { log() {}, error() {}, warn() {} };
function load(file, mocks = {}, globals = {}) {
  const out = ts.transpileModule(read(file), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop:true}});
  const module = {exports:{}};
  vm.runInNewContext(out.outputText, {module, exports:module.exports, Buffer, Headers, console:quiet,
    process:{env:{NODE_ENV:'test',OPENAI_API_KEY:'dummy-never-used'}},
    require(name) {if (Object.hasOwn(mocks,name)) return mocks[name]; throw Error('Unexpected dependency '+name);}, ...globals}, {filename:file});
  return module.exports;
}
const response = () => ({statusCode:200,headers:{},body:null,
  status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;},send(v){this.body=v;return this;},type(v){this.headers['content-type']=v;return this;},
  setHeader(k,v){this.headers[k]=v;},end(){return this;}});
const sql=(strings,...values)=>({text:strings.join('?'),values});
(async()=>{
  const source=read('src/server/entry.ts');
  const corsSection=source.slice(source.indexOf('// --- Extremely Robust CORS'),source.indexOf('// Honour x-forwarded-'));
  let cors;
  vm.runInNewContext(corsSection,{app:{use(fn){cors=fn;}}});
  const cr=response();cors({method:'OPTIONS',headers:{origin:'https://untrusted.example'}},cr,()=>{});
  assert.equal(cr.headers['Access-Control-Allow-Origin'],'https://untrusted.example');
  assert.equal(cr.headers['Access-Control-Allow-Credentials'],'true');
  console.log('REPRODUCED: untrusted-origin credentialed CORS; security FAIL');

  let inserted;
  const review=load('src/server/api/reviews/POST.ts',{'@/server/db/client':{db:{insert(){return{values:async v=>{inserted=v;}};}}},'@/server/db/schema':{siteReviews:{}}}).default;
  const rr=response();await review({body:{authorName:'Synthetic reviewer',body:'Synthetic moderation test',stars:5},headers:{}},rr);
  assert.equal(rr.statusCode,201);assert.equal(inserted.approved,true);
  console.log('REPRODUCED: anonymous review auto-approved; security FAIL');

  for(const [file,body,expected] of [
    ['src/server/api/newsletter/migrate/POST.ts',{},'CREATE TABLE'],
    ['src/server/api/referral/convert/POST.ts',{userId:'synthetic-user'},'UPDATE referrals'],
    ['src/server/api/push/unsubscribe/POST.ts',{endpoint:'https://example.test/synthetic'},'DELETE FROM push_subscriptions'],
  ]){
    const queries=[];const db={execute:async q=>{queries.push(q);return[];}};
    const h=load(file,{'@/server/db/client':{db},'../../../db/client.js':{db},'../../../db/schema.js':{promoCodes:{}},'drizzle-orm':{sql}}).default;
    const res=response();await h({body,headers:{}},res);
    assert.equal(res.statusCode,200);assert.ok(queries[0].text.includes(expected));
    console.log('REPRODUCED: anonymous mutation '+expected+'; security FAIL');
  }

  let providers=0;
  const Provider=class{constructor(){providers++;throw Error('Provider construction forbidden');}};
  const guard=load('src/server/paid-ai-guard.ts');
  for(const [file,body] of [
    ['src/server/api/ai-teacher/read-page/POST.ts',{image:'data:image/png;base64,AA=='}],
    ['src/server/api/ai/transcribe/POST.ts',{audio:'data:audio/webm;base64,AA=='}],
  ]){
    const h=load(file,{'openai':{__esModule:true,default:Provider,toFile(){throw Error('Upload forbidden');}},'@/server/paid-ai-guard':guard}).default;
    const res=response();await h({body:{...body,credits:999999,isAdmin:true},headers:{}},res);
    assert.equal(res.statusCode,503);assert.equal(providers,0);
    console.log('PROTECTED: '+file+' 503 before provider; security PASS');
  }

  const storage=new Map();
  const memory=load('src/lib/archie-device-memory.ts',{}, {window:{},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
  memory.rememberOnlineAnswer('Explain a triangle','Synthetic private detail: person@example.test');
  assert.equal(memory.findLearnedAnswer('Explain a triangle'),'Synthetic private detail: person@example.test');
  assert.equal(storage.size,1);
  console.log('REPRODUCED: shared cache accepts private answer text; security FAIL');

  const app=express();
  assert.ok(source.includes('app.use(express.json());'));
  app.use(express.json());
  let reached=0;app.post('/api/ai-teacher/read-page',(_req,res)=>{reached++;res.status(204).end();});
  const start=source.indexOf('app.use("/api", (err: unknown');
  const block=source.slice(start,source.indexOf('\n});',start)+4);
  const compiled=ts.transpileModule(block,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(compiled,{app,Error,console:quiet});
  const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  try{
    const payload={image:'data:image/png;base64,'+Buffer.alloc(150*1024).toString('base64')};
    const result=await fetch('http://127.0.0.1:'+server.address().port+'/api/ai-teacher/read-page',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
    const error=await result.json();
    assert.equal(result.status,500);assert.equal(reached,0);assert.match(error.message,/too large/i);
    console.log('REPRODUCED: synthetic 150 KiB photo payload rejected before route and rewritten to HTTP 500; upload FAIL');
  }finally{await new Promise(resolve=>server.close(resolve));}
  console.log('9 checks completed: 7 findings reproduced, 2 protections confirmed. No external service calls.');
})().catch(error=>{console.error(error);process.exitCode=1;});
```
