import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks=vi.hoisted(()=>({preview:true,setGameContext:vi.fn(),clearGameContext:vi.fn(),recordGameCompletion:vi.fn(),openArchie:vi.fn()}));
vi.mock('@/lib/config',()=>({get ARCHIE_PREVIEW(){return mocks.preview;},API_PREFIX:''}));
vi.mock('@/lib/auth/auth-client',()=>({useSession:()=>({session:null}),signOut:vi.fn()}));
vi.mock('@/contexts/ArchieContext',()=>({useArchieContext:()=>mocks}));
vi.mock('@/contexts/ProgressionContext',()=>({useProgression:()=>({recordGameCompletion:mocks.recordGameCompletion,level:1,gamesRemainingForNextLevel:9})}));
vi.mock('@/hooks/useCountUp',()=>({useCountUp:(value:number)=>value}));
vi.mock('./PaywallGate',()=>({default:({children}:{children:React.ReactNode})=>children}));
vi.mock('./ActiveChildBanner',()=>({default:()=>null}));
vi.mock('./ConfettiCanvas',()=>({default:()=>null}));
vi.mock('./CertificateModal',()=>({default:()=>null}));
vi.mock('@/components/ShareBar',()=>({default:()=>null}));
vi.mock('@/components/SceneArtwork',()=>({default:()=>null,sceneForSubject:()=> 'maths',sceneArtworkPath:()=> '/assets/scenes/archie-jigsaw-maths-v2.webp'}));
vi.mock('virtual:content',()=>({games:{games:[
  {title:'Starter',slug:'starter',subject:'maths',ageGroups:['5–7']},
  {title:'Algebra',slug:'algebra',subject:'maths',ageGroups:['11–13']},
  {title:'Counting',slug:'counting',subject:'maths',ageGroups:['5–7']},
  {title:'Middle',slug:'middle',subject:'maths',ageGroups:['8–10']},
]}}));
import GameShell, {type GameResult, type GameShellControls} from './GameShell';
import { updateSavedData } from '@/lib/archie/storage';
const result:GameResult={score:100,correct:8,total:8,stars:3};
const saveYear=(year:number)=>updateSavedData(data=>({...data,settings:{...data.settings,year,sound:false}}));
function Route(){return <span data-testid="route">{useLocation().pathname}</span>;}
const show=(children:React.ReactNode)=>render(<HelmetProvider><MemoryRouter initialEntries={['/games/test']}><Route/>{children}</MemoryRouter></HelmetProvider>);
beforeEach(()=>{
  localStorage.clear();mocks.preview=true;saveYear(1);
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({})}));
  vi.stubGlobal('matchMedia',()=>({matches:true,addListener:vi.fn(),removeListener:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn()}));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.clearAllMocks();});
describe('preview direct-route age guard',()=>{
  it('does not mount a blocked game, publish its question, overwrite last-played or record any progress',()=>{
    const child=vi.fn(()=> <button>Play older question</button>);
    localStorage.setItem('sodafom_last_played','previous-game');
    show(<GameShell title="Algebra" emoji="x" subject="maths" ageGroups={['11–13']} currentQuestion="Solve x + 4 = 8" currentOptions={['4','5']}>
      {child}
    </GameShell>);
    expect(screen.getByRole('heading',{name:'Let’s find a game for your year'})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'Choose a game for my year'})).toHaveAttribute('href','/games');
    expect(child).not.toHaveBeenCalled();expect(screen.queryByText('Play older question')).not.toBeInTheDocument();
    expect(mocks.setGameContext).not.toHaveBeenCalled();expect(mocks.clearGameContext).toHaveBeenCalled();
    expect(localStorage.getItem('sodafom_last_played')).toBe('previous-game');
    expect(localStorage.getItem('sodafom_game_stars')).toBeNull();
    expect(mocks.recordGameCompletion).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
  });
  it('mounts the supported direct game and exposes an age-safe next-game suggestion after its result',async()=>{
    show(<GameShell title="Starter" emoji="1" subject="maths" ageGroups={['5–7']} currentQuestion="One more?">
      {complete=> <button onClick={()=>complete(result)}>Finish round</button>}
    </GameShell>);
    expect(mocks.setGameContext).toHaveBeenCalledWith('Starter','maths','One more?',undefined);
    expect(JSON.parse(localStorage.getItem('sodafom_last_played')!).id).toBe('game-starter');
    fireEvent.click(screen.getByRole('button',{name:'Finish round'}));
    const next=await screen.findByRole('button',{name:'Play Next: Counting'});
    expect(screen.queryByRole('button',{name:'Play Next: Algebra'})).not.toBeInTheDocument();
    fireEvent.click(next);
    expect(screen.getByTestId('route')).toHaveTextContent('/games/counting');
    expect(mocks.recordGameCompletion).toHaveBeenCalledExactlyOnceWith('maths','starter');
  });
  it('rechecks the saved year without conditional hooks and rejects a retired game’s delayed completion callbacks',()=>{
    saveYear(7);let complete!:(r:GameResult)=>void;let controls!:GameShellControls;
    show(<GameShell title="Algebra" emoji="x" subject="maths" ageGroups={['11–13']}>
      {(finish,commands)=>{complete=finish;controls=commands;return <button>Older game</button>;}}
    </GameShell>);
    expect(screen.getByRole('button',{name:'Older game'})).toBeInTheDocument();
    mocks.setGameContext.mockClear();vi.mocked(fetch).mockClear();
    act(()=>saveYear(1));
    expect(screen.queryByRole('button',{name:'Older game'})).not.toBeInTheDocument();
    act(()=>{complete(result);controls.recordCompletion(result);});
    expect(mocks.recordGameCompletion).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
    expect(mocks.setGameContext).not.toHaveBeenCalled();expect(localStorage.getItem('sodafom_game_stars')).toBeNull();
    act(()=>saveYear(7));
    expect(screen.getByRole('button',{name:'Older game'})).toBeInTheDocument();
  });
  it('retains non-preview age access and its original next-game ordering',async()=>{
    mocks.preview=false;
    show(<GameShell title="Starter" emoji="1" subject="maths" ageGroups={['11–13']}>
      {complete=> <button onClick={()=>complete(result)}>Finish legacy round</button>}
    </GameShell>);
    fireEvent.click(screen.getByRole('button',{name:'Finish legacy round'}));
    expect(await screen.findByRole('button',{name:'Play Next: Algebra'})).toBeInTheDocument();
    expect(mocks.recordGameCompletion).toHaveBeenCalledExactlyOnceWith('maths','starter');
  });
  it('preserves the merged spelling between-set recordCompletion control and saved game ID',()=>{
    mocks.preview=false;
    show(<GameShell title="Spelling Bee" emoji="a" subject="spelling" ageGroups={['8–10']}>
      {(_finish,controls)=> <button onClick={()=>controls.recordCompletion({score:90,correct:9,total:10,stars:3})}>Record spelling set</button>}
    </GameShell>);
    fireEvent.click(screen.getByRole('button',{name:'Record spelling set'}));
    expect(screen.getByRole('button',{name:'Record spelling set'})).toBeInTheDocument();
    expect(mocks.recordGameCompletion).toHaveBeenCalledExactlyOnceWith('spelling','spelling-bee');
    expect(JSON.parse(localStorage.getItem('sodafom_game_stars')!)).toEqual({'game-spelling-bee':3});
  });
});

