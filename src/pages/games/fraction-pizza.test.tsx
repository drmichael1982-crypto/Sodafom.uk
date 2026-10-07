import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mode=vi.hoisted(()=>({preview:true,tier:1}));
vi.mock('@/components/games/GameShell',()=>({default:()=>null,useChildAge:()=>({tier:mode.tier})}));
vi.mock('@/lib/config',()=>({get ARCHIE_PREVIEW(){return mode.preview;}}));
vi.mock('@/lib/voice-context',()=>({useVoice:()=>({speak:vi.fn(),stop:vi.fn()})}));
import { FRACTION_SETS, fractionExplanation, FractionPizzaPlay, FractionPizzaWithDifficulty } from './fraction-pizza';
import { submitGameVoiceAnswer } from '@/lib/archie/game-voice';
import { updateSavedData } from '@/lib/archie/storage';

beforeEach(()=>{localStorage.clear();mode.preview=true;mode.tier=1;});
afterEach(()=>{vi.restoreAllMocks();vi.useRealTimers();});

describe('Fraction Pizza picnic',()=>{
  it.each([{year:1,tier:1,difficulty:'Easy',slices:2},{year:4,tier:2,difficulty:'Medium',slices:8},{year:7,tier:3,difficulty:'Hard',slices:9}])('preview Year $year keeps its selected-tier recipe with no manual override',({year,tier,difficulty,slices})=>{
    mode.tier=tier;vi.spyOn(Math,'random').mockReturnValue(0.5);
    updateSavedData(data=>({...data,settings:{...data.settings,year}}));
    render(<FractionPizzaWithDifficulty onComplete={vi.fn()} onQuestionChange={vi.fn()}/>);
    expect(screen.getByText('Order 1 of 8 · '+difficulty)).toBeInTheDocument();
    expect(screen.getByRole('group',{name:'Choose pizza slices'}).querySelectorAll('button')).toHaveLength(slices);
    expect(screen.queryByRole('button',{name:'Choose pizza challenge'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button',{name:/Hard ·/})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading',{name:'Choose your pizza challenge'})).not.toBeInTheDocument();
  });
  it('preserves the manual difficulty picker outside the preview',()=>{
    mode.preview=false;vi.spyOn(Math,'random').mockReturnValue(0.5);
    render(<FractionPizzaWithDifficulty onComplete={vi.fn()} onQuestionChange={vi.fn()}/>);
    fireEvent.click(screen.getByRole('button',{name:'Choose pizza challenge'}));
    expect(screen.getByRole('heading',{name:'Choose your pizza challenge'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/Hard ·/}));
    expect(screen.getByText('Order 1 of 8 · Hard')).toBeInTheDocument();
    expect(screen.getByRole('group',{name:'Choose pizza slices'}).querySelectorAll('button')).toHaveLength(9);
  });
  it('updates the complete slice-count status without moving keyboard focus',async()=>{
    vi.spyOn(Math,'random').mockReturnValue(0.5);
    const user=userEvent.setup();
    render(<FractionPizzaPlay difficulty="Easy" year={1} onComplete={vi.fn()}/>);
    const count=screen.getByRole('status',{name:'Pizza slice count'});
    const slice=screen.getByRole('button',{name:'Slice 1'});
    expect(count).toHaveAttribute('aria-atomic','true');
    expect(count).toHaveTextContent('0 of 2 slices shaded');
    slice.focus();
    await user.keyboard(' ');
    expect(slice).toHaveFocus();
    expect(slice).toHaveAttribute('aria-pressed','true');
    expect(count).toHaveTextContent('1 of 2 slices shaded');
    await user.keyboard('{Enter}');
    expect(slice).toHaveFocus();
    expect(slice).toHaveAttribute('aria-pressed','false');
    expect(count).toHaveTextContent('0 of 2 slices shaded');
    await user.click(screen.getByRole('button',{name:'Slice 2'}));
    expect(count).toHaveTextContent('1 of 2 slices shaded');
    const clear=screen.getByRole('button',{name:'Clear slices'});
    await user.click(clear);
    expect(clear).toHaveFocus();
    expect(count).toHaveTextContent('0 of 2 slices shaded');
    expect(screen.getByRole('button',{name:'Slice 2'})).toHaveAttribute('aria-pressed','false');
  });
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
    expect(screen.getByRole('status',{name:'Pizza slice count'})).toHaveTextContent('1 of 2 slices shaded');
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
