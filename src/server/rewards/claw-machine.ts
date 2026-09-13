import { mysqlTable, int, varchar, timestamp } from 'drizzle-orm/mysql-core';
import { and, asc, count, desc, eq, gt, sql } from 'drizzle-orm';
import { db } from '@/server/db/client';
import {
  activitySessions,
  childCharacters,
  children,
  rewardCharacters,
} from '@/server/db/schema';
import {
  calculateClawTurns,
  isValidClawPlayToken,
  stablePrizeIndex,
  type ClawTurnSummary,
} from '@/lib/claw-machine';

const clawMachinePlays = mysqlTable('claw_machine_plays', {
  id: int('id').primaryKey().autoincrement(),
  childId: int('child_id').notNull(),
  playToken: varchar('play_token', { length: 64 }).notNull(),
  characterId: int('character_id').notNull(),
  playedAt: timestamp('played_at').defaultNow(),
});

export interface ClawCollectionPrize {
  playToken: string;
  characterId: number;
  name: string;
  emoji: string;
  unlockedAt: Date | null;
}

export interface ClawMachineState extends ClawTurnSummary {
  availablePrizeCount: number;
  collection: ClawCollectionPrize[];
}

export class ClawMachineError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: 'invalid_request' | 'child_not_found' | 'no_turns' | 'collection_complete' | 'unavailable',
    message: string,
  ) {
    super(message);
    this.name = 'ClawMachineError';
  }
}

let tableReady: Promise<void> | null = null;