describe('preview legacy-account request isolation',()=>{
  const staleChild={id:42,name:'Synthetic legacy learner',ageGroup:'11-13',avatarEmoji:'*'};
  it.each(['finish','recordCompletion'] as const)('keeps preview %s local despite a stale active child',async(mode)=>{
    const savedChild=JSON.stringify(staleChild);
    localStorage.setItem('sodafom_active_child',savedChild);
    show(<GameShell title="Starter" emoji="1" subject="maths" ageGroups={['5–7']}>
      {(finish,controls)=> <button onClick={()=>mode==='finish'?finish(result):controls.recordCompletion(result)}>Complete preview round</button>}
    </GameShell>);
    expect(fetch).not.toHaveBeenCalled();
    await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Complete preview round'}));});
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.recordGameCompletion).toHaveBeenCalledExactlyOnceWith('maths','starter');
    expect(JSON.parse(localStorage.getItem('sodafom_game_stars')!)).toEqual({'game-starter':3});
    expect(localStorage.getItem('sodafom_active_child')).toBe(savedChild);
    expect(JSON.parse(localStorage.getItem('sodafom_last_played')!).id).toBe('game-starter');
  });
  it.each(['finish','recordCompletion'] as const)('retains legacy daily challenge and child progress/rewards for %s',async(mode)=>{
    mocks.preview=false;
    localStorage.setItem('sodafom_active_child',JSON.stringify(staleChild));
    show(<GameShell title="Starter" emoji="1" subject="maths" ageGroups={['11–13']}>
      {(finish,controls)=> <button onClick={()=>mode==='finish'?finish(result):controls.recordCompletion(result)}>Complete account round</button>}
    </GameShell>);
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/daily-challenge',{credentials:'include'});
    await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Complete account round'}));});
    expect(fetch).toHaveBeenCalledTimes(3);
    const calls=vi.mocked(fetch).mock.calls;
    const progress=calls.find(([url])=>url==='/children/42/progress');
    const rewards=calls.find(([url])=>url==='/rewards/check-badges');
    expect(progress?.[1]).toMatchObject({method:'POST',credentials:'include',headers:{'Content-Type':'application/json'}});
    expect(JSON.parse(String(progress?.[1]?.body))).toMatchObject({activityId:'starter',activityTitle:'Starter',subject:'maths',score:100});
    expect(rewards?.[1]).toMatchObject({method:'POST',credentials:'include',headers:{'Content-Type':'application/json'}});
    expect(JSON.parse(String(rewards?.[1]?.body))).toEqual({childId:42});
    expect(mocks.recordGameCompletion).toHaveBeenCalledExactlyOnceWith('maths','starter');
    expect(JSON.parse(localStorage.getItem('sodafom_game_stars')!)).toEqual({'game-starter':3});
  });
});
