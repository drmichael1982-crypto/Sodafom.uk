import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { ParentTutorReport } from './ParentTutorReport';

beforeEach(() => localStorage.clear());
afterEach(cleanup);

it('renders the explicit child card memory instead of the globally active learner', () => {
  localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 2, name: 'Leo', ageGroup: '11-13' }));
  localStorage.setItem('sodafom_tutor_memory:1', JSON.stringify({
    childName: 'Mia', ageGroup: '5-7', schoolYear: 'Year 2', topics: {
      'maths:addition': { topic: 'Addition', subject: 'Maths', status: 'GREEN', difficultyLevel: 2, consecutiveCorrect: 2, consecutiveIncorrect: 0, totalAttempted: 2, totalCorrect: 2, lastPractisedAt: '2026-10-10T12:00:00.000Z' },
    },
  }));
  localStorage.setItem('sodafom_tutor_memory:2', JSON.stringify({
    childName: 'Leo', ageGroup: '11-13', schoolYear: 'Year 7', topics: {
      'science:forces': { topic: 'Forces', subject: 'Science', status: 'RED', difficultyLevel: 1, consecutiveCorrect: 0, consecutiveIncorrect: 2, totalAttempted: 2, totalCorrect: 0, lastPractisedAt: '2026-10-10T12:00:00.000Z' },
    },
  }));

  const { container } = render(<ParentTutorReport child={{ id: 1, name: 'Mia', ageGroup: '5-7' }} />);
  const report = container.querySelector('[data-tutor-report-child-id="1"]');
  expect(report).not.toBeNull();
  expect(within(report as HTMLElement).getByText('Report for Mia • Year 2 • ages 5–7')).toBeInTheDocument();
  expect(within(report as HTMLElement).getByText(/Addition - Great accuracy and confidence!/)).toBeInTheDocument();
  expect(screen.queryByText(/Forces - Scheduled/)).not.toBeInTheDocument();
  expect(screen.getByText('Device-only local tutor memory')).toBeInTheDocument();
});
