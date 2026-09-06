import { describe, it, expect, beforeEach } from 'vitest';
import { loadTutorMemory, saveTutorMemory, recordQuestionAnswer, getWeakAndStrongTopics, ChildTutorProfile } from '../tutor/memory';
import { CURRICULUM_LESSONS } from '../tutor/curriculum';
import { tryLocalTutor, clearActivePendingQuestion } from '../tutor/engine';
import { parseTutorVoiceCommand } from '../tutor/voice-commands';
import { tryLocalArchieResponse } from '../archie-local';

describe('One-to-One Teacher Mode & Parent Dashboard Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    clearActivePendingQuestion();
  });

  describe('Profile Onboarding & Persistence', () => {
    it('initial profile returns empty name when unconfigured', () => {
      const memory = loadTutorMemory();
      expect(memory.childName).toBeUndefined();
    });

    it('saves parent profile details and persists across restart', () => {
      const profile: ChildTutorProfile = {
        childName: 'Sophie',
        ageGroup: '8-10',
        schoolYear: 'Year 4',
        preferredTutor: 'soda',
        readAloudPreference: true,
        topics: {}
      };
      saveTutorMemory(profile);

      const loaded = loadTutorMemory();
      expect(loaded.childName).toBe('Sophie');
      expect(loaded.ageGroup).toBe('8-10');
      expect(loaded.preferredTutor).toBe('soda');
    });

    it('Archie naturally uses the child name during lessons', () => {
      saveTutorMemory({ childName: 'Sophie', ageGroup: '8-10', topics: {} });
      const res = tryLocalTutor('teach me fractions');
      expect(res).not.toBeNull();
      expect(res?.text).toContain('Sophie');
    });
  });

  describe('Adaptive Learning & RED/AMBER/GREEN Progress', () => {
    it('marks correct answers and raises difficulty after consecutive success', () => {
      recordQuestionAnswer('Maths', 'fractions', true);
      const res2 = recordQuestionAnswer('Maths', 'fractions', true);
      expect(res2.status).toBe('GREEN');
      expect(res2.difficultyLevel).toBe(2);

      const { strong } = getWeakAndStrongTopics();
      expect(strong).toContain('fractions');
    });

    it('lowers difficulty and sets RED status after repeated mistakes', () => {
      recordQuestionAnswer('Science', 'water cycle', false);
      const res2 = recordQuestionAnswer('Science', 'water cycle', false);
      expect(res2.status).toBe('RED');
      expect(res2.difficultyLevel).toBe(1);

      const { weak } = getWeakAndStrongTopics();
      expect(weak).toContain('water cycle');
    });
  });

  describe('Curriculum Lessons & Blackboard Content', () => {
    it('runs Maths lesson locally', () => {
      const lesson = CURRICULUM_LESSONS.find(l => l.subject === 'Maths');
      expect(lesson).toBeDefined();
      expect(lesson?.explanation).toBeDefined();
      expect(lesson?.questions.length).toBeGreaterThan(0);

      const res = tryLocalTutor('teach me fractions');
      expect(res?.text).toContain('Fractions');
    });

    it('runs English lesson locally', () => {
      const lesson = CURRICULUM_LESSONS.find(l => l.subject === 'English');
      expect(lesson).toBeDefined();
      const res = tryLocalTutor('teach me grammar');
      expect(res?.text).toContain('Nouns and Verbs');
    });

    it('runs Geography lesson locally', () => {
      const lesson = CURRICULUM_LESSONS.find(l => l.subject === 'Geography');
      expect(lesson).toBeDefined();
      const res = tryLocalTutor('quiz me on geography');
      expect(res?.text).toContain('Europe');
    });

    it('runs Science lesson locally', () => {
      const lesson = CURRICULUM_LESSONS.find(l => l.subject === 'Science');
      expect(lesson).toBeDefined();
      const res = tryLocalTutor('teach me water cycle');
      expect(res?.text).toContain('Water Cycle');
    });
  });

  describe('Voice Commands & Read-Aloud Parser', () => {
    it('parses "read the question" command', () => {
      expect(parseTutorVoiceCommand('read the question to me')).toBe('read_question');
    });

    it('parses "give me a hint" command', () => {
      expect(parseTutorVoiceCommand('Archie give me a hint')).toBe('hint');
    });

    it('parses "explain it another way" command', () => {
      expect(parseTutorVoiceCommand('explain it another way')).toBe('explain_another_way');
    });

    it('parses "stop reading" command', () => {
      expect(parseTutorVoiceCommand('stop reading')).toBe('stop');
    });
  });

  describe('OpenAI Fallback & Ask Archie Integration', () => {
    it('falls back cleanly to null for open-ended generative requests', () => {
      const res = tryLocalArchieResponse('Write a 5-paragraph creative story about a magical dragon visiting London');
      expect(res).toBeNull(); // Triggers OpenAI backend fallback
    });
  });
});
