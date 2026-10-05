import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/components/games/GameShell',()=>({default:()=>null,useChildAge:()=>({tier:1})}));
vi.mock('@/lib/config',()=>({ARCHIE_PREVIEW:true}));
vi.mock('@/lib/voice-context',()=>({useVoice:()=>({speak:vi.fn(),stop:vi.fn()})}));
import { FRACTION_SETS, fractionExplanation, FractionPizzaPlay } from './fraction-pizza';
import { submitGameVoiceAnswer } from '@/lib/archie/game-voice';
afterEach(()=>{vi.restoreAllMocks();vi.useRealTimers();});

describe('Fraction Pizza picnic',()=>{
  it('preserves valid equal-slice recipes and explains equivalent fractions',()=>{
    for(const pool of Object.values(FRACTION_SETS))for(const fraction of pool){
      expect(fraction.slices).toBe(fraction.denominator);expect(fraction.fill).toBe(fraction.numerator);
      expect(fraction.fill).toBeGreaterThan(0);expect(fraction.fill).toBeLessThan(fraction.slices);
    }
    expect(fractionExplanation(2,4)).toContain('also 1/2');
    expect(fractionExplanation(6,9)).toContain('also 2/3');
  });
  it('keeps a wrong order for retry and waits for Next after success',()=>{
    vi.useFakeTimers();vi.spyOn(Math,'random').mockReturnValue(0.5);
    const onComplete=vi.fn();render(<FractionPizzaPlay difficulty="Easy" year={1} onComplete={onComplete}/>);
    fireEvent.click(screen.getByRole('button',{name:'Slice 1'}));fireEvent.click(screen.getByRole('button',{name:'Slice 2'}));
    fireEvent.click(screen.getByRole('button',{name:'Serve my pizza'}));act(()=>vi.advanceTimersByTime(10000));
    expect(screen.getByText('Order 1 of 8 · Easy')).toBeInTheDocument();
    expect(screen.getByText(/Unshade a few slices/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Slice 2'}));fireEvent.click(screen.getByRole('button',{name:'Serve my pizza'}));
    act(()=>vi.advanceTimersByTime(10000));expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByText('Order 1 of 8 · Easy')).toBeInTheDocument();
    expect(screen.getByText('0 first-try orders')).toBeInTheDocument();
    expect(screen.getByText(/The whole pizza has 2 equal slices/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Next picnic order'}));expect(screen.getByText('Order 2 of 8 · Easy')).toBeInTheDocument();
  });
  it('keeps selected slices on a break and completes eight orders with first-try scoring',()=>{
    vi.spyOn(Math,'random').mockReturnValue(0.5);const onComplete=vi.fn();
    render(<FractionPizzaPlay difficulty="Easy" year={1} onComplete={onComplete}/>);
    fireEvent.click(screen.getByRole('button',{name:'Slice 1'}));fireEvent.click(screen.getByRole('button',{name:'Take a breather'}));
    expect(screen.queryByRole('button',{name:'Slice 1'})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Resume kitchen'}));expect(screen.getByRole('button',{name:'Slice 1'})).toHaveAttribute('aria-pressed','true');
    for(let order=0;order<8;order++){
      if(order)fireEvent.click(screen.getByRole('button',{name:'Slice 1'}));
      fireEvent.click(screen.getByRole('button',{name:'Serve my pizza'}));expect(onComplete).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button',{name:order===7?'Finish picnic · see my stars':'Next picnic order'}));
    }
    expect(onComplete).toHaveBeenCalledExactlyOnceWith({score:100,correct:8,total:8,stars:3});
  });
  it('accepts an explicit spoken slice choice only for the current unpaused kitchen',()=>{
    vi.spyOn(Math,'random').mockReturnValue(0.5);render(<FractionPizzaPlay difficulty="Easy" year={1} onComplete={vi.fn()}/>);
    let reply:string|undefined;
    act(()=>{reply=submitGameVoiceAnswer('Fraction Pizza','slice one');});
    expect(reply).toContain('Slice 1 shaded');expect(screen.getByRole('button',{name:'Slice 1'})).toHaveAttribute('aria-pressed','true');
    act(()=>{reply=submitGameVoiceAnswer('Star Trail','slice two');});expect(reply).toBeUndefined();
    act(()=>{reply=submitGameVoiceAnswer('Fraction Pizza','tell me about slice two');});expect(reply).toBeUndefined();
    fireEvent.click(screen.getByRole('button',{name:'Take a breather'}));
    act(()=>{reply=submitGameVoiceAnswer('Fraction Pizza','slice two');});expect(reply).toBeUndefined();
    fireEvent.click(screen.getByRole('button',{name:'Resume kitchen'}));
    expect(screen.getByRole('button',{name:'Slice 2'})).toHaveAttribute('aria-pressed','false');
  });
});
