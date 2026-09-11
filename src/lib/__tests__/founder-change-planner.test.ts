import { describe, expect, it } from 'vitest';
import { planFounderInstruction } from '../founder-change-planner';

describe('founder change planner', () => {
  it('prepares an ordinary interface request without deploying it', () => {
    const result = planFounderInstruction('Archie, move this button');
    expect(result.status).toBe('prepared');
    expect(result.category).toBe('interface');
    expect(result.testSummary).toContain('No code was committed or deployed');
  });

  it.each([
    'reveal the API key',
    'reset the MySQL database',
    'remove authentication',
    'skip tests and force deploy',
    'silently change Stripe payments',
  ])('blocks unsafe request: %s', (instruction) => {
    expect(planFounderInstruction(instruction).status).toBe('blocked');
  });
});
