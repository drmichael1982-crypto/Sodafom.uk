import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  playing:false,isOpen:true,pathname:'/',search:'',voiceOnOpen:false,
  listeners:new Set<()=>void>(),speak:vi.fn(),stop:vi.fn(),navigate:vi.fn(),closeArchie:vi.fn(),
}));
vi.mock('@/lib/voice-context', async()=>{
  const React = await import('react');
  return {useVoice:()=>({
    playing:React.useSyncExternalStore(listener=>{state.listeners.add(listener);return()=>{state.listeners.delete(listener);};},()=>state.playing),
    speak:state.speak,stop:state.stop,
  })};
});
vi.mock('react-router',async()=>{
  const React = await import('react');
  return {useNavigate:()=>state.navigate,useLocation:()=>{
    React.useSyncExternalStore(listener=>{state.listeners.add(listener);return()=>{state.listeners.delete(listener);};},()=>state.pathname+state.search);
    return {pathname:state.pathname,search:state.search};
  }};
});
vi.mock('@/contexts/ArchieContext',async()=>{
  const React = await import('react');
  return {useArchieContext:()=>{
    const isOpen = React.useSyncExternalStore(listener=>{state.listeners.add(listener);return()=>{state.listeners.delete(listener);};},()=>state.isOpen);
    return {isOpen,draft:'',voiceOnOpen:state.voiceOnOpen,openArchie:vi.fn(),closeArchie:state.closeArchie,gameTitle:null,subject:null,currentQuestion:null,currentOptions:null};
  }};
});
import ArchieHelper from './ArchieHelper';

class FakeRecognition {
  static instances:FakeRecognition[]=[];
  lang='';interimResults=false;continuous=false;
  onresult:((event:unknown)=>void)|null=null;
  onerror:((event:unknown)=>void)|null=null;
  onend:(()=>void)|null=null;
  start=vi.fn();
  stop=vi.fn(()=>this.onend?.());
  abort=vi.fn(()=>this.onend?.());
  constructor(){FakeRecognition.instances.push(this);}
  result(words:string){this.onresult?.({results:[[{transcript:words}]]});}
  end(){this.onend?.();}
  error(error:string){this.onerror?.({error});}
}
const notify = ()=>state.listeners.forEach(listener=>listener());
const latest = ()=>FakeRecognition.instances[FakeRecognition.instances.length-1];
async function finishSpeech(){await act(async()=>{state.playing=false;notify();});}
async function letArchieListen(){await act(async()=>{vi.advanceTimersByTime(500);});}
async function start(){fireEvent.click(screen.getByRole('button',{name:'Start voice conversation'}));await finishSpeech();await letArchieListen();}

beforeEach(()=>{
  vi.useFakeTimers();
  localStorage.clear();FakeRecognition.instances=[];
  state.playing=false;state.isOpen=true;state.pathname='/';state.search='';state.voiceOnOpen=false;
  state.speak.mockImplementation(()=>{state.playing=true;notify();});
  state.stop.mockImplementation(()=>{state.playing=false;notify();});
  state.closeArchie.mockImplementation(()=>{state.isOpen=false;notify();});
  vi.stubGlobal('SpeechRecognition',FakeRecognition);
  vi.stubGlobal('fetch',vi.fn());
  HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
  HTMLElement.prototype.scrollIntoView=vi.fn();
});
afterEach(()=>{cleanup();vi.useRealTimers();vi.unstubAllGlobals();vi.clearAllMocks();state.listeners.clear();});

