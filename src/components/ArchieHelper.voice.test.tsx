import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { LessonTutorContext } from '@/contexts/ArchieContext';
import { listenForGameAnswer } from '@/lib/archie/game-voice';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  playing:false,isOpen:true,pathname:'/',search:'',voiceOnOpen:false,
  lessonTutor:null as LessonTutorContext|null,currentOptions:null as string[]|null,
  gameTitle:null as string|null,
  listeners:new Set<()=>void>(),speak:vi.fn(),stop:vi.fn(),navigate:vi.fn(),closeArchie:vi.fn(),requestLessonVoice:vi.fn(),
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
    React.useSyncExternalStore(listener=>{state.listeners.add(listener);return()=>{state.listeners.delete(listener);};},()=>JSON.stringify([state.lessonTutor,state.currentOptions,state.gameTitle]));
    return {isOpen,draft:'',voiceOnOpen:state.voiceOnOpen,openArchie:vi.fn(),closeArchie:state.closeArchie,requestLessonVoice:state.requestLessonVoice,gameTitle:state.gameTitle||(state.lessonTutor?'River lesson':null),subject:state.lessonTutor?'History':null,currentQuestion:state.lessonTutor?.readText||null,currentOptions:state.currentOptions,lessonTutor:state.lessonTutor};
  }};
});
vi.mock('@/pages/archie/ArchieCourses',()=>({COURSE_LESSONS:[
  {id:'maths-y4-w01-s1',subject:'maths',year:4,week:1,session:1,title:'Adding',unit:'Number'},
  {id:'english-y4-w01-s1',subject:'english',year:4,week:1,session:1,title:'Reading',unit:'Stories'},
  {id:'science-y4-w01-s1',subject:'science',year:4,week:1,session:1,title:'Plants',unit:'Plants'},
  {id:'history-y4-w01-s1',subject:'history',year:4,week:1,session:1,title:'Roman roads',unit:'Roman Britain'},
  {id:'history-y3-w01-s1',subject:'history',year:3,week:1,session:1,title:'The Nile',unit:'Ancient Egypt'},
  {id:'history-y4-w02-s1',subject:'history',year:4,week:2,session:1,title:'Private topic',unit:'History',sensitive:true},
]}));
import ArchieHelper, {lessonLaunchFor,lessonForLaunch} from './ArchieHelper';
import type { CourseLesson } from '@/lib/archie/course-types';

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
  state.playing=false;state.isOpen=true;state.pathname='/';state.search='';state.voiceOnOpen=false;state.lessonTutor=null;state.currentOptions=null;state.gameTitle=null;
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


const riverLesson = ():LessonTutorContext => ({activityId:'history-y3-w01-s1',questionId:'history-y3-w01-s1:question:0',
  stepId:'history-y3-w01-s1:phase:2',status:'answering',readText:'Which river supported farming? Nile. Thames.',
  teachingText:'The Nile supported farming in ancient Egypt.',hintText:'Think of the river in Egypt.',
  answerTarget:'course:history-y3-w01-s1:phase:2:question:0'});
