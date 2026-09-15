/** Test-only alias. This module is never imported by the application build. */
export function getSecret(name: string): string | undefined {
  if (process.env.AGENT29_TEST_DB !== '1') throw new Error('Isolated auth test flag is required.');
  return name === 'BETTER_AUTH_SECRET' ? 'agent29-disposable-test-signing-key-not-for-production' : undefined;
}
