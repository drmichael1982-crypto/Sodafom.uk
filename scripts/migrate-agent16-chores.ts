/** Use only against an explicitly selected backed-up test database before any production review. */
import { migrateAgent16Chores } from '../src/server/db/migrations/agent16-chores';
import { closeConnection } from '../src/server/db/client';
if (!process.argv.includes('--apply-agent16-chores')) {
  console.error('Nothing changed. This command requires --apply-agent16-chores and an explicitly configured database.');
  process.exitCode = 1;
} else {
  try { await migrateAgent16Chores(); console.log('Agent 16 additive chores migration completed.'); }
  catch (error) { console.error(error instanceof Error ? error.message : 'Chores migration failed.'); process.exitCode = 1; }
  finally { await closeConnection(); }
}
