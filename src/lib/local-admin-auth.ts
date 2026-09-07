const HASH_KEY = 'sodafom_admin_password_hash_v1';
const RESET_MARKER = 'sodafom_admin_password_reset_v3';

export function prepareLocalAdminPassword(): string {
  if (typeof window === 'undefined') return '';
  if (!localStorage.getItem(RESET_MARKER)) {
    // Clear legacy plaintext/password experiments once on upgrade.
    localStorage.removeItem('sodafom_admin_custom_password');
    localStorage.removeItem('sodafom_admin_password_hash_v1');
    localStorage.setItem(RESET_MARKER, '1');
    return '';
  }
  return localStorage.getItem(HASH_KEY) || '';
}

export async function hashAdminPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function saveLocalAdminPassword(password: string): Promise<string> {
  const hash = await hashAdminPassword(password);
  localStorage.setItem(HASH_KEY, hash);
  return hash;
}

export function clearLocalAdminPassword(): void {
  localStorage.removeItem(HASH_KEY);
  localStorage.removeItem('sodafom_admin_custom_password');
}
