import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@dr.pogodin/react-helmet', () => ({ Helmet: ({ children }: { children?: unknown }) => <>{children}</> }));
vi.mock('@/components/ArchieCharacter', () => ({ ArchieCharacter: () => <div>Classroom tutor</div> }));
vi.mock('@/components/Blackboard', () => ({ Blackboard: ({ topicTitle }: { topicTitle: string }) => <div>Blackboard: {topicTitle}</div> }));
vi.mock('@/lib/teacher-auth', () => ({
  getTeacherProfile: () => ({ id: 7, name: 'Teacher', email: 'teacher@example.test', className: 'Oak Class' }),
}));
vi.mock('@/lib/voice-context', () => ({ stopTts: vi.fn(), ttsSpeak: vi.fn() }));
vi.mock('@/lib/tutor/memory', () => ({
  loadTutorMemory: () => ({ childName: 'Sam', ageGroup: '8-10', preferredTutor: 'archie', readAloudPreference: false, topics: {} }),
  recordQuestionAnswer: vi.fn(),
  saveTutorMemory: vi.fn(),
}));

import ClassroomLessonPage from './ClassroomLessonPage';

afterEach(cleanup);

describe('ClassroomLessonPage teacher boundary', () => {
  it('shows the existing Teacher Hub connection without uploading lesson data', () => {
    render(<MemoryRouter><ClassroomLessonPage /></MemoryRouter>);

    expect(screen.getByText(/does not send answers, recordings, or marks/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Teacher Hub' })).toHaveAttribute('href', '/teacher-hub');
    expect(screen.getByText(/classroom lesson/i)).toBeInTheDocument();
  });
});
