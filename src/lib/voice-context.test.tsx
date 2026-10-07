import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getArchieVoice } from '@/lib/archie/age-style';

const native = vi.hoisted(() => ({enabled:false,speak:vi.fn(),stop:vi.fn()}));
vi.mock('@capacitor/core',()=>({
  Capacitor:{isNativePlatform:()=>native.enabled},registerPlugin:()=>native,
}));
import { VoiceProvider, useVoice, ttsSpeak, stopTts } from './voice-context';

class Utterance {
  lang='';rate=1;pitch=1;volume=1;voice:unknown=null;
  onend:(()=>void)|null=null;onerror:(()=>void)|null=null;
  constructor(public text:string){}
}
const ukVoice={name:'English UK',lang:'en-GB'} as SpeechSynthesisVoice;
let voices:SpeechSynthesisVoice[]=[];
const synthesis={getVoices:()=>voices,speak:vi.fn(),cancel:vi.fn(),onvoiceschanged:null as (()=>void)|null};

beforeEach(()=>{
  vi.useFakeTimers();localStorage.clear();voices=[];native.enabled=false;
  native.stop.mockResolvedValue(undefined);native.speak.mockResolvedValue({status:'finished'});
  vi.stubGlobal('SpeechSynthesisUtterance',Utterance);vi.stubGlobal('speechSynthesis',synthesis);
  vi.spyOn(console,'log').mockImplementation(()=>{});vi.spyOn(console,'info').mockImplementation(()=>{});
  vi.spyOn(console,'warn').mockImplementation(()=>{});vi.spyOn(console,'error').mockImplementation(()=>{});
});
afterEach(()=>{cleanup();stopTts();vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks();vi.clearAllMocks();});

