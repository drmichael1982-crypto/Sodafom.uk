import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/contexts/ProgressionContext',()=>({useProgression:()=>({level:2,gamesRemainingForNextLevel:4})}));
vi.mock('@/lib/auth/auth-client',()=>({useSession:()=>({session:null}),signOut:vi.fn()}));
vi.mock('@/hooks/useCountUp',()=>({useCountUp:(value:number)=>value}));
vi.mock('./ConfettiCanvas',()=>({default:()=>null}));
vi.mock('./CertificateModal',()=>({default:()=>null}));
import { ResultScreen } from './GameShell';
beforeEach(()=>{localStorage.clear();vi.useFakeTimers();vi.stubGlobal('matchMedia',(query:string)=>({matches:false,media:query,addListener:vi.fn(),removeListener:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn()}));});
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();});
it('waits for the child to replay and does not call 90% a perfect score',()=>{
  const replay=vi.fn();
  render(<MemoryRouter><ResultScreen result={{score:90,correct:9,total:10,stars:3}} onReplay={replay} onHome={vi.fn()} gameTitle="Number Pop" subject="maths" nextGame={null} navigate={vi.fn()}/></MemoryRouter>);
  act(()=>vi.advanceTimersByTime(30000));
  expect(replay).not.toHaveBeenCalled();
  expect(screen.queryByText(/Perfect score/i)).not.toBeInTheDocument();
  expect(screen.queryByText('All correct!')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Play another round'}));expect(replay).toHaveBeenCalledTimes(1);
});
it('does not start result audio when the child has turned sound off',()=>{
  localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:false},activities:[],stickers:[]}));
  const audioStarted=vi.fn();
  vi.stubGlobal('AudioContext',class { constructor(){audioStarted();} });
  render(<MemoryRouter><ResultScreen result={{score:80,correct:8,total:10,stars:2}} onReplay={vi.fn()} onHome={vi.fn()} gameTitle="Number Pop" subject="maths" nextGame={null} navigate={vi.fn()}/></MemoryRouter>);
  act(()=>vi.advanceTimersByTime(3000));
  expect(audioStarted).not.toHaveBeenCalled();
});

it('preserves surviving tutor input focus when a completion control has disappeared',()=>{
  const origin=document.createElement('button');
  document.body.append(origin);origin.focus();origin.remove();
  render(<input aria-label="Your question for Archie" />);
  const input=screen.getByRole('textbox',{name:'Your question for Archie'});input.focus();
  render(<MemoryRouter><ResultScreen result={{score:80,correct:8,total:10,stars:2}} focusOrigin={origin} onReplay={vi.fn()} onHome={vi.fn()} gameTitle="Number Pop" subject="maths" nextGame={null} navigate={vi.fn()}/></MemoryRouter>);
  act(()=>vi.advanceTimersByTime(3000));
  expect(input).toHaveFocus();
});

it('does not move focus for completion without a focused game control',()=>{
  render(<MemoryRouter><ResultScreen result={{score:80,correct:8,total:10,stars:2}} onReplay={vi.fn()} onHome={vi.fn()} gameTitle="Number Pop" subject="maths" nextGame={null} navigate={vi.fn()}/></MemoryRouter>);
  expect(document.body).toHaveFocus();
});

it('leaves focus alone while a native dialog is open',()=>{
  const origin=document.createElement('button');
  document.body.append(origin);origin.focus();origin.remove();
  render(<><dialog open aria-label="Ask Archie"><input aria-label="Tutor question" /></dialog><MemoryRouter><ResultScreen result={{score:80,correct:8,total:10,stars:2}} focusOrigin={origin} onReplay={vi.fn()} onHome={vi.fn()} gameTitle="Number Pop" subject="maths" nextGame={null} navigate={vi.fn()}/></MemoryRouter></>);
  expect(document.body).toHaveFocus();
});
