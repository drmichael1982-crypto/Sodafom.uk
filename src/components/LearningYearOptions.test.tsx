import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import LearningYearOptions, {
  ALL_LEARNING_YEARS,
  LEARNING_YEAR_SCOPE_NOTE,
  learningYearLabel,
} from './LearningYearOptions';

afterEach(cleanup);

describe('learning year choices', () => {
  it('separates the ages 5–12 pathway from preserved older extensions', () => {
    render(<><select aria-label="Learning year"><LearningYearOptions /></select><p>{LEARNING_YEAR_SCOPE_NOTE}</p></>);
    const select = screen.getByRole('combobox', { name: 'Learning year' });
    expect(within(select).getAllByRole('option')).toHaveLength(9);
    expect(Array.from(select.querySelectorAll('optgroup')).map(group => group.label)).toEqual([
      'Main pathway · ages 5–12',
      'Optional older extensions',
    ]);
    expect(within(select).getByRole('option', { name: 'Year 7 · ages 11–12' })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: 'Year 8 · ages 12–13 · optional extension' })).toBeInTheDocument();
    expect(within(select).getByRole('option', { name: 'Year 9 · ages 13–14 · optional extension' })).toBeInTheDocument();
    expect(screen.getByText(/main pathway is ages 5–12/i)).toBeInTheDocument();
    expect(ALL_LEARNING_YEARS).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(learningYearLabel(1)).toBe('Year 1 · ages 5–6');
  });
});
