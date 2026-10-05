import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/components/games/GameShell',()=>({default:()=>null,useChildAge:()=>({tier:1})}));
vi.mock('motion/react',()=>({useReducedMotion:()=>true,motion:{button:({children,animate,transition,...props}:any)=><button {...props}>{children}</button>}}));
import { generateQuestion, NumberPopPlay } from './number-pop';

afterEach(()=>{vi.restoreAllMocks();vi.useRealTimers();});

describe('Number Pop learning adventure',()=>{
  it('always offers four different choices including the correct answer, even with unhelpful randomness',()=>{
    vi.spyOn(Math,'random').mockReturnValue(0.5);
    for(const tier of [1,2,3] as const){
      const question=generateQuestion(tier);
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.options).toContain(question.answer);
    }
  });
  it('keeps a mistaken question, explains a strategy, and waits for an explicit next action after success',()=>{
    vi.useFakeTimers();vi.spyOn(Math,'random').mockReturnValue(0.4);
    render(<NumberPopPlay/>);
    fireEvent.click(screen.getByRole('button',{name:'Pop balloon 7'}));
    act(()=>vi.advanceTimersByTime(5000));
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    expect(screen.getByText(/Start at 3 and count on 3 steps/)).toBeInTheDocument();
    expect(screen.getByRole('button',{name:'Pop balloon 6'})).toBeEnabled();
    fireEvent.click(screen.getByRole('button',{name:'Pop balloon 6'}));
    act(()=>vi.advanceTimersByTime(5000));
    expect(screen.getByText('Question 1 of 10')).toBeInTheDocument();
    expect(screen.getByText(/3 \+ 3 = 6\./)).toBeInTheDocument();
    expect(screen.getByText('⭐ 0 first-try answers')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Next balloon'}));
    expect(screen.getByText('Question 2 of 10')).toBeInTheDocument();
  });
  it('pauses without losing the question or a hint and resumes the same balloons',()=>{
    vi.spyOn(Math,'random').mockReturnValue(0.4);
    render(<NumberPopPlay/>);
    fireEvent.click(screen.getByRole('button',{name:'Show a hint'}));
    fireEvent.click(screen.getByRole('button',{name:'Pause adventure'}));
    expect(screen.getByText('Time for a breather')).toBeInTheDocument();
    expect(screen.queryByRole('button',{name:'Pop balloon 6'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Resume adventure'}));
    expect(screen.getByRole('button',{name:'Pop balloon 6'})).toBeEnabled();
    expect(screen.getByText(/Start at 3 and count on 3 steps/)).toBeInTheDocument();
  });
  it('scores first-try answers separately from retries and completes only after the final explicit action',()=>{
    vi.spyOn(Math,'random').mockReturnValue(0.4);
    const onComplete=vi.fn();render(<NumberPopPlay onComplete={onComplete}/>);
    fireEvent.click(screen.getByRole('button',{name:'Pop balloon 7'}));
    for(let round=0;round<10;round++){
      fireEvent.click(screen.getByRole('button',{name:'Pop balloon 6'}));
      expect(onComplete).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button',{name:round===9?'Finish balloon adventure':'Next balloon'}));
    }
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({score:90,correct:9,total:10,stars:3});
  });
});
