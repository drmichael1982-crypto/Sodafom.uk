import React from 'react';
import { act, render, fireEvent, cleanup, screen } from '@testing-library/react';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ level: 1, tier: 1 as 1|2|3, record: vi.fn(async () => 2), speak: vi.fn() }));
vi.mock('motion/react', () => ({
  AnimatePresence: ({children}: {children: React.ReactNode}) => children,
  motion: new Proxy({}, {get: (_, tag: string) => ({children, initial: _initial, animate: _animate, exit: _exit, transition: _transition, whileTap: _whileTap, whileHover: _whileHover, ...props}: Record<string, unknown>) => React.createElement(tag, props, children as React.ReactNode)}),
}));
vi.mock('@/components/games/GameShell', () => ({ default: () => null, useChildAge: () => ({tier: mocks.tier, ageGroup: '5-7'}) }));
vi.mock('@/hooks/useChildAge', () => ({ useChildAge: () => ({tier: mocks.tier, ageGroup: '5-7'}) }));
vi.mock('@/hooks/useGameLevel', () => ({useGameLevel: () => ({level: mocks.level, loading: false, recordResult: mocks.record})}));
vi.mock('@/components/games/ArchieGameHelper', () => ({default: () => null}));
vi.mock('@/components/games/ArchieReadAloudButton', () => ({default: () => null}));
vi.mock('@/lib/voice-context', () => ({useVoice: () => ({speak: mocks.speak})}));

import { CoinInner } from './coin-counter';
import { NumberBondsInner } from './number-bonds';
import { MoneyMathsInner } from './money-maths';
import { FractionPizzaPlay } from './fraction-pizza';
import { ShapeSorterPlay } from './shape-sorter';
import { PatternMakerInner } from './pattern-maker';
import { LearningArenaPlay } from './learning-arena';
import QuizEngine from '@/components/games/QuizEngine';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import { coinRound, numberBondRound } from '@/lib/games/maths-round-data';
import { nextRound, shuffle } from '@/lib/games/ten-question-round';
import { FRACTION_SETS } from '@/lib/games/fraction-round-data';
import { MONEY_QUESTIONS } from '@/lib/games/money-round-data';
import { shapeRound } from '@/lib/games/shape-round-data';
import { patternRound } from '@/lib/games/pattern-round-data';
import { getLearningArenaQuestion, learningArenaConfigs } from '@/lib/games/learning-arena-data';

beforeEach(() => { vi.useFakeTimers(); vi.spyOn(Math, 'random').mockReturnValue(0.5); localStorage.clear(); mocks.level=1; mocks.tier=1; mocks.record.mockClear(); });
afterEach(() => { cleanup(); vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); });
const tick = async (ms = 2000) => { await act(async () => { vi.advanceTimersByTime(ms); }); };
const twice = (button: HTMLElement) => act(() => { fireEvent.click(button); fireEvent.click(button); });
const expectTen = (complete: ReturnType<typeof vi.fn>, correct = 10) => { expect(complete).toHaveBeenCalledTimes(1); expect(complete.mock.calls[0][0]).toMatchObject({correct,total:10,score:correct*10}); };
const money = (p: number) => p >= 100 ? `£${(p/100).toFixed(2)}` : `${p}p`;

