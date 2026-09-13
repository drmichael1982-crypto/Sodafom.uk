import { describe, expect, it } from 'vitest';
import {
  FAMILY_CHORES_STORAGE_KEY,
  approveFamilyChore,
  approvedRewardSummary,
  archiveFamilyChore,
  createFamilyChore,
  formatFamilyReward,
  loadFamilyChores,
  parseRewardValue,
  returnFamilyChore,
  submitFamilyChore,
} from '../family-chores';

const NOW = new Date('2026-09-13T09:00:00.000Z');

describe('device-local family chores', () => {
  it('creates a small safe chore only after a grown-up safety confirmation', () => {
    const chore = createFamilyChore({
      title: '  Put   books back on the shelf ',
      rewardKind: 'points',
      rewardValue: '5',
      safetyConfirmed: true,
    }, NOW);

    expect(chore.title).toBe('Put books back on the shelf');
    expect(chore.status).toBe('ready');
    expect(chore.reward).toEqual({ kind: 'points', points: 5, pence: 0 });
    expect(chore.createdAt).toBe(NOW.toISOString());
  });

  it('rejects unsafe task wording and an unchecked grown-up confirmation', () => {
    expect(() => createFamilyChore({
      title: 'Put toys away', rewardKind: 'points', rewardValue: '5', safetyConfirmed: false,
    }, NOW)).toThrow(/grown-up/i);

    expect(() => createFamilyChore({
      title: 'Clean the oven', rewardKind: 'points', rewardValue: '5', safetyConfirmed: true,
    }, NOW)).toThrow(/child-safe/i);
  });

  it('parses money as exact pence and never treats it as a transfer', () => {
    expect(parseRewardValue('pocket-money', '1.5')).toEqual({ kind: 'pocket-money', points: 0, pence: 150 });
    expect(formatFamilyReward({ kind: 'pocket-money', points: 0, pence: 150 })).toBe('£1.50');
    expect(() => parseRewardValue('pocket-money', '50.01')).toThrow(/£0.00 to £50.00/i);
  });

  it('requires a child submission before a single grown-up approval is recorded', () => {
    const chore = createFamilyChore({ title: 'Pair clean socks', rewardKind: 'points', rewardValue: '7', safetyConfirmed: true }, NOW);
    const beforeSubmission = approveFamilyChore([chore], chore.id, NOW);
    expect(beforeSubmission[0].status).toBe('ready');

    const waiting = submitFamilyChore([chore], chore.id, NOW);
    expect(waiting[0].status).toBe('waiting-for-parent');

    const approved = approveFamilyChore(waiting, chore.id, NOW);
    expect(approved[0].status).toBe('approved');
    const afterSecondApproval = approveFamilyChore(approved, chore.id, new Date('2026-09-14T09:00:00.000Z'));
    expect(afterSecondApproval).toEqual(approved);
  });

  it('records no reward for waiting or returned work, then lets the child retry', () => {
    const chore = createFamilyChore({ title: 'Tidy art supplies', rewardKind: 'pocket-money', rewardValue: '0.50', safetyConfirmed: true }, NOW);
    const waiting = submitFamilyChore([chore], chore.id, NOW);
    expect(approvedRewardSummary(waiting)).toEqual({ points: 0, pocketMoneyPence: 0, approvedCount: 0 });

    const returned = returnFamilyChore(waiting, chore.id, 'Please have another go with a grown-up.');
    expect(returned[0].status).toBe('needs-another-try');
    expect(approvedRewardSummary(returned)).toEqual({ points: 0, pocketMoneyPence: 0, approvedCount: 0 });

    const approved = approveFamilyChore(submitFamilyChore(returned, chore.id, NOW), chore.id, NOW);
    expect(approvedRewardSummary(approved)).toEqual({ points: 0, pocketMoneyPence: 50, approvedCount: 1 });
  });

  it('never archives a chore that is waiting for a grown-up review', () => {
    const chore = createFamilyChore({ title: 'Put napkins on the table', rewardKind: 'points', rewardValue: '2', safetyConfirmed: true }, NOW);
    const waiting = submitFamilyChore([chore], chore.id, NOW);
    expect(archiveFamilyChore(waiting, chore.id)[0].status).toBe('waiting-for-parent');
  });

  it('loads only valid, safe device-local records', () => {
    const chore = createFamilyChore({ title: 'Put toys back in their box', rewardKind: 'points', rewardValue: '3', safetyConfirmed: true }, NOW);
    const storage = {
      getItem: (key: string) => key === FAMILY_CHORES_STORAGE_KEY ? JSON.stringify([chore, { title: 'Clean the oven' }]) : null,
    };
    expect(loadFamilyChores(storage)).toEqual([chore]);
  });
});