async function typeToArchie(text:string){
  fireEvent.change(screen.getByRole('textbox',{name:'Your question for Archie'}),{target:{value:text}});
  await act(async()=>{fireEvent.click(screen.getByRole('button',{name:'Send question'}));});
}
describe('authored lesson conversation',()=>{
  it('reads the actual lesson part, gives authored Egypt help and never asks an online service',async()=>{
    state.lessonTutor=riverLesson();state.currentOptions=['Nile','Thames'];
    render(<ArchieHelper/>);await start();
    expect(state.speak.mock.calls[0][1]).toBe(state.lessonTutor.readText);
    await act(async()=>{latest().result('Why was this river useful in Egypt?');});
    expect(state.speak.mock.calls.at(-1)?.[1]).toContain('The Nile supported farming in ancient Egypt.');
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem('sodafom_archie_learning_v1')).toBeNull();
    await finishSpeech();await letArchieListen();
    await act(async()=>{latest().result('Give me a hint');});
    expect(state.speak.mock.calls.at(-1)?.[1]).toBe('Think of the river in Egypt.');
  });
  it('sends a real choice to its exact handler rather than treating its help word as a command or caching its grade',async()=>{
    state.lessonTutor=riverLesson();state.currentOptions=['Help a neighbour','Leave quietly'];
    const handler=vi.fn(()=> 'Well done. The story says the child helped a neighbour.');
    const remove=listenForGameAnswer(state.lessonTutor.answerTarget!,handler);
    try{
      render(<ArchieHelper/>);await typeToArchie('Help a neighbour');
      expect(handler).toHaveBeenCalledExactlyOnceWith('Help a neighbour');
      expect(state.speak.mock.calls.at(-1)?.[1]).toContain('The story says the child helped a neighbour.');
      expect(localStorage.getItem('sodafom_archie_learning_v1')).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    }finally{remove();}
  });
  it.each(['question','phase','paused'] as const)('retires recognition after a same-route %s change and ignores a delayed answer',async(change)=>{
    state.lessonTutor=riverLesson();state.currentOptions=['Nile','Thames'];
    const handler=vi.fn(()=> 'Well done.');const remove=listenForGameAnswer(state.lessonTutor.answerTarget!,handler);
    try{
      render(<ArchieHelper/>);await start();const old=latest();
      await act(async()=>{state.lessonTutor={...state.lessonTutor!,
        ...(change==='question'?{questionId:'history-y3-w01-s1:question:1',answerTarget:'new-target',readText:'Which crop grew by the Nile?'}:
          change==='phase'?{stepId:'history-y3-w01-s1:phase:3',status:'learning' as const,readText:'Draw a river and a farm.'}:
          {status:'paused' as const})};notify();});
      expect(old.abort).toHaveBeenCalledOnce();
      await act(async()=>{old.result('Nile');old.end();});await letArchieListen();
      expect(handler).not.toHaveBeenCalled();expect(FakeRecognition.instances).toHaveLength(1);
      if(change==='paused') expect(screen.getByRole('button',{name:'Start voice conversation'})).toBeEnabled();
      else {
        expect(screen.getByRole('button',{name:'Stop voice conversation'})).toBeEnabled();
        expect(state.speak).toHaveBeenLastCalledWith('read:archie-ai',state.lessonTutor!.readText);
        await finishSpeech();await letArchieListen();
        expect(FakeRecognition.instances).toHaveLength(2);
      }
    }finally{remove();}
  });
  it('keeps its conversation after a correct reply without moving the question, then obeys a spoken Stop',async()=>{
    state.lessonTutor=riverLesson();state.currentOptions=['Nile','Thames'];
    const handler=vi.fn(()=>{state.lessonTutor={...state.lessonTutor!,status:'answered',hintText:'The Nile supported farming.'};notify();return 'Well done. The Nile supported farming.';});
    const remove=listenForGameAnswer(state.lessonTutor.answerTarget!,handler);
    try{
      render(<ArchieHelper/>);await start();await act(async()=>{latest().result('Nile');});
      expect(handler).toHaveBeenCalledOnce();
      expect(screen.getByRole('button',{name:'Stop voice conversation'})).toBeEnabled();
      await finishSpeech();await letArchieListen();
      const active=latest();await act(async()=>{active.result('Stop');});await letArchieListen();
      expect(active.abort).toHaveBeenCalledOnce();expect(FakeRecognition.instances).toHaveLength(2);
      expect(state.speak).toHaveBeenCalledTimes(2);
      expect(state.lessonTutor?.questionId).toBe('history-y3-w01-s1:question:0');
      expect(localStorage.getItem('sodafom_archie_learning_v1')).toBeNull();
    }finally{remove();}
  });
  it('does not submit answers while paused or advance for a Next request',async()=>{
    state.lessonTutor={...riverLesson(),status:'paused'};state.currentOptions=['Nile','Thames'];
    const handler=vi.fn(()=> 'Well done.');const remove=listenForGameAnswer(state.lessonTutor.answerTarget!,handler);
    try{
      render(<ArchieHelper/>);await typeToArchie('Nile');
      expect(handler).not.toHaveBeenCalled();expect(state.speak.mock.calls.at(-1)?.[1]).toContain('lesson is paused');
      await act(async()=>{state.lessonTutor={...state.lessonTutor!,status:'answering'};notify();});
      await typeToArchie('Next');
      expect(handler).not.toHaveBeenCalled();expect(state.speak.mock.calls.at(-1)?.[1]).toContain('next or finish button');
    }finally{remove();}
  });
  it('keeps an existing game handler compatible and does not store its bare-answer grade',async()=>{
    state.gameTitle='Number Planets';
    const handler=vi.fn(()=> 'Well done. Six is correct for this planet.');
    const remove=listenForGameAnswer('Number Planets',handler);
    try{
      render(<ArchieHelper/>);await typeToArchie('six');
      expect(handler).toHaveBeenCalledExactlyOnceWith('six');
      expect(state.speak.mock.calls.at(-1)?.[1]).toContain('Six is correct for this planet.');
      expect(localStorage.getItem('sodafom_archie_learning_v1')).toBeNull();
    }finally{remove();}
  });
});

