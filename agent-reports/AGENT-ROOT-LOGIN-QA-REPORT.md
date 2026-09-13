# AGENT-ROOT-LOGIN-QA-REPORT

- **Worker:** 5
- **Task:** Login, password-recovery, and navigation reliability pass
- **Branch:** `agent-root-login-qa-20260913`
- **Latest commit:** `5c786e6defea9a9c52a060b159a20ae69ceb2cff`
- **Pushed:** Yes
- **Master merged:** No
- **Railway deployed:** No

## Evidence-led fixes completed

1. **Same-origin web authentication**
   - Changed Better Auth client URL selection. Browser web builds now use their own origin, which preserves session cookies with the site that set them. Capacitor continues using the configured hosted API.
   - This removes a clear cross-origin cookie risk in the previous configuration, where all browser sign-in requests went directly to the Railway host.

2. **Sign-in recovery**
   - Login now trims and normalises the email before submission.
   - Network exceptions now show a plain recovery message rather than a technical exception string.

3. **Forgot-password recovery**
   - The page previously showed “Check your email” even if the server returned HTTP 500/503. It now shows success only after an HTTP-success response.
   - The success wording remains account-enumeration safe.

4. **Reset-password recovery**
   - Network exceptions now show a clear next step rather than a raw technical error.

## QA performed

- Route audit: confirmed direct routes exist for login, sign-up, forgot password, reset password, Home, Games, Reading, Museum and legacy-game safe fallback.
- Source audit: checked Better Auth client, web/mobile API configuration and all four account-recovery UI flows.
- Static review: verified each change is scoped to user-facing recovery or cookie-origin reliability; no credentials, payment, account data, or server auth rules changed.

## Not verified / blocker

- A real end-to-end sign-up, sign-in, email delivery, password reset and phone/PC click test cannot be truthfully marked passed from this workspace: no authorised test account, mail inbox, device/browser harness, or Railway service logs are available here.
- Backend CORS/cookie and email-provider configuration still need live verification before release.
- This branch is intentionally unmerged and undeployed.
