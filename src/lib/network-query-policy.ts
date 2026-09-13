/** Do not queue an offline button press for surprise submission on reconnect.
 * Existing feature handlers retain ownership of progress and user-led retries.
 */
export const networkMutationDefaults = {
  retry: 0,
  networkMode: 'always',
} as const;