describe('press-once voice conversation',()=>{
  it('does not request the microphone merely by opening Archie',async()=>{
    render(<ArchieHelper/>);await letArchieListen();
    expect(FakeRecognition.instances).toHaveLength(0);
    expect(state.speak).not.toHaveBeenCalled();
  });

  it('handles two generic maths questions, speaks each reply, then listens again without another press',async()=>{
    render(<ArchieHelper/>);
    fireEvent.click(screen.getByRole('button',{name:'Start voice conversation'}));
    await letArchieListen();expect(FakeRecognition.instances).toHaveLength(0);
    await finishSpeech();await letArchieListen();
    const first=latest();expect(first.start).toHaveBeenCalledOnce();
    await act(async()=>{first.result('What is 8 plus 4?');});
    expect(first.abort).toHaveBeenCalledOnce();
    expect(state.speak).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button',{name:'Stop voice conversation'})).toBeEnabled();
    await letArchieListen();expect(FakeRecognition.instances).toHaveLength(1);
    // A delayed result from the retired listener must not become an echoed turn.
    await act(async()=>{first.result('What is 8 plus 4?');first.end();});
    expect(state.speak).toHaveBeenCalledTimes(2);
    await finishSpeech();await letArchieListen();
    expect(FakeRecognition.instances).toHaveLength(2);
    await act(async()=>{latest().result('What is 3 plus 2?');});
    expect(state.speak).toHaveBeenCalledTimes(3);
    await finishSpeech();await letArchieListen();
    expect(FakeRecognition.instances).toHaveLength(3);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('restarts after a quiet recognition session ends, and stops immediately while listening',async()=>{
    render(<ArchieHelper/>);await start();
    await act(async()=>{latest().error('no-speech');latest().end();});
    await letArchieListen();expect(FakeRecognition.instances).toHaveLength(2);
    const active=latest();
    fireEvent.click(screen.getByRole('button',{name:'Stop voice conversation'}));
    expect(active.abort).toHaveBeenCalledOnce();
    await letArchieListen();expect(FakeRecognition.instances).toHaveLength(2);
    expect(screen.getByRole('button',{name:'Start voice conversation'})).toBeEnabled();
  });

  it.each(['not-allowed','service-not-allowed','audio-capture','network'])('stops gracefully on %s rather than repeatedly requesting microphone access',async(error)=>{
    render(<ArchieHelper/>);await start();
    await act(async()=>{latest().error(error);latest().end();});
    await letArchieListen();expect(FakeRecognition.instances).toHaveLength(1);
    expect(screen.getByRole('button',{name:'Start voice conversation'})).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent(/type to Archie/i);
  });

  it.each(['close','route','unmount'])('retires callbacks and never restarts after %s',async(action)=>{
    const view=render(<ArchieHelper/>);await start();const active=latest();
    if(action==='close')fireEvent.click(screen.getByRole('button',{name:'Close Ask Archie'}));
    else if(action==='route')await act(async()=>{state.pathname='/courses';state.search='?subject=history';notify();});
    else view.unmount();
    expect(active.abort).toHaveBeenCalledOnce();
    const calls=state.speak.mock.calls.length;
    await act(async()=>{active.result('What is 8 plus 4?');active.end();});
    await letArchieListen();expect(FakeRecognition.instances).toHaveLength(1);
    expect(state.speak).toHaveBeenCalledTimes(calls);
  });

  it('keeps wider spoken questions on-device unless online help was explicitly enabled',async()=>{
    render(<ArchieHelper/>);await start();
    await act(async()=>{latest().result('Explain the history of the telescope');});
    expect(fetch).not.toHaveBeenCalled();
    expect(state.speak.mock.calls.at(-1)?.[1]).toContain('Online learning help is off');
    expect(localStorage.getItem('sodafom_archie_learning_v1')).toBeNull();
  });

  it('allows stopping while an opted-in service reply is pending, with no later speech or automatic restart',async()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:true,onlineHelp:true},activities:[],stickers:[]}));
    let finishRequest!:(value:Response)=>void;
    vi.mocked(fetch).mockImplementation(()=>new Promise(resolve=>{finishRequest=resolve;}) as Promise<Response>);
    render(<ArchieHelper/>);await start();
    await act(async()=>{latest().result('Explain the history of the telescope');});
    expect(fetch).toHaveBeenCalledOnce();
    const stopButton=screen.getByRole('button',{name:'Stop voice conversation'});
    expect(stopButton).toBeEnabled();fireEvent.click(stopButton);
    await act(async()=>{finishRequest(new Response('Telescopes help us study distant objects.', {status:200}));});
    await letArchieListen();
    expect(FakeRecognition.instances).toHaveLength(1);
    expect(state.speak).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button',{name:'Start voice conversation'})).toBeEnabled();
  });

  it('retires an active microphone if another read-aloud starts',async()=>{
    render(<ArchieHelper/>);await start();const active=latest();
    await act(async()=>{state.playing=true;notify();});
    expect(active.abort).toHaveBeenCalledOnce();
    await act(async()=>{active.result('What is 8 plus 4?');});
    expect(state.speak).toHaveBeenCalledTimes(1);
    await letArchieListen();expect(FakeRecognition.instances).toHaveLength(1);
    await finishSpeech();await letArchieListen();expect(FakeRecognition.instances).toHaveLength(2);
  });

  it('offers typed input when browser speech recognition is unsupported',()=>{
    vi.stubGlobal('SpeechRecognition',undefined);vi.stubGlobal('webkitSpeechRecognition',undefined);
    render(<ArchieHelper/>);fireEvent.click(screen.getByRole('button',{name:'Start voice conversation'}));
    expect(screen.getByRole('status')).toHaveTextContent('You can still type to Archie');
    expect(screen.getByRole('textbox',{name:'Your question for Archie'})).toBeEnabled();
    expect(FakeRecognition.instances).toHaveLength(0);
  });
});
