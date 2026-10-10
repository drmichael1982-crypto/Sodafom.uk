import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { speak, stop, navigate } = vi.hoisted(() => ({speak:vi.fn(),stop:vi.fn(),navigate:vi.fn()}));
vi.mock('@/lib/voice-context',()=>({useVoice:()=>({speak,stop,playing:false})}));
vi.mock('react-router',()=>({useNavigate:()=>navigate,useLocation:()=>({pathname:'/'})}));
vi.mock('@/contexts/ArchieContext',()=>({useArchieContext:()=>({isOpen:true,draft:'',voiceOnOpen:false,openArchie:vi.fn(),closeArchie:vi.fn(),gameTitle:'Home',subject:'Learning',currentQuestion:null,currentOptions:null})}));
import ArchieHelper from './ArchieHelper';
beforeEach(()=>{
  localStorage.clear();
  HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
  HTMLElement.prototype.scrollIntoView=vi.fn();
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.clearAllMocks();});
async function ask(question:string) {
  render(<ArchieHelper/>);
  await submit(question);
}
async function submit(question:string) {
  fireEvent.change(screen.getByLabelText('Your question for Archie'),{target:{value:question}});
  fireEvent.click(screen.getByLabelText('Send question'));
}
describe('Archie online-help privacy default',()=>{
  it('does not transmit a wider question from a new device',async()=>{
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
    await ask('Explain the history of the telescope');
    await screen.findByText(/Online learning help is off on this device/);
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem('sodafom_archie_learning_v1')).toBeNull();
  });
  it('keeps online help off for existing saved settings without an opt-in',async()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:false,largeText:false},activities:[],stickers:[]}));
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
    await ask('Explain the history of the telescope');
    await screen.findByText(/Online learning help is off on this device/);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('allows the same-origin learning service only after opt-in',async()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:false,largeText:false,onlineHelp:true},activities:[],stickers:[]}));
    const fetch=vi.fn().mockResolvedValue({ok:true,text:async()=> 'Telescopes help us study distant objects.'});vi.stubGlobal('fetch',fetch);
    await ask('Explain the history of the telescope');
    await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch.mock.calls[0][0]).toBe('/api/chat');
    await screen.findByText('Answered by the learning service.');
  });
  it('still answers built-in maths with no network request',async()=>{
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
    await ask('What is 8 plus 4?');
    await screen.findByText('Answered on this device.');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('uses the parent-saved age for a built-in age-specific answer before the school year',async()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:8,sound:false},activities:[],stickers:[]}));
    localStorage.setItem('sodafom_learning_age','6');
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
    await ask('Who was Christopher Columbus?');
    await screen.findByText('Answered on this device.');
    expect(screen.getByRole('log')).toHaveTextContent('sailor from Genoa, in present-day Italy');
    expect(screen.getByRole('log')).not.toHaveTextContent('Historians examine both');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('sends the parent-saved age to opted-in online help',async()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:false,onlineHelp:true},activities:[],stickers:[]}));
    localStorage.setItem('sodafom_learning_age','6');
    const fetch=vi.fn().mockResolvedValue({ok:true,text:async()=> 'Telescopes help us study distant objects.'});vi.stubGlobal('fetch',fetch);
    await ask('Explain the history of the telescope');
    await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toMatchObject({learnerAge:6});
  });
  it('keeps a locally saved nickname out of later online conversation history',async()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:false,onlineHelp:true,childNickname:'Mia'},activities:[],stickers:[]}));
    const fetch=vi.fn().mockResolvedValue({ok:true,text:async()=> 'Telescopes help us study distant objects.'});vi.stubGlobal('fetch',fetch);
    render(<ArchieHelper/>);
    await submit('What is 8 plus 4?');
    await screen.findByText('Answered on this device.');
    expect(screen.getByRole('log')).toHaveTextContent('Mia');
    await submit('Explain the history of the telescope');
    await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(1));
    const body=JSON.parse(String(fetch.mock.calls[0][1]?.body));
    expect(JSON.stringify(body.messages)).not.toMatch(/Mia/i);
    expect(body.messages).toEqual(expect.arrayContaining([
      expect.objectContaining({role:'assistant',content:expect.stringMatching(/the learner/i)}),
      expect.objectContaining({role:'user',content:'Explain the history of the telescope'}),
    ]));
  });
  it('falls back to the school year when a saved learning age is invalid',async()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:8,sound:false},activities:[],stickers:[]}));
    localStorage.setItem('sodafom_learning_age','99');
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
    await ask('Who was Christopher Columbus?');
    await screen.findByText('Answered on this device.');
    expect(screen.getByRole('log')).toHaveTextContent('Historians examine both');
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('Archie reply feedback',()=>{
  it.each([
    'That is not correct. Try again.',
    'This is the wrong answer. Read the hint to find the correct answer.',
    'Well done!',
  ])('does not infer an answer grade from reply text: %s',async(reply)=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:4,sound:false,onlineHelp:true},activities:[],stickers:[]}));
    const fetch=vi.fn().mockResolvedValue({ok:true,text:async()=>reply});
    vi.stubGlobal('fetch',fetch);
    await ask('Explain the history of the telescope');
    await screen.findByText('Answered by the learning service.');
    expect(screen.getByRole('log').textContent).toContain(reply);
    expect(screen.queryByLabelText('Correct')).not.toBeInTheDocument();
    speak.mockClear();
    fireEvent.click(screen.getByRole('button',{name:'Listen to Archie'}));
    expect(speak).toHaveBeenCalledWith('read:archie-ai',reply);
    expect(screen.getByLabelText('Your question for Archie')).toBeEnabled();
  });
});
