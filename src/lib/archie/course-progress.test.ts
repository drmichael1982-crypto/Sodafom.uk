import { describe, it, expect, beforeEach } from 'vitest';
import { blankCourseProgress, readCourseProgress, saveCourseProgress, clearCourseProgress } from './course-progress';
describe('course place saved on this device', () => {
  beforeEach(() => localStorage.clear());
  it('restores a paused practice place and mission without leaking to another lesson', () => {
    const place = {phase:2,question:3,answers:[0,2,1],missions:[0],reflection:''};
    expect(saveCourseProgress('maths-1-1-1',place)).toBe(true);
    expect(readCourseProgress('maths-1-1-1',6)).toEqual(place);
    expect(readCourseProgress('history-1-1-1',6)).toEqual(blankCourseProgress());
    clearCourseProgress('maths-1-1-1');expect(readCourseProgress('maths-1-1-1',6)).toEqual(blankCourseProgress());
  });
  it('recovers from corrupted and out-of-range device data', () => {
    localStorage.setItem('sodafom_course_resume:a','broken');expect(readCourseProgress('a',6)).toEqual(blankCourseProgress());
    localStorage.setItem('sodafom_course_resume:a',JSON.stringify({phase:2,question:999,answers:[-3,0,'x'],missions:[0,0,-1,20,'x'],reflection:3}));
    expect(readCourseProgress('a',6)).toEqual({phase:2,question:5,answers:[-1,0,-1],missions:[0],reflection:''});
  });
});
