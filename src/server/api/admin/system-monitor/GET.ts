import type { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db, testConnection } from '@/server/db/client';
import { getSecret } from '#airo/secrets';
import { hasAdminAccess } from '@/server/admin-auth';
import { createHash, timingSafeEqual } from 'node:crypto';
function constantTimeEqual(value: unknown, expected: string): boolean {
  if (typeof value !== 'string' || !value || value.length > 256) return false;
  return timingSafeEqual(createHash('sha256').update(value).digest(), createHash('sha256').update(expected).digest());
}

type Check = { id: string; label: string; status: 'healthy' | 'unavailable' | 'configured' | 'not-configured' | 'not-tested'; detail: string };
// Only aggregate health is returned. No identities, secrets, chats, images or payment details.
let running: Promise<unknown> | null = null;
let cached: { at: number; value: unknown } | null = null;
async function collect() {
  const checks: Check[] = [{ id: 'api', label: 'Web API', status: 'healthy', detail: 'This monitoring endpoint responded.' }];
  const databaseReady = await testConnection();
  checks.push({ id:'database', label:'Database', status:databaseReady ? 'healthy':'unavailable', detail:databaseReady ? 'Live connection and ping succeeded.' : 'A database connection could not be verified.' });
  let storage: { databaseTableBytes: number | null; lessonJsonBytes: number | null; lessons: number | null; scope: string } = {
    databaseTableBytes:null, lessonJsonBytes:null, lessons:null,
    scope:'Table/index allocation and active lesson JSON only. Provider disk usage, backups and external media are separate.',
  };
  if (databaseReady) {
    try {
      const result = await db.execute(sql`SELECT COALESCE(SUM(data_length + index_length),0) AS bytes FROM information_schema.tables WHERE table_schema = DATABASE()`);
      const bytes = Number(result?.[0]?.[0]?.bytes); if (Number.isFinite(bytes)) storage.databaseTableBytes = bytes;
    } catch { /* Keep unavailable measurements null, never invent zero. */ }
    try {
      const result = await db.execute(sql`SELECT COUNT(*) AS lessons, COALESCE(SUM(OCTET_LENGTH(lesson_json)),0) AS bytes FROM education_cloud_lessons WHERE active = 1`);
      const row = result?.[0]?.[0];
      if (!row) throw new Error('Missing result');
      storage.lessons = Number(row.lessons); storage.lessonJsonBytes = Number(row.bytes);
      checks.push({ id:'lessons', label:'Cloud lesson catalogue', status:'healthy', detail:`${storage.lessons} active stored templates. Educational quality and duration are not validated by this count.` });
    } catch { checks.push({ id:'lessons',label:'Cloud lesson catalogue',status:'unavailable',detail:'The active lesson catalogue could not be read.' }); }
  } else checks.push({ id:'lessons',label:'Cloud lesson catalogue',status:'not-tested',detail:'Database unavailable.' });
  for (const [id,label,keys] of [
    ['auth','Accounts',['BETTER_AUTH_SECRET']],
    ['ai','Paid AI',['OPENAI_API_KEY']],
    ['payments','Payments',['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET']],
  ] as const) {
    const configured = keys.every(key => { try { return !!getSecret(key); } catch { return false; } });
    checks.push({ id,label,status:configured ? 'configured':'not-configured',detail:configured ? 'Server settings present; end-to-end operation has not been tested by this check.' : 'One or more required server settings are missing.' });
  }
  checks.push({ id:'billing',label:'Paid-AI voucher ledger',status:'not-configured',detail:'Paid AI remains blocked by the spending safeguard until a live-payment ledger and atomic credit debits are connected and tested.' });
  for (const [id,label] of [['games','Games and buttons'],['homework','Homework and reading scanner'],['permissions','Camera and microphone']] as const) {
    checks.push({ id,label,status:'not-tested',detail:'Requires interactive device testing. This monitor does not open a microphone or camera.' });
  }
  return { success:true, generatedAt:new Date().toISOString(), checks, storage, productionChangesAllowed:false };
}
export default async function handler(req: Request, res: Response) {
  res.setHeader('Cache-Control','no-store');
  // Optional read-only pathway for a separately configured 797 agent. Disabled by default.
  const token = process.env.SODAFOM_MONITOR_TOKEN;
  const monitorAllowed = !!token && token.length >= 32 && constantTimeEqual(req.headers['x-monitor-token'], token);
  if (!monitorAllowed && !await hasAdminAccess(req)) { res.status(401).json({ success:false, error:'Owner access required' }); return; }
  try {
    if (cached && Date.now() - cached.at < 15000) { res.json(cached.value); return; }
    if (!running) running = collect().then(value => { cached = { at:Date.now(),value }; return value; }).finally(() => { running = null; });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const value = await Promise.race([running, new Promise((_,reject) => { timer = setTimeout(() => reject(new Error('timeout')),6000); })]);
      res.json(value);
    } finally { clearTimeout(timer); }
  } catch { res.status(503).json({ success:false, error:'Monitoring is temporarily unavailable. No healthy status has been assumed.' }); }
}