describe('speech cancellation ownership',()=>{
  it('Stop cancels the delayed empty-voice fallback and any retained voice-ready callback',()=>{
    const ended=vi.fn();ttsSpeak('Count two counters.',ended);
    const oldReady=synthesis.onvoiceschanged;
    expect(synthesis.speak).not.toHaveBeenCalled();
    stopTts();voices=[ukVoice];oldReady?.();vi.advanceTimersByTime(1000);
    expect(synthesis.onvoiceschanged).toBeNull();
    expect(synthesis.speak).not.toHaveBeenCalled();expect(ended).not.toHaveBeenCalled();
  });
  it('supersedes an earlier voice wait while keeping one UK voice and the existing age pace',()=>{
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{year:1,sound:true}}));
    ttsSpeak('Old question');const oldReady=synthesis.onvoiceschanged;
    ttsSpeak('New question');voices=[{name:'Young US male',lang:'en-US'} as SpeechSynthesisVoice,ukVoice];oldReady?.();synthesis.onvoiceschanged?.();
    vi.advanceTimersByTime(1000);
    expect(synthesis.speak).toHaveBeenCalledOnce();
    expect(synthesis.speak.mock.calls[0][0]).toMatchObject({text:'New question',lang:'en-GB',voice:ukVoice,
      rate:getArchieVoice(1).rate,pitch:getArchieVoice(1).pitch});
  });
  it('does not fall back to browser speech when a stopped native request later fails',async()=>{
    native.enabled=true;let reject!:(reason:Error)=>void;
    native.speak.mockImplementationOnce(()=>new Promise((_resolve,no)=>{reject=no;}));
    const ended=vi.fn();ttsSpeak('Native question',ended);stopTts();
    reject(new Error('Delayed native failure'));await Promise.resolve();await Promise.resolve();
    vi.advanceTimersByTime(1000);
    expect(native.stop).toHaveBeenCalled();expect(synthesis.speak).not.toHaveBeenCalled();
    expect(ended).not.toHaveBeenCalled();
  });
  it('retains browser fallback for an active failed native request',async()=>{
    native.enabled=true;voices=[ukVoice];native.speak.mockRejectedValueOnce(new Error('Unavailable'));
    ttsSpeak('Still active');await Promise.resolve();await Promise.resolve();
    expect(synthesis.speak).toHaveBeenCalledOnce();
    expect(synthesis.speak.mock.calls[0][0].text).toBe('Still active');
  });
  it('does not let an old utterance end a newer provider readout',()=>{
    voices=[ukVoice];const {result}=renderHook(()=>useVoice(),{wrapper:VoiceProvider});
    act(()=>result.current.speak('first','First question'));
    const old=synthesis.speak.mock.calls[0][0] as Utterance;
    act(()=>result.current.speak('second','Second question'));
    const current=synthesis.speak.mock.calls[1][0] as Utterance;
    act(()=>old.onend?.());expect(result.current.playing).toBe(true);
    act(()=>current.onend?.());expect(result.current.playing).toBe(false);
  });
  it('retires a recorded clip failure after Stop without starting fallback speech',async()=>{
    let reject!:(reason:Error)=>void;
    const audio={onended:null as (()=>void)|null,onerror:null as (()=>void)|null,
      pause:vi.fn(),play:vi.fn(()=>new Promise<void>((_resolve,no)=>{reject=no;}))};
    vi.stubGlobal('Audio',class {constructor(){return audio;}});
    const {result}=renderHook(()=>useVoice(),{wrapper:VoiceProvider});
    act(()=>result.current.setChildId('local-profile'));
    act(()=>result.current.saveClip('welcome','Welcome','Hello','data:audio/webm;base64,AA=='));
    act(()=>result.current.speak('welcome','Hello there'));
    const staleError=audio.onerror;
    act(()=>result.current.stop());
    await act(async()=>{reject(new Error('Stopped audio'));staleError?.();});
    vi.advanceTimersByTime(1000);
    expect(audio.pause).toHaveBeenCalledOnce();expect(audio.onerror).toBeNull();
    expect(synthesis.speak).not.toHaveBeenCalled();expect(result.current.playing).toBe(false);
  });
  it('unmount cancels a provider readout waiting for voices',()=>{
    const {result,unmount}=renderHook(()=>useVoice(),{wrapper:VoiceProvider});
    act(()=>result.current.speak('read','Waiting question'));const oldReady=synthesis.onvoiceschanged;
    unmount();oldReady?.();vi.advanceTimersByTime(1000);
    expect(synthesis.speak).not.toHaveBeenCalled();
  });
  it('keeps sound-off silent even if the voice list becomes ready later',()=>{
    const {result}=renderHook(()=>useVoice(),{wrapper:VoiceProvider});
    act(()=>result.current.speak('read','A question'));
    localStorage.setItem('sodafom_archie_design_v1',JSON.stringify({settings:{sound:false}}));
    voices=[ukVoice];act(()=>synthesis.onvoiceschanged?.());
    expect(synthesis.speak).not.toHaveBeenCalled();expect(result.current.playing).toBe(false);
  });
});

describe('speech-engine failure fallback',()=>{
  it('makes one browser attempt when the native bridge throws synchronously',()=>{
    native.enabled=true;voices=[ukVoice];native.speak.mockImplementationOnce(()=>{throw new Error('Bridge unavailable');});
    ttsSpeak('Read the lesson');
    expect(synthesis.speak).toHaveBeenCalledOnce();
    expect(synthesis.speak.mock.calls[0][0]).toMatchObject({text:'Read the lesson',lang:'en-GB',voice:ukVoice});
  });
  it('returns to a text-ready provider state when browser speech cannot start',()=>{
    voices=[ukVoice];synthesis.speak.mockImplementationOnce(()=>{throw new Error('Speech unavailable');});
    const {result}=renderHook(()=>useVoice(),{wrapper:VoiceProvider});
    act(()=>result.current.speak('lesson','Read the lesson'));
    expect(result.current.playing).toBe(false);expect(synthesis.speak).toHaveBeenCalledOnce();
  });
  it('finishes cleanly when the utterance API is missing',()=>{
    vi.stubGlobal('SpeechSynthesisUtterance',undefined);
    const ended=vi.fn();ttsSpeak('Read the lesson',ended);
    expect(ended).toHaveBeenCalledOnce();expect(synthesis.speak).not.toHaveBeenCalled();
  });
});
