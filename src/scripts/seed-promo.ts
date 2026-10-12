import { db } from '../server/db/client';
import { promoCodes } from '../server/db/schema';

async function main() {
  await db.insert(promoCodes).values({
    code: '1182',
    description: 'Founder free access code',
    accessType: 'free',
    maxUses: null,
    active: true,
  }).onDuplicateKeyUpdate({ set: { active: true } });
  console.log('✅ Promo code 1182 seeded');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