describe('bounded foreground conversation',()=>{
  it('stops after three consecutive empty sessions and needs an explicit restart',async()=>{
    render(<ArchieHelper/>);await start();
    for(let i=0;i<3;i++){
      await act(async()=>{latest().error('no-speech');latest().end();});
      await letArchieListen();
    }
    expect(FakeRecognition.instances).toHaveLength(3);
    expect(screen.getByRole('button',{name:'Start voice conversation'})).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent('after three tries');
    await act(async()=>{vi.advanceTimersByTime(30000);});
    expect(FakeRecognition.instances).toHaveLength(3);
    await start();expect(FakeRecognition.instances).toHaveLength(4);
  });
  it('ends a microphone session that never reports an end callback',async()=>{
    render(<ArchieHelper/>);await start();const listener=latest();
    await act(async()=>{vi.advanceTimersByTime(20000);});
    expect(listener.abort).toHaveBeenCalledOnce();
    expect(screen.getByRole('button',{name:'Start voice conversation'})).toBeEnabled();
    await letArchieListen();expect(FakeRecognition.instances).toHaveLength(1);
  });
  it('retires listening and stale callbacks when the page becomes hidden',async()=>{
    render(<ArchieHelper/>);await start();const listener=latest();const calls=state.speak.mock.calls.length;
    const hidden=vi.spyOn(document,'visibilityState','get').mockReturnValue('hidden');
    try {
      fireEvent(document,new Event('visibilitychange'));
      await act(async()=>{listener.result('What is 8 plus 4?');listener.end();});
      await letArchieListen();
      expect(listener.abort).toHaveBeenCalledOnce();expect(state.speak).toHaveBeenCalledTimes(calls);
      expect(screen.getByRole('button',{name:'Start voice conversation'})).toBeEnabled();
    } finally { hidden.mockRestore(); }
  });
  it('Stop reading also ends the conversation instead of silently restarting the microphone',async()=>{
    render(<ArchieHelper/>);fireEvent.click(screen.getByRole('button',{name:'Start voice conversation'}));
    fireEvent.click(screen.getByRole('button',{name:'Stop reading'}));
    await finishSpeech();await letArchieListen();
    expect(FakeRecognition.instances).toHaveLength(0);
    expect(screen.getByRole('button',{name:'Start voice conversation'})).toBeEnabled();
  });
});

