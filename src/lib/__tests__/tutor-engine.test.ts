import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveRememberedChildName,
  getRememberedChildName,
  tryLocalArchieResponse
} from '../archie-local';
import { tryLocalTutor, getActivePendingQuestion, setActivePendingQuestion, clearActivePendingQuestion } from '../tutor/engine';
import { loadTutorMemory, recordQuestionAnswer } from '../tutor/memory';

describe('Local Tutoring Engine & Memory', () => {
  beforeEach(() => {
    localStorage.clear();
    clearActivePendingQuestion();
  });

  describe('Child Memory', () => {
    it('remembers a child name locally', () => {
      saveRememberedChildName('Sophie');
      expect(getRememberedChildName()).toBe('Sophie');
    });

    it('persists learning progress in memory across app restart', () => {
      recordQuestionAnswer('Maths', 'fractions', true);
      const memory = loadTutorMemory();
      expect(memory.topics['maths:fractions']).toBeDefined();
      expect(memory.topics['maths:fractions'].totalCorrect).toBe(1);
    });

    it('adapts difficulty up after consecutive correct answers', () => {
      recordQuestionAnswer('Maths', 'fractions', true);
      const res2 = recordQuestionAnswer('Maths', 'fractions', true);
      expect(res2.status).toBe('GREEN');
      expect(res2.difficultyLevel).toBe(2);
    });

    it('adapts difficulty down after repeated mistakes', () => {
      recordQuestionAnswer('Science', 'water cycle', false);
      const res2 = recordQuestionAnswer('Science', 'water cycle', false);
      expect(res2.status).toBe('RED');
      expect(res2.difficultyLevel).toBe(1);
    });
  });

  describe('Local Curriculum Lessons', () => {
    it('teaches a Maths lesson locally', () => {
      const res = tryLocalTutor('teach me fractions');
      expect(res).not.toBeNull();
      expect(res?.text).toContain('Fractions');
      expect(res?.text).toContain('numerator');
    });

    it('teaches an English lesson locally', () => {
      const res = tryLocalTutor('teach me grammar');
      expect(res).not.toBeNull();
      expect(res?.text).toContain('Nouns and Verbs');
    });

    it('keeps foundational grammar available as review for an older saved school year', () => {
      localStorage.setItem('sodafom_archie_design_v1', JSON.stringify({ settings: { year: 8 } }));
      const res = tryLocalTutor('teach me grammar');
      expect(res?.text).toContain('Nouns and Verbs');
      expect(getActivePendingQuestion()?.topic).toBe('grammar');
    });

    it('prioritises a named English topic over the generic subject', () => {
      const res = tryLocalTutor('teach me English phonics');
      expect(res?.text).toContain('Phonics and Sound Blending');
      expect(getActivePendingQuestion()?.topic).toBe('phonics');
    });

    it('does not route a younger child to an older-band lesson', () => {
      localStorage.setItem('sodafom_archie_design_v1', JSON.stringify({ settings: { year: 1 } }));
      expect(tryLocalTutor('teach me percentages')).toBeNull();
      expect(tryLocalTutor('teach me grammar')?.text).toContain('Nouns and Verbs');
    });

    it('recognises British practise as a new lesson request rather than an answer', () => {
      tryLocalTutor('teach me fractions');
      const res = tryLocalTutor('practise grammar');
      expect(res?.text).toContain("Let's practice Nouns and Verbs");
      expect(getActivePendingQuestion()?.topic).toBe('grammar');
    });

    it('teaches a Geography lesson locally', () => {
      const res = tryLocalTutor('quiz me on geography');
      expect(res).not.toBeNull();
      expect(res?.text).toContain('Europe');
    });

    it('teaches a Science lesson locally', () => {
      const res = tryLocalTutor('teach me water cycle');
      expect(res).not.toBeNull();
      expect(res?.text).toContain('Water Cycle');
      expect(res?.text).toContain('Evaporation');
    });
  });

  describe('OpenAI Fallback Integration', () => {
    it('falls back (returns null) when local engine cannot answer non-curriculum prompt', () => {
      const res = tryLocalArchieResponse('explain advanced quantum mechanics and general relativity in detail');
      expect(res).toBeNull(); // Cleanly triggers OpenAI fallback
    });
  });
});
