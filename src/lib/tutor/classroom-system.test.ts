import { describe, expect, it } from 'vitest';
import {
  answerMatches,
  buildLessonStagePlan,
  getEnvironment,
  getPeFocus,
  isContinueRequest,
  isHelpRequest,
  lessonProgressPercent,
  pickCloudLessonIndex,
  scalePhaseMinutes,
} from './classroom-system';

describe('classroom lesson system', () => {
  it.each([15, 20, 30, 60] as const)('allocates every minute for a %i minute academic lesson', (duration) => {
    const stages = buildLessonStagePlan(duration, false);
    expect(stages.reduce((sum, stage) => sum + stage.minutes, 0)).toBe(duration);
    expect(stages.every((stage) => stage.minutes >= 1)).toBe(true);
  });

  it.each([15, 20, 30, 60] as const)('allocates every minute for a %i minute PE lesson', (duration) => {
    const stages = buildLessonStagePlan(duration, true);
    expect(stages.reduce((sum, stage) => sum + stage.minutes, 0)).toBe(duration);
  });

  it('cycles through PE environments without pretending to observe performance', () => {
    expect(getPeFocus(1).key).toBe('football');
    expect(getEnvironment('PE', 1)).toBe('football-field');
    expect(getPeFocus(8).key).toBe('football');
    expect(getEnvironment('Maths', 1)).toBe('classroom');
  });

  it('scales cloud phases to the selected duration', () => {
    const phases = scalePhaseMinutes([{ minutes: 5, name: 'Warm-up' }, { minutes: 10, name: 'Teach' }, { minutes: 15, name: 'Practice' }], 15);
    expect(phases.reduce((sum, phase) => sum + phase.minutes, 0)).toBe(15);
  });

  it('recognises help and resume phrases', () => {
    expect(isHelpRequest("I don't understand this")).toBe(true);
    expect(isContinueRequest('I am ready')).toBe(true);
  });

  it('matches spoken answers without punctuation noise', () => {
    expect(answerMatches('  Ten! ', '10', ['ten'])).toBe(true);
    expect(answerMatches('eleven', '10', ['ten'])).toBe(false);
  });

  it('keeps progress and cloud lesson selection deterministic', () => {
    expect(lessonProgressPercent(100, 25)).toBe(75);
    expect(pickCloudLessonIndex(7, 6)).toBe(0);
    expect(pickCloudLessonIndex(1, 0)).toBe(-1);
  });
});
