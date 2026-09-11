import { describe, expect, it } from 'vitest';
import {
  approveFamilyChore,
  createFamilyChore,
  formatPocketMoney,
  loadFamilyChores,
  markFamilyChoreComplete,
  returnFamilyChore,
} from './family-chores';

const NOW = new Date('2026-09-11T10:00:00.000Z');

describe('family chores', () => {
  it('creates a parent-assigned chore in pence', () => {
    const chore = createFamilyChore({ childName: 'Archie', title: '  Feed   the dogs ', rewardPounds: 1.5 }, NOW);
    expect(chore.childName).toBe('Archie');
    expect(chore.title).toBe('Feed the dogs');
    expect(chore.rewardPence).toBe(150);
    expect(chore.status).toBe('assigned');
  });

  it('requires child completion before parent approval', () => {
    const chore = createFamilyChore({ childName: 'Archie', title: 'Set the table', rewardPounds: 0.5 }, NOW);
    expect(approveFamilyChore([chore], chore.id, NOW)[0].status).toBe('assigned');

    const waiting = markFamilyChoreComplete([chore], chore.id, NOW);
    expect(waiting[0].status).toBe('waiting-for-parent');
    expect(approveFamilyChore(waiting, chore.id, NOW)[0].status).toBe('approved');
  });

  it('lets a parent return a chore for another try', () => {
    const chore = createFamilyChore({ childName: 'Archie', title: 'Tidy bedroom', rewardPounds: 2 }, NOW);
    const waiting = markFamilyChoreComplete([chore], chore.id, NOW);
    expect(returnFamilyChore(waiting, chore.id)[0].status).toBe('assigned');
  });

  it('loads only valid saved chores and formats pounds', () => {
    const chore = createFamilyChore({ childName: 'Archie', title: 'Help wash the car', rewardPounds: 3 }, NOW);
    const storage = { getItem: () => JSON.stringify([chore, { broken: true }]) };
    expect(loadFamilyChores(storage)).toEqual([chore]);
    expect(formatPocketMoney(350)).toBe('£3.50');
  });
});