describe('explicit current-year lesson launches',()=>{
  it.each(['maths','history','english','science'])('starts an authored %s lesson with one transient voice request',async(subject)=>{
    render(<ArchieHelper/>);await start();
    await act(async()=>{latest().result('Start my '+subject+' lesson');});
    expect(state.navigate).toHaveBeenCalledWith('/courses/'+subject+'-y4-w01-s1');
    expect(state.requestLessonVoice).toHaveBeenLastCalledWith(subject+'-y4-w01-s1');
    expect(state.closeArchie).toHaveBeenCalledOnce();expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem('sodafom_archie_learning_v1')).toBeNull();
  });
  it('Open navigates without requesting continued voice',async()=>{
    render(<ArchieHelper/>);await start();
    await act(async()=>{latest().result('Open maths lesson');});
    expect(state.navigate).toHaveBeenCalledWith('/courses/maths-y4-w01-s1');
    expect(state.requestLessonVoice).not.toHaveBeenCalledWith('maths-y4-w01-s1');
  });
  it('does not route a younger child to an Ancient Egypt lesson from another year',async()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:1}}));
    render(<ArchieHelper/>);await start();
    await act(async()=>{latest().result('Start Ancient Egypt lesson');});
    expect(state.navigate).not.toHaveBeenCalled();expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole('log')).toHaveTextContent("not in this resource's Year 1 history path");
  });
  it('starts the eligible Ancient Egypt path at Year 3 using its unchanged lesson ID',async()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:3}}));
    render(<ArchieHelper/>);await start();
    await act(async()=>{latest().result('Start Ancient Egypt lesson');});
    expect(state.navigate).toHaveBeenCalledWith('/courses/history-y3-w01-s1');
    expect(state.requestLessonVoice).toHaveBeenLastCalledWith('history-y3-w01-s1');
  });
  it('does not launch a question, a bare answer, or a game request as a talking lesson',()=>{
    for(const words of ['What is history?','science','play science','Start maths games','Please explain Ancient Egypt'])
      expect(lessonLaunchFor(words)).toBeNull();
    expect(lessonLaunchFor('Please start English lesson')).toEqual({subject:'english',egypt:false,spoken:true});
    const bank=[
      {id:'blocked',year:4,subject:'history',week:1,session:1,sensitive:true,title:'History',unit:'History'},
      {id:'old',year:3,subject:'history',week:1,session:1,title:'History',unit:'History'},
      {id:'done',year:4,subject:'history',week:1,session:2,title:'History',unit:'History'},
      {id:'next',year:4,subject:'history',week:2,session:1,title:'History',unit:'History'},
    ] as CourseLesson[];
    expect(lessonForLaunch({subject:'history',egypt:false,spoken:true},4,bank,['course-done'])?.id).toBe('next');
  });
  it('does not navigate if Stop cancels an in-flight lesson command',async()=>{
    render(<ArchieHelper/>);await start();
    // Import completion is asynchronous; Stop invalidates the request before it can launch.
    act(()=>{latest().result('Start maths lesson');});
    fireEvent.click(screen.getByRole('button',{name:'Stop voice conversation'}));
    await act(async()=>{await Promise.resolve();});
    expect(state.navigate).not.toHaveBeenCalled();expect(state.requestLessonVoice).not.toHaveBeenCalledWith('maths-y4-w01-s1');
  });
});

it('explicit voice-on-open narrates the mounted lesson before starting the microphone',async()=>{
  state.voiceOnOpen=true;
  state.lessonTutor={activityId:'history-y3-w01-s1',questionId:null,stepId:'phase0',status:'learning',
    readText:'The Nile river helped Egyptian farmers.',teachingText:'The Nile supported farming.'};
  render(<ArchieHelper/>);
  expect(state.speak).toHaveBeenLastCalledWith('read:archie-ai','The Nile river helped Egyptian farmers.');
  await letArchieListen();expect(FakeRecognition.instances).toHaveLength(0);
  await finishSpeech();await letArchieListen();expect(FakeRecognition.instances).toHaveLength(1);
});
it('restarts the current authored lesson directly when an explicit Start names the already mounted lesson',async()=>{
  state.pathname='/courses/maths-y4-w01-s1';
  state.lessonTutor={activityId:'maths-y4-w01-s1',questionId:null,stepId:'phase0',status:'learning',readText:'Add two groups.',teachingText:'Add two groups.'};
  render(<ArchieHelper/>);await start();
  await act(async()=>{latest().result('Start maths lesson');});
  expect(state.navigate).not.toHaveBeenCalled();expect(state.closeArchie).not.toHaveBeenCalled();
  expect(state.speak).toHaveBeenLastCalledWith('read:archie-ai','Add two groups.');
  await finishSpeech();await letArchieListen();expect(FakeRecognition.instances).toHaveLength(2);
});

it('keeps an exact authored answer choice ahead of an apparent lesson-launch command',async()=>{
  state.lessonTutor=riverLesson();state.currentOptions=['Start English lesson','Keep reading'];
  const handler=vi.fn(()=> 'That matches the story.');
  const remove=listenForGameAnswer(state.lessonTutor.answerTarget!,handler);
  try {
    render(<ArchieHelper/>);await typeToArchie('Start English lesson');
    expect(handler).toHaveBeenCalledExactlyOnceWith('Start English lesson');
    expect(state.navigate).not.toHaveBeenCalled();expect(localStorage.getItem('sodafom_archie_learning_v1')).toBeNull();
  } finally { remove(); }
});
