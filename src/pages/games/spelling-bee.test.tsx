import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const recordCompletion = vi.fn();
const recordResult = vi.fn(async () => 2);
vi.mock('@/components/games/GameShell', () => ({
  default: ({ children }: { children: (onComplete: () => void, controls: { recordCompletion: typeof recordCompletion }) => React.ReactNode }) =>
    <div>{children(vi.fn(), { recordCompletion })}</div>,
}));
vi.mock('@/hooks/useGameLevel', () => ({ useGameLevel: () => ({ level: 1, bestStars: 0, loading: false, recordResult }) }));

import SpellingBeeGame, { SpellingBeePlay } from './spelling-bee';
import { bandProgress, currentWord, loadProgress, STORAGE_KEY } from '@/lib/spelling/progression';
import { getWord } from '@/lib/spelling/word-bank';

function saved() { return loadProgress()!; }
function answerWord() { return currentWord(saved())!.word; }
function type(text: string) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Type the spelling' }), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Check' }));
}
/** Answer the rest of the current set correctly, pressing Next between words. */
function finishSet(wrongWords = 0) {
  for (let i = bandProgress(saved()).currentSet!.position; i < 10; i++) {
    if (i < wrongWords) { type(answerWord() + 'q'); type(answerWord() + 'q'); }
    else type(answerWord());
    if (i < 9) fireEvent.click(screen.getByRole('button', { name: 'Next word' }));
  }
}

beforeEach(() => { localStorage.clear(); recordCompletion.mockClear(); recordResult.mockClear(); });
afterEach(() => cleanup());

describe('Spelling Bee sets of ten', () => {
  it('keeps typed answers free of autocomplete, autocorrect and spellcheck', () => {
    render(<SpellingBeePlay year={3} />);
    const input = screen.getByRole('textbox', { name: 'Type the spelling' });
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('autocorrect', 'off');
    expect(input).toHaveAttribute('autocapitalize', 'off');
    expect(input).toHaveAttribute('spellcheck', 'false');
  });

  it('shows results after the 10th answer and only moves on with Continue to next 10 (questions 11 and 21)', () => {
    const onSetComplete = vi.fn();
    render(<SpellingBeePlay year={4} onSetComplete={onSetComplete} />);
    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    finishSet();
    expect(screen.getByRole('heading', { name: 'Set 1 complete!' })).toBeInTheDocument();
    expect(screen.getByText('You spelt 10 out of 10 correctly first time.')).toBeInTheDocument();
    expect(screen.getByText(/Healthy break/)).toBeInTheDocument();
    expect(onSetComplete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Continue to next 10' }));
    expect(screen.getByText('Set 2')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    finishSet();
    expect(screen.getByRole('heading', { name: 'Set 2 complete!' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue to next 10' }));
    expect(screen.getByText('Set 3')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    expect(onSetComplete).toHaveBeenCalledTimes(2);
  });

  it('gives a hint and a retry after a mistake, then shows the spelling and lists it for review', () => {
    render(<SpellingBeePlay year={2} />);
    const word = currentWord(saved())!;
    type(word.word + 'q');
    expect(screen.getByText('Good try! Use the hint and have another go.')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`It starts with "${word.word[0]}" and has ${word.word.length} letters`))).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    type(word.word + 'q');
    expect(screen.getByText(/The spelling is:/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next word' }));
    finishSet();
    expect(screen.getByText('You spelt 9 out of 10 correctly first time.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Words to review' })).toBeInTheDocument();
    const item = screen.getByText(word.word, { selector: 'span' }).closest('li')!;
    expect(item).toHaveTextContent(word.tip);
  });

  it('switches to targeted practice after a low score', () => {
    render(<SpellingBeePlay year={5} />);
    finishSet(7);
    expect(screen.getByText('You spelt 3 out of 10 correctly first time.')).toBeInTheDocument();
    expect(screen.getByText(/practise them again with some easier words/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue to next 10' }));
    expect(screen.getByText(/Practice set/)).toBeInTheDocument();
  });

  it('resumes at the same question after a reload mid-set', () => {
    const first = render(<SpellingBeePlay year={3} />);
    for (let i = 0; i < 3; i++) { type(answerWord()); fireEvent.click(screen.getByRole('button', { name: 'Next word' })); }
    const word = answerWord();
    first.unmount();
    render(<SpellingBeePlay year={3} />);
    expect(screen.getByText('Question 4 of 10')).toBeInTheDocument();
    expect(answerWord()).toBe(word);
  });

  it('resumes on the results screen if the page reloads before Continue', () => {
    const first = render(<SpellingBeePlay year={3} />);
    finishSet();
    first.unmount();
    render(<SpellingBeePlay year={3} />);
    expect(screen.getByRole('heading', { name: 'Set 1 complete!' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Continue to next 10' }));
    expect(screen.getByText('Set 2')).toBeInTheDocument();
  });

  it('keeps a Year 1 learner on Year 1 words', () => {
    render(<SpellingBeePlay year={1} />);
    for (const id of bandProgress(saved()).currentSet!.wordIds) expect(getWord(id)!.band).toBe('y1');
    expect(screen.getByText(/Year 1 ·/)).toBeInTheDocument();
  });

  it('copes with old saved data: legacy level and unreadable progress', () => {
    localStorage.setItem('sodafom_level_spelling-bee', JSON.stringify({ level: 7, bestStars: 2, playsAtLevel: 0 }));
    localStorage.setItem(STORAGE_KEY, '{broken');
    render(<SpellingBeePlay year={1} legacyLevel={7} />);
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    expect(bandProgress(saved()).currentSet!.stageIndex).toBe(2);
  });

  it('reports each finished set to GameShell and the shared level hook', () => {
    render(<HelmetProvider><MemoryRouter><SpellingBeeGame /></MemoryRouter></HelmetProvider>);
    finishSet(1);
    expect(recordCompletion).toHaveBeenCalledWith({ score: 90, correct: 9, total: 10, stars: 3 });
    expect(recordResult).toHaveBeenCalledWith(3);
    expect(screen.getByRole('button', { name: 'Stop for now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });
});
