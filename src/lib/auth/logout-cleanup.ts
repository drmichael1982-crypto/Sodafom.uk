/** Optional legacy UI cleanup must never prevent server-side sign-out. */
export function clearLegacyFreeAccess(host: {
  readonly localStorage: { removeItem(key: string): void };
} | undefined): void {
  try {
    // Access the getter inside the try: browsers can deny storage entirely.
    host?.localStorage.removeItem('sodafom_free_access');
  } catch {
    // This flag is not an authentication credential. Leave logout to the server.
  }
}
