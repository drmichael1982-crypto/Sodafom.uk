import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearSavedArchieAnswers,
  findSavedArchieAnswer,
  rememberCloudArchieAnswer,
} from '../archie-device-memory';

describe('saved Archie answer cache', () => {
  beforeEach(() => clearSavedArchieAnswers());

  it('returns a normalised repeat question from the same learning scope', () => {
    rememberCloudArchieAnswer('What is a simile?', 'It compares two things using like or as.', 'ai-teacher-age-8');

    expect(findSavedArchieAnswer('what is a SIMILE', 'ai-teacher-age-8'))
      .toBe('It compares two things using like or as.');
  });

  it('does not reuse a saved answer across age-specific scopes', () => {
    rememberCloudArchieAnswer('Explain fractions', 'An age-8 answer.', 'ai-teacher-age-8');

    expect(findSavedArchieAnswer('Explain fractions', 'ai-teacher-age-10')).toBeNull();
  });

  it('does not store likely personal or account questions', () => {
    rememberCloudArchieAnswer('My password is red-rocket', 'Do not share passwords.', 'general');
    rememberCloudArchieAnswer('My name is Sophie', 'Hello Sophie!', 'general');

    expect(findSavedArchieAnswer('My password is red-rocket', 'general')).toBeNull();
    expect(findSavedArchieAnswer('My name is Sophie', 'general')).toBeNull();
  });
});
