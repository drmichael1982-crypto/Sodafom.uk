/** Test-only BetterAuth secret for a disposable, loopback-only database. */
export function getSecret(name: string): string | undefined {
  if (process.env.AGENT18_TEST_DB !== '1') throw new Error('Isolated auth test flag is required.');
  return name === 'BETTER_AUTH_SECRET' ? 'agent18-disposable-test-signing-key-not-for-production' : undefined;
}
