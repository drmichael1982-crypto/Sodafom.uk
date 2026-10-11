import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ParentTutorReport } from './ParentTutorReport';

describe('ParentTutorReport learner scoping', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('shows the requested learner memory instead of the active sibling memory', () => {
    localStorage.setItem('sodafom_active_child', JSON.stringify({ id: 1, name: 'Alice', ageGroup: '5-7' }));
    localStorage.setItem('sodafom_tutor_memory:1', JSON.stringify({
      childName: 'Alice', ageGroup: '5-7', topics: {
        'maths:addition': { topic: 'addition', subject: 'maths', status: 'GREEN' },
      },
    }));
    localStorage.setItem('sodafom_tutor_memory:2', JSON.stringify({
      childName: 'Bob', ageGroup: '11-13', topics: {
        'science:forces': { topic: 'forces', subject: 'science', status: 'RED' },
      },
    }));

    const { container } = render(
      <ParentTutorReport childId={2} childName="Bob" ageGroup="11-13" />,
    );

    expect(screen.getByText(/Report for Bob/)).toBeInTheDocument();
    expect(screen.queryByText(/Report for Alice/)).not.toBeInTheDocument();
    expect(screen.getByText(/Forces - Scheduled for simpler examples/)).toBeInTheDocument();
    const report = within(container);
    expect(report.getByText('1')).toBeInTheDocument();
  });
});
