import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/components/games/GameShell',()=>({default:()=>null,useChildAge:()=>({tier:1})}));
vi.mock('@/lib/voice-context',()=>({useVoice:()=>({speak:vi.fn(),stop:vi.fn()})}));
import { moveAlongTrail, StarTrailPlay, TRAIL_END, TRAIL_QUESTIONS } from './star-trail';
import { submitGameVoiceAnswer } from '@/lib/archie/game-voice';

describe('Star Trail friendly board',()=>{
  it('keeps keyboard focus with the revealed clue, move button, next route and final heading',async()=>{
    const user=userEvent.setup();
    render(<StarTrailPlay onComplete={vi.fn()}/>);
    const steps=[2,3,1,3,2,3,1,2];
    for(let round=0;round<8;round++){
      const reveal=screen.getByRole('button',{name:'Reveal my star die'});
      reveal.focus();fireEvent.click(reveal);
      const question=TRAIL_QUESTIONS[1][round];
      expect(screen.getByRole('heading',{name:question.prompt})).toHaveFocus();
      if(round===0){
        const retry=screen.getByRole('button',{name:question.options.find(option=>option.id!==question.answerId)!.label});
        retry.focus();await user.keyboard('{Enter}');expect(retry).toHaveFocus();
      }
      const correct=screen.getByRole('button',{name:question.options.find(option=>option.id===question.answerId)!.label});
      correct.focus();await user.keyboard('{Enter}');
      const move=screen.getByRole('button',{name:'Move '+steps[round]+' '+(steps[round]===1?'space':'spaces')});
      expect(move).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(round===7?screen.getByRole('heading',{name:'Star garden discovered!'}):screen.getByRole('button',{name:'Reveal my star die'})).toHaveFocus();
    }
  });
  it('does not move focus on initial load or a spoken answer',()=>{
    render(<StarTrailPlay onComplete={vi.fn()}/>);
    expect(document.body).toHaveFocus();
    fireEvent.click(screen.getByRole('button',{name:'Reveal my star die'}));
    expect(document.body).toHaveFocus();
    const hint=screen.getByRole('button',{name:'Show trail hint'});
    hint.focus();
    act(()=>submitGameVoiceAnswer('Star Trail','four'));
    expect(hint).toHaveFocus();
    expect(screen.getByRole('button',{name:'Move 2 spaces'})).toBeInTheDocument();
  });
  it('moves forwards across bridges and reaches the end in the planned eight-clue visit',()=>{
    expect(moveAlongTrail(5,1)).toEqual({position:10,bridgeFrom:6});
    expect(moveAlongTrail(10,3)).toEqual({position:16,bridgeFrom:13});
    expect(moveAlongTrail(23,3).position).toBe(TRAIL_END);
    let position=0;for(const step of [2,3,1,3,2,3,1,2]){const next=moveAlongTrail(position,step);expect(next.position).toBeGreaterThan(position);position=next.position;}
    expect(position).toBe(24);
  });
  it('gives every question and answer a stable distinct identity with one right choice',()=>{
    const ids=new Set<string>();const answerIds=new Set<string>();
    for(const pool of Object.values(TRAIL_QUESTIONS)){
      expect(pool).toHaveLength(8);
      for(const question of pool){
        expect(ids.has(question.id)).toBe(false);ids.add(question.id);
        expect(new Set(question.options.map(option=>option.label)).size).toBe(3);
        expect(question.options.filter(option=>option.id===question.answerId)).toHaveLength(1);
        for(const option of question.options){expect(answerIds.has(option.id)).toBe(false);answerIds.add(option.id);}
        expect(question.hint.length).toBeGreaterThan(15);expect(question.explanation.length).toBeGreaterThan(15);
      }
    }
    expect(ids.size).toBe(24);expect(answerIds.size).toBe(72);
    expect(TRAIL_QUESTIONS[3].map(question=>question.options.find(option=>option.id===question.answerId)!.label)).toEqual(['24','10','6','5','1/2','34','8','12 cm²']);
  });
  it('keeps the explorer still after a mistake and while paused, then requires explicit movement',()=>{
    render(<StarTrailPlay onComplete={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button',{name:'Reveal my star die'}));
    fireEvent.click(screen.getByRole('button',{name:'3'}));expect(screen.getByText(/Your explorer stays safe/)).toBeInTheDocument();
    expect(screen.getByText('Your explorer: the starting camp')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Take a trail break'}));expect(screen.getByText('Your explorer is resting')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Resume trail'}));expect(screen.getByText(/Start at 3/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'4'}));expect(screen.getByText('Your explorer: the starting camp')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Move 2 spaces'}));expect(screen.getByText('Your explorer: space 2 of 24')).toBeInTheDocument();
  });
  it('counts first-try answers separately and waits at the finish for the child',()=>{
    const onComplete=vi.fn();render(<StarTrailPlay onComplete={onComplete}/>);
    const steps=[2,3,1,3,2,3,1,2];
    for(let round=0;round<8;round++){
      fireEvent.click(screen.getByRole('button',{name:'Reveal my star die'}));
      const question=TRAIL_QUESTIONS[1][round];
      if(round===0)fireEvent.click(screen.getByRole('button',{name:question.options.find(option=>option.id!==question.answerId)!.label}));
      fireEvent.click(screen.getByRole('button',{name:question.options.find(option=>option.id===question.answerId)!.label}));
      fireEvent.click(screen.getByRole('button',{name:'Move '+steps[round]+' '+(steps[round]===1?'space':'spaces')}));
      expect(onComplete).not.toHaveBeenCalled();
    }
    expect(screen.getByText('Star garden discovered!')).toBeInTheDocument();expect(screen.getByText('Your explorer: space 24 of 24')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Finish trail · see my stars'}));
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({score:88,correct:7,total:8,stars:2});
  });
  it('recognises an actual spoken answer without responding to questions or a stale activity',()=>{
    render(<StarTrailPlay onComplete={vi.fn()}/>);fireEvent.click(screen.getByRole('button',{name:'Reveal my star die'}));
    let reply:string|undefined;
    act(()=>{reply=submitGameVoiceAnswer('Number Planets','four');});expect(reply).toBeUndefined();
    act(()=>{reply=submitGameVoiceAnswer('Star Trail','why are there four stars?');});expect(reply).toBeUndefined();
    fireEvent.click(screen.getByRole('button',{name:'Take a trail break'}));
    act(()=>{reply=submitGameVoiceAnswer('Star Trail','four');});expect(reply).toBeUndefined();
    fireEvent.click(screen.getByRole('button',{name:'Resume trail'}));
    act(()=>{reply=submitGameVoiceAnswer('Star Trail','my answer is four');});expect(reply).toContain('3 + 1 = 4');
    expect(screen.getByRole('button',{name:'Move 2 spaces'})).toBeInTheDocument();
    expect(screen.getByText('Your explorer: the starting camp')).toBeInTheDocument();
  });
});
