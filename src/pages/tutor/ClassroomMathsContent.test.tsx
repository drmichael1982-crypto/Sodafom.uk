import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ClassroomLessonPage from './ClassroomLessonPage';

vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: () => null }));
vi.mock('@/components/ClassroomScene', () => ({ default: () => <div>Classroom scene</div> }));
vi.mock('@/hooks/useChildAge', () => ({ getActiveChild: () => null }));
vi.mock('@/lib/voice-context', () => ({
  ttsSpeak: (_text: string, done?: () => void) => done?.(),
  stopTts: vi.fn(),
}));

const seededCloudResponse = {
  available: true,
  verifiedInventoryCount: 48,
  lesson: {
    lessonKey: 'legacy-seeded-plan',
    topic: 'planning',
    title: 'Legacy cloud plan',
    content: {
      objective: 'Explain, apply and compare with evidence, linked steps and independent examples',
      phases: [{ activities: ['Five retrieval questions from prior learning', 'Explain the topic with clear age-appropriate worked examples'] }],
      quiz: [{ q: 'Which learning goal matches today’s lesson?', a: 'Planning objective' }],
    },
  },
};

describe('Maths classroom content selection', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset().mockResolvedValue({ ok: true, json: async () => seededCloudResponse });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['5-7', /1 ten \+ 3 ones = 10 \+ 3 = 13/, 'What number is 1 ten and 1 one?', '11'],
    ['8-10', /In 462, the digit 6 is in the tens column, so its value is 60/, 'In 210, what is the value of the digit in the tens column?', '10'],
    ['11-13', /3\.47 = 3 \+ 0\.4 \+ 0\.07/, 'In 1.11, what is the value of the digit in the tenths column?', '0.1'],
  ])('shows a worked example and a real answerable question for ages %s', (age, example, question, answer) => {
    render(<MemoryRouter initialEntries={[`/tutor?subject=Maths&age=${age}&direct=1`]}><ClassroomLessonPage /></MemoryRouter>);
    expect(screen.getByText('Maths practice · available offline')).toBeInTheDocument();
    expect(screen.getByText(example)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByText(/linked steps|Five retrieval|learning goal matches/)).not.toBeInTheDocument();
    for (let stage = 0; stage < 3; stage += 1) fireEvent.click(screen.getByRole('button', { name: 'Next stage' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save activity response' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next stage' }));
    expect(screen.getByText(String(question))).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: String(answer) }));
    expect(screen.getByText(/Well done Learner/)).toBeInTheDocument();
  });

  it('switches from a seeded cloud plan to local Maths without displaying its planner prose', async () => {
    render(<MemoryRouter initialEntries={['/tutor?subject=English&age=8-10&direct=1']}><ClassroomLessonPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Legacy cloud plan')).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByRole('combobox', { name: 'Subject' }), { target: { value: 'Maths' } });
    expect(screen.getByText('Maths practice · available offline')).toBeInTheDocument();
    expect(screen.getByText(/In 462, the digit 6 is in the tens column, so its value is 60/)).toBeInTheDocument();
    expect(screen.queryByText(/Legacy cloud plan|Five retrieval|linked steps/)).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('combobox', { name: 'Lesson length' })).toHaveValue('30');
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });
});
