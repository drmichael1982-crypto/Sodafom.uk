import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildDailyCurriculumLesson } from '@/lib/tutor/curriculum-year-plan';
import { loadTutorLessonResults, loadTutorMemory } from '@/lib/tutor/memory';

import TeacherModePage from './TeacherModePage';

vi.mock('@/components/ArchieCharacter', () => ({
  ArchieCharacter: () => <div aria-label="Archie tutor" />,
}));

vi.mock('@/lib/voice-context', () => ({
  stopTts: vi.fn(),
  ttsSpeak: vi.fn((_text: string, onDone?: () => void) => onDone?.()),
}));

function renderTutor() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/tutor?subject=Maths&direct=1']}>
        <TeacherModePage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('Tutor lesson question flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it('locks a correct answer, records it once and advances to the next question', () => {
    renderTutor();
    const lesson = buildDailyCurriculumLesson({ subject: 'Maths', ageGroup: '8-10', day: 1, durationMinutes: 30 });
    const firstQuestion = lesson.questions[0];
    const secondQuestion = lesson.questions[1];
    const correctAnswer = screen.getByRole('button', { name: firstQuestion.answer });

    fireEvent.click(correctAnswer);
    expect(correctAnswer).toBeDisabled();
    fireEvent.click(correctAnswer);

    const savedTopic = loadTutorMemory().topics['maths:number-and-place-value'];
    expect(savedTopic.totalAttempted).toBe(1);
    expect(savedTopic.totalCorrect).toBe(1);

    act(() => vi.advanceTimersByTime(2500));
    expect(screen.getByText(secondQuestion.question)).toBeInTheDocument();
  });

  it('saves and shows one result when the selected lesson time ends', () => {
    localStorage.setItem('sodafom_lesson_minutes', '15');
    renderTutor();

    act(() => vi.advanceTimersByTime(15 * 60 * 1000));

    const results = screen.getByRole('region', { name: 'Lesson results' });
    expect(results).toBeInTheDocument();
    expect(screen.getByText('Lesson complete! 🎉')).toBeInTheDocument();
    expect(within(results).getByText('100%')).toBeInTheDocument();
    expect(loadTutorLessonResults()).toHaveLength(1);
    expect(loadTutorLessonResults()[0]).toMatchObject({ subject: 'Maths', durationMinutes: 15, completionReason: 'time' });
  });
});