describe('actual game components: ten answers, duplicate taps and completion', () => {
  it('Coin Counter scores all ten once and advances only after feedback', async () => {
    const questions=coinRound(1); localStorage.clear(); const complete=vi.fn(), level=vi.fn();
    render(<CoinInner level={1} onComplete={complete} onLevelChange={level}/>);
    for (const [index,purse] of questions.entries()) {
      expect(screen.getByText(new RegExp(`Round ${index+1}/10`))).toBeTruthy();
      const total=purse.reduce((sum,c)=>sum+c.coin.value*c.count,0);
      twice(screen.getByRole('button',{name:money(total)})); expect(complete).not.toHaveBeenCalled(); await tick();
    }
    expectTen(complete); expect(level).toHaveBeenCalledTimes(1);
  });
  it('Number Bonds includes the final answer and starts a fresh next round', async () => {
    const questions=numberBondRound(10); localStorage.clear(); const complete=vi.fn();
    const view=render(<NumberBondsInner onComplete={complete}/>);
    for (const q of questions) { twice(screen.getByRole('button',{name:String(q.answer)})); await tick(); }
    expectTen(complete); view.unmount();
    render(<NumberBondsInner onComplete={complete}/>);
    expect(screen.getByText('1/10')).toBeTruthy(); expect(complete).toHaveBeenCalledTimes(1);
  });
  it('Money Maths shuffles answer positions and scores ten genuine answers', async () => {
    const questions=nextRound(MONEY_QUESTIONS.filter(q=>q.difficulty==='easy'),q=>`${q.question}|${q.visual}`,'money-easy').map(q=>({...q,choices:shuffle(q.choices)})); localStorage.clear();
    expect(questions.some(q=>q.choices[0]!==q.answer)).toBe(true);
    const complete=vi.fn(); render(<MoneyMathsInner onComplete={complete}/>);
    for (const q of questions) { expect(screen.getByText(q.visual)).toBeTruthy(); twice(screen.getByRole('button',{name:q.answer})); await tick(); }
    expectTen(complete);
  });
  it('Fraction Pizza accepts zero, whole and partial fractions without repeating', async () => {
    const questions=nextRound(FRACTION_SETS.Easy,q=>q.label,'fractions-Easy'); localStorage.clear(); const complete=vi.fn();
    render(<FractionPizzaPlay difficulty="Easy" onComplete={complete}/>);
    for(const q of questions) {
      expect(screen.getByText(q.label)).toBeTruthy();
      for(let i=1;i<=q.fill;i++) fireEvent.keyDown(screen.getByRole('button',{name:`Slice ${i}`}),{key:'Enter'});
      twice(screen.getByRole('button',{name:/Serve it/})); await tick();
    }
    expectTen(complete);
  });
  it('Shape Sorter scores ten varied shape questions', async () => {
    const questions=shapeRound(1); localStorage.clear(); const complete=vi.fn(); render(<ShapeSorterPlay onComplete={complete}/>);
    for(const q of questions) { expect(screen.getByText(q.question)).toBeTruthy(); twice(screen.getByRole('button',{name:q.answer})); await tick(); }
    expectTen(complete);
  });
  it('Pattern Maker counts a correct final answer after nine wrong answers', async () => {
    const questions=patternRound('4-6'); localStorage.clear(); const complete=vi.fn(); render(<PatternMakerInner ageGroup="4-6" onComplete={complete}/>);
    for(const [i,q] of questions.entries()) {
      const choice=i===9 ? q.answer : q.options.find(o=>JSON.stringify(o)!==JSON.stringify(q.answer))!;
      twice(screen.getByRole('button',{name:typeof choice==='string'?choice:choice.label})); await tick();
    }
    expectTen(complete,1);
  });
  it('Shopkeeper Change finishes ten learning/action pairs without double action points', async () => {
    const config=learningArenaConfigs['shopkeeper-change'];
    const questions=nextRound(Array.from({length:40},(_,n)=>getLearningArenaQuestion(config.slug,n,1)),q=>q.prompt,`arena-${config.slug}-1`);localStorage.clear();
    const complete=vi.fn(), level=vi.fn(); render(<LearningArenaPlay config={config} level={1} onComplete={complete} onLevelChange={level} onQuestionChange={vi.fn()}/>);
    for(const q of questions) { twice(screen.getByRole('button',{name:q.answer})); await tick(750); twice(screen.getByRole('button',{name:/Give receipt/})); await tick(1600); }
    expectTen(complete); expect(level).toHaveBeenCalledTimes(1);
  });
  it('cancels a pending answer when leaving a game', async () => {
    const complete=vi.fn(); const view=render(<NumberBondsInner onComplete={complete}/>);
    fireEvent.click(screen.getAllByRole('button')[0]); view.unmount(); await tick(10000); expect(complete).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
});

const quizBank=Array.from({length:12},(_,i)=>({question:`Question ${i}`,options:['yes','no','maybe','later'],answer:'yes'}));
describe('shared quiz exact results and replay', () => {
  it.each([0,1,9,10])('reports exactly %i correct, retaining the stars callback contract', async expected => {
    const complete=vi.fn(); const view=render(<QuizEngine title="Quiz" emoji="?" questions={quizBank} onComplete={complete}/>);
    for(let i=0;i<10;i++){ twice(screen.getByRole('button',{name:i<expected?'yes':'no'})); await tick(900); }
    await tick(1200); expect(complete).toHaveBeenCalledTimes(1); expect(complete.mock.calls[0][1]).toMatchObject({correct:expected,total:10,score:expected*10});
    view.rerender(<QuizEngine title="Quiz" emoji="?" questions={quizBank} onComplete={complete}/>); await tick(5000); expect(complete).toHaveBeenCalledTimes(1);
  });
  it('LevelledQuizEngine forwards the real score and uses the next existing difficulty bank', async () => {
    const complete=vi.fn(); const banks=[quizBank,quizBank.map(q=>({...q,question:`Harder ${q.question}`}))];
    const view=render(<LevelledQuizEngine gameSlug="test" title="Quiz" emoji="?" questionsByLevel={banks} onComplete={complete}/>);
    for(let i=0;i<10;i++){ fireEvent.click(screen.getByRole('button',{name:i===9?'yes':'no'})); await tick(900); }
    await tick(1200); expectTen(complete,1); expect(mocks.record).toHaveBeenCalledTimes(1); view.unmount(); mocks.level=2;
    render(<LevelledQuizEngine gameSlug="test" title="Quiz" emoji="?" questionsByLevel={banks} onComplete={complete}/>);
    expect(screen.getByText(/^Harder Question/)).toBeTruthy();
  });
});

import { RATIO_LEVELS } from './ratio-recipe';
describe('Ratio Recipe subject and difficulty boundaries', () => {
  it('has three distinct banks, each with ten or more unambiguous questions', () => {
    expect(RATIO_LEVELS).toHaveLength(3);
    for(const bank of RATIO_LEVELS) {
      expect(new Set(bank.map(q=>q.question)).size).toBeGreaterThanOrEqual(10);
      bank.forEach(q=>{ expect(q.options).toContain(q.answer); expect(new Set(q.options).size).toBe(4); });
    }
    // Every initial sharing task preserves the requested ratio and total.
    RATIO_LEVELS[0].forEach(q=>{
      const [,total,a,b]=q.question.match(/Share (\d+) in the ratio (\d+):(\d+)/)!;
      const [left,right]=q.answer.split(' and ').map(Number);
      expect(left+right).toBe(Number(total)); expect(left*Number(b)).toBe(right*Number(a));
    });
    expect(RATIO_LEVELS[2][0].question).toContain('simplest form');
    expect(RATIO_LEVELS[2][2].question).toContain('simplest ratio');
  });
  it('uses only ratio content and caps the displayed bank at the highest authored level', async () => {
    mocks.level=10; mocks.tier=3; const complete=vi.fn();
    render(<LevelledQuizEngine gameSlug="ratio-recipe" subject="maths" title="Ratio Recipe" emoji="?" questionsByLevel={RATIO_LEVELS} onComplete={complete}/>);
    for(let i=0;i<10;i++) {
      const q=RATIO_LEVELS[2].find(q=>screen.queryByText(q.question)); expect(q).toBeDefined();
      fireEvent.click(screen.getByRole('button',{name:q!.answer})); await tick(900);
    }
    await tick(1200); expectTen(complete);
  });
});
