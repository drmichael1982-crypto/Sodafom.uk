import { sql } from 'drizzle-orm';
import { db } from '../db/client';
import { buildSnapshot, defaultSettings, FeatureControlError, type StoredSettings } from '../../components/admin/feature-controls-model';
import type { FeatureStore } from './service';
let initialising: Promise<void> | undefined;
async function initialise() {
  if (!initialising) {
    initialising = (async () => {
      // A dedicated admin settings row, not child, account or payment data.
      // Only an authenticated admin read/write calls this function.
      await db.execute(sql`CREATE TABLE IF NOT EXISTS admin_feature_controls (
        id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
        revision BIGINT UNSIGNED NOT NULL DEFAULT 0,
        settings JSON NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`);
      await db.execute(sql`INSERT INTO admin_feature_controls (id, revision, settings)
        VALUES (1, 0, ${JSON.stringify(defaultSettings())}) ON DUPLICATE KEY UPDATE id = id`);
    })().catch(error => { initialising = undefined; throw error; });
  }
  await initialising;
}
export const featureStore: FeatureStore = {
  async read(createIfMissing) {
    if (createIfMissing) await initialise();
    const result = await db.execute(sql`SELECT revision, settings FROM admin_feature_controls WHERE id = 1 LIMIT 1`);
    // The existing DB client can fall back to an empty mock. Never report that as a successful save.
    if (!Array.isArray(result?.[0]) || result[0].length !== 1) throw new Error('Feature store unavailable');
    const row = result[0][0];
    const revision = Number(row.revision);
    const settings = typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings;
    buildSnapshot(settings, revision);
    return { settings: settings as StoredSettings, revision };
  },
  async compareAndSet(expectedRevision, settings) {
    const result = await db.execute(sql`UPDATE admin_feature_controls
      SET settings = ${JSON.stringify(settings)}, revision = revision + 1
      WHERE id = 1 AND revision = ${expectedRevision}`);
    const affected = result?.[0]?.affectedRows;
    if (affected === 0) throw new FeatureControlError(409, 'Settings changed in another window. Reload before trying again.');
    if (affected !== 1) throw new Error('Feature store unavailable');
  },
};
