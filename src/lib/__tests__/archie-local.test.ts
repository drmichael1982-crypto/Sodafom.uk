import { describe, it, expect, beforeEach } from 'vitest';
import {
  tryLocalMaths,
  tryLocalChildName,
  getRememberedChildName,
  saveRememberedChildName,
  tryLocalFounderKnowledge,
} from '../archie-local';

describe('Archie Local Maths & Name Memory', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Child Name Memory', () => {
    it('saves child name when told "my name is Sophie"', () => {
      const res = tryLocalChildName('my name is Sophie');
      expect(res).not.toBeNull();
      expect(res?.text).toContain('Nice to meet you, Sophie');
      expect(getRememberedChildName()).toBe('Sophie');
    });

    it('remembers child name across calls', () => {
      saveRememberedChildName('Sophie');
      expect(getRememberedChildName()).toBe('Sophie');

      const res = tryLocalChildName('what is my name');
      expect(res).not.toBeNull();
      expect(res?.text).toBe('Your name is Sophie!');
    });

    it('clears remembered child name when asked to forget', () => {
      saveRememberedChildName('Sophie');
      const res = tryLocalChildName('forget my name');
      expect(res).not.toBeNull();
      expect(res?.text).toBe('Okay, I have forgotten your name!');
      expect(getRememberedChildName()).toBeNull();
    });
  });

  describe('Local Maths Engine', () => {
    it('calculates large numbers: one million times two = 2,000,000', () => {
      const res = tryLocalMaths('what is one million times two');
      expect(res).not.toBeNull();
      expect(res?.intent).toBe('maths');
      expect(res?.text).toContain('2,000,000');
    });

    it('calculates large numbers: one million times one million = 1,000,000,000,000', () => {
      const res = tryLocalMaths('what is one million times one million');
      expect(res).not.toBeNull();
      expect(res?.intent).toBe('maths');
      expect(res?.text).toContain('1,000,000,000,000');
    });

    it('calculates percentages: 15% of 400 = 60', () => {
      const res = tryLocalMaths('15% of 400');
      expect(res).not.toBeNull();
      expect(res?.intent).toBe('maths');
      expect(res?.text).toContain('60');
    });

    it('calculates powers: twelve squared = 144', () => {
      const res = tryLocalMaths('what is twelve squared');
      expect(res).not.toBeNull();
      expect(res?.intent).toBe('maths');
      expect(res?.text).toContain('144');
    });

    it('calculates square roots: square root of 144 = 12', () => {
      const res = tryLocalMaths('what is the square root of 144');
      expect(res).not.toBeNull();
      expect(res?.intent).toBe('maths');
      expect(res?.text).toContain('12');
    });

    it('uses child name in math response if remembered', () => {
      saveRememberedChildName('Sophie');
      const res = tryLocalMaths('what is one million times two');
      expect(res).not.toBeNull();
      expect(res?.text).toContain('Well done, Sophie!');
      expect(res?.text).toContain('2,000,000');
    });
  });

  describe('Verified founder knowledge', () => {
    it('knows who founded Sodafom', () => {
      const res = tryLocalFounderKnowledge('Who founded Sodafom?');
      expect(res?.text).toContain('Michael Davis');
    });

    it('knows the founder birth details supplied by Michael', () => {
      const res = tryLocalFounderKnowledge('When and where was Michael Davis born?');
      expect(res?.text).toContain('11 November 1982');
      expect(res?.text).toContain('Chase Farm Hospital');
      expect(res?.text).toContain('2:30 in the morning');
      expect(res?.text).toContain('Broxbourne');
    });
  });
});
