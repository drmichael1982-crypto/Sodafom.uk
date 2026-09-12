import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLessonConversation } from '../useLessonConversation';
class Recognition {
  static instances: Recognition[] = [];
  lang=''; continuous=false; interimResults=false;
  onstart:(()=>void)|null=null; onend:(()=>void)|null=null;
  onerror:((event:{error:string})=>void)|null=null;
  onresult:((event:unknown)=>void)|null=null;
  start=vi.fn(()=>this.onstart?.()); abort=vi.fn();
  constructor(){Recognition.instances.push(this);}
}
const latest = () => Recognition.instances[Recognition.instances.length-1];
beforeEach(()=>{vi.useFakeTimers();Recognition.instances=[];vi.stubGlobal('SpeechRecognition',Recognition);Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});});
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});});
const options=()=>({active:true,speaking:false,onStatus:vi.fn(),onTranscript:vi.fn()});
describe('opt-in lesson voice lifecycle',()=>{
  it('does not request speech recognition until the user enables it',()=>{
    const {result}=renderHook(()=>useLessonConversation(options()));
    act(()=>vi.advanceTimersByTime(2000)); expect(Recognition.instances).toHaveLength(0);
    act(()=>result.current.enable()); expect(latest().start).toHaveBeenCalledOnce(); expect(result.current.listening).toBe(true);
  });
  it('suspends during Archie speech and resumes after, only after opt-in',()=>{
    const config=options();const {result,rerender}=renderHook(({speaking})=>useLessonConversation({...config,speaking}),{initialProps:{speaking:false}});
    act(()=>result.current.enable());const first=latest();rerender({speaking:true});expect(first.abort).toHaveBeenCalled();
    act(()=>vi.advanceTimersByTime(1500));expect(Recognition.instances).toHaveLength(1);
    rerender({speaking:false});act(()=>vi.advanceTimersByTime(500));expect(Recognition.instances).toHaveLength(2);
  });
  it('does not turn the microphone on just because Archie finished speaking',()=>{
    const config=options();const {rerender}=renderHook(({speaking})=>useLessonConversation({...config,speaking}),{initialProps:{speaking:true}});
    rerender({speaking:false});act(()=>vi.advanceTimersByTime(2000));expect(Recognition.instances).toHaveLength(0);
  });
  it('delivers an answer once and accepts a spoken stop command',()=>{
    const config=options();const {result}=renderHook(()=>useLessonConversation(config));act(()=>result.current.enable());
    act(()=>latest().onresult?.({results:[[{transcript:'three'}]],resultIndex:0}));expect(config.onTranscript).toHaveBeenCalledExactlyOnceWith('three');
    act(()=>vi.advanceTimersByTime(700));act(()=>latest().onresult?.({results:[[{transcript:'stop listening'}]],resultIndex:0}));
    expect(result.current.enabled).toBe(false);expect(config.onTranscript).toHaveBeenCalledTimes(1);
  });
  it('stops on hidden page and does not automatically restart when visible',()=>{
    const {result}=renderHook(()=>useLessonConversation(options()));act(()=>result.current.enable());const first=latest();
    act(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
    expect(first.abort).toHaveBeenCalled();expect(result.current.enabled).toBe(false);
    act(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'));vi.advanceTimersByTime(3000);});expect(Recognition.instances).toHaveLength(1);
  });
  it('stops on pause and unmount, requiring explicit re-enable',()=>{
    const config=options();const {result,rerender,unmount}=renderHook(({active})=>useLessonConversation({...config,active}),{initialProps:{active:true}});
    act(()=>result.current.enable());rerender({active:false});expect(result.current.enabled).toBe(false);expect(latest().abort).toHaveBeenCalled();
    rerender({active:true});act(()=>vi.advanceTimersByTime(1500));expect(Recognition.instances).toHaveLength(1);
    act(()=>result.current.enable());const last=latest();unmount();expect(last.abort).toHaveBeenCalled();
  });
  it('fails closed on denied permissions',()=>{
    const {result}=renderHook(()=>useLessonConversation(options()));act(()=>result.current.enable());
    act(()=>latest().onerror?.({error:'not-allowed'}));expect(result.current.enabled).toBe(false);
    act(()=>vi.advanceTimersByTime(5000));expect(Recognition.instances).toHaveLength(1);
  });
});
