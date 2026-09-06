/**
 * VAPID key management — generates once and persists to /private/vapid-keys.json
 * so the same keys survive server restarts (subscriptions break if keys change).
 */
import webpush from 'web-push';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const KEY_PATH = '/private/vapid-keys.json';

interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

let cached: VapidKeys | null = null;

export async function getOrCreateVapidKeys(): Promise<VapidKeys> {
  if (cached) return cached;

  // Try to load from persistent storage
  if (existsSync(KEY_PATH)) {
    try {
      const raw = readFileSync(KEY_PATH, 'utf-8');
      cached = JSON.parse(raw) as VapidKeys;
      return cached;
    } catch {
      // Fall through to regenerate
    }
  }

  // Generate new VAPID keys
  const keys = webpush.generateVAPIDKeys();
  cached = { publicKey: keys.publicKey, privateKey: keys.privateKey };

  // Persist
  try {
    mkdirSync('/private', { recursive: true });
    writeFileSync(KEY_PATH, JSON.stringify(cached, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️  Could not persist VAPID keys:', err);
  }

  return cached;
}