/** Safe to run repeatedly; keeps the feature deployable without a destructive migration. */
export function ensureClawMachineStorage(): Promise<void> {
  if (!tableReady) {
    tableReady = db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS claw_machine_plays (
        id INT PRIMARY KEY AUTO_INCREMENT,
        child_id INT NOT NULL,
        play_token VARCHAR(64) NOT NULL,
        character_id INT NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_claw_child_token (child_id, play_token),
        KEY idx_claw_child_played (child_id, played_at),
        CONSTRAINT fk_claw_child FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
        CONSTRAINT fk_claw_character FOREIGN KEY (character_id) REFERENCES reward_characters(id) ON DELETE RESTRICT
      )
    `)).then(() => undefined).catch((error: unknown) => {
      tableReady = null;
      throw error;
    });
  }
  return tableReady;
}

async function verifyOwnedChild(executor: any, childId: number, userId: string) {
  const [child] = await executor
    .select({ id: children.id })
    .from(children)
    .where(and(eq(children.id, childId), eq(children.parentId, userId)))
    .limit(1);
  return child ?? null;
}

async function loadState(executor: any, childId: number): Promise<ClawMachineState> {
  const [learningRow] = await executor
    .select({ value: count() })
    .from(activitySessions)
    .where(and(eq(activitySessions.childId, childId), gt(activitySessions.starsEarned, 0)));

  const [playsRow] = await executor
    .select({ value: count() })
    .from(clawMachinePlays)
    .where(eq(clawMachinePlays.childId, childId));

  const activeCharacters = await executor
    .select({ id: rewardCharacters.id })
    .from(rewardCharacters)
    .where(eq(rewardCharacters.active, true));

  const owned = await executor
    .select({ characterId: childCharacters.characterId })
    .from(childCharacters)
    .where(eq(childCharacters.childId, childId));
  const ownedIds = new Set<number>(owned.map((row: any) => Number(row.characterId)));

  const collection = await executor
    .select({
      playToken: clawMachinePlays.playToken,
      characterId: rewardCharacters.id,
      name: rewardCharacters.name,
      emoji: rewardCharacters.emoji,
      unlockedAt: clawMachinePlays.playedAt,
    })
    .from(clawMachinePlays)
    .innerJoin(rewardCharacters, eq(clawMachinePlays.characterId, rewardCharacters.id))
    .where(eq(clawMachinePlays.childId, childId))
    .orderBy(desc(clawMachinePlays.playedAt));

  const turnSummary = calculateClawTurns(
    Number(learningRow?.value ?? 0),
    Number(playsRow?.value ?? 0),
  );

  return {
    ...turnSummary,
    availablePrizeCount: activeCharacters.filter((character: any) => !ownedIds.has(Number(character.id))).length,
    collection: collection.map((prize: any) => ({
      ...prize,
      characterId: Number(prize.characterId),
    })),
  };
}

export async function getClawMachineState(childId: number, userId: string): Promise<ClawMachineState> {
  if (!Number.isInteger(childId) || childId <= 0) {
    throw new ClawMachineError(400, 'invalid_request', 'Choose a child before opening the claw machine.');
  }

  await ensureClawMachineStorage();
  const child = await verifyOwnedChild(db, childId, userId);
  if (!child) throw new ClawMachineError(403, 'child_not_found', 'Child not found.');
  return loadState(db, childId);
}

export async function playClawMachine(childId: number, userId: string, playToken: unknown) {
  if (!Number.isInteger(childId) || childId <= 0 || !isValidClawPlayToken(playToken)) {
    throw new ClawMachineError(400, 'invalid_request', 'The claw turn could not be started safely.');
  }

  await ensureClawMachineStorage();
  if (typeof (db as any).transaction !== 'function') {
    throw new ClawMachineError(503, 'unavailable', 'The claw machine is temporarily unavailable. Your turn was not used.');
  }

  return (db as any).transaction(async (tx: any) => {
    // Serialize plays for this child. This prevents two different requests from
    // spending the same learning-earned turn during a double tap or reconnect.
    await tx.execute(sql`SELECT id FROM children WHERE id = ${childId} AND parent_id = ${userId} FOR UPDATE`);

    const child = await verifyOwnedChild(tx, childId, userId);
    if (!child) throw new ClawMachineError(403, 'child_not_found', 'Child not found.');

    const [previousPlay] = await tx
      .select({
        characterId: rewardCharacters.id,
        name: rewardCharacters.name,
        emoji: rewardCharacters.emoji,
        unlockedAt: clawMachinePlays.playedAt,
      })
      .from(clawMachinePlays)
      .innerJoin(rewardCharacters, eq(clawMachinePlays.characterId, rewardCharacters.id))
      .where(and(
        eq(clawMachinePlays.childId, childId),
        eq(clawMachinePlays.playToken, playToken),
      ))
      .limit(1);

    if (previousPlay) {
      return {
        success: true,
        idempotent: true,
        prize: previousPlay,
        clawMachine: await loadState(tx, childId),
      };
    }

    const stateBefore = await loadState(tx, childId);
    if (stateBefore.availableTurns <= 0) {
      throw new ClawMachineError(409, 'no_turns', 'Complete more learning to earn your next claw turn.');
    }

    const characters = await tx
      .select({
        id: rewardCharacters.id,
        name: rewardCharacters.name,
        emoji: rewardCharacters.emoji,
        sortOrder: rewardCharacters.sortOrder,
      })
      .from(rewardCharacters)
      .where(eq(rewardCharacters.active, true))
      .orderBy(asc(rewardCharacters.sortOrder));

    const owned = await tx
      .select({ characterId: childCharacters.characterId })
      .from(childCharacters)
      .where(eq(childCharacters.childId, childId));
    const ownedIds = new Set<number>(owned.map((row: any) => Number(row.characterId)));
    const available = characters.filter((character: any) => !ownedIds.has(Number(character.id)));

    if (available.length === 0) {
      throw new ClawMachineError(409, 'collection_complete', 'Your reward collection is complete. Your turn was not used.');
    }

    const prize = available[stablePrizeIndex(playToken, available.length)];
    await tx.insert(childCharacters).values({ childId, characterId: prize.id });
    await tx.insert(clawMachinePlays).values({ childId, playToken, characterId: prize.id });

    return {
      success: true,
      idempotent: false,
      prize: {
        characterId: Number(prize.id),
        name: prize.name,
        emoji: prize.emoji,
        unlockedAt: new Date(),
      },
      clawMachine: await loadState(tx, childId),
    };
  });
}
