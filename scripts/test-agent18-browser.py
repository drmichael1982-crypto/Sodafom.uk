"""Isolated audio-service browser checks, NOT the complete React app.
Requires TypeScript, Python Playwright and Chromium. No paid API calls.
Run: python scripts/test-agent18-browser.py
No network navigation is used. Speech recognition/synthesis and permission events
are deterministic mocks. MediaRecorder records a synthetic Web Audio stream.
AudioContext is real. This cannot assess hardware, permissions or sound quality.
"""
from pathlib import Path
from tempfile import TemporaryDirectory
import os
import shutil
import subprocess
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = r'''<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Agent 18 audio service test</title>
<style>body{font-family:system-ui;margin:16px;max-width:600px}button,label{display:block;min-height:44px;margin:8px 0}input{max-width:100%}</style>
<h1>Audio service harness</h1><p>This is not the Sodafom app UI.</p>
<button id="mic" aria-pressed="false">Start microphone</button><p id="status" role="status">Microphone off.</p>
<label>Typing fallback <input id="typed"></label><button id="speak">Read test line</button><button id="stop">Stop speech</button>
<label><input id="quiet" type="checkbox">Quiet mode</label><button id="effect">Test optional effect</button>
<button id="record">Record synthetic audio stream</button><button id="stoprecord">Stop recording</button><p id="recordstatus"></p>
<script>
__MODULES__
const policy=load('./audio-policy'), input=load('./speech-input'), audio=load('./audio-runtime');
class Rec {
 static all=[];
 constructor(){Rec.all.push(this)}
 start(){this.started=true}
 abort(){this.aborted=true}
}
class Synth extends EventTarget {
 voices=[{name:'Test child boy',voiceURI:'test-boy',lang:'en-GB',localService:true}]; calls=[];
 getVoices(){return this.voices} speak(u){this.calls.push(u)} cancel(){}
}
const synth=new Synth();
Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:Rec});
Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});
window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
let mic='off',stopMic=()=>{},speech,recording;
const state={transcripts:[],effect:null,recordState:'off',tracks:[],blobSize:0,blobType:''};
const byId=id=>document.getElementById(id);
byId('mic').onclick=()=>{
 if(['requesting','listening'].includes(mic)){stopMic();return}
 stopMic=input.startSpeechInput({onState:(s,msg)=>{mic=s;byId('status').textContent=msg;byId('mic').textContent=['requesting','listening'].includes(s)?'Stop microphone':'Start microphone';byId('mic').setAttribute('aria-pressed',String(['requesting','listening'].includes(s)));},onTranscript:t=>state.transcripts.push(t)}, {isSecureContext:true,SpeechRecognition:Rec,document,addEventListener:window.addEventListener.bind(window),removeEventListener:window.removeEventListener.bind(window)});
};
byId('speak').onclick=()=>{speech=audio.speakAudio('A short test line.');state.result=null;speech.finished.then(result=>state.result=result)};
byId('stop').onclick=()=>speech?.stop();
byId('quiet').checked=policy.getAudioSettings().quiet;
byId('quiet').onchange=e=>policy.updateAudioSettings({quiet:e.target.checked});
byId('effect').onclick=()=>{state.effect=null;audio.playActionSound('gentle-pop').then(result=>state.effect=result)};
byId('record').onclick=()=>{
 recording=input.startVoiceRecording({onState:(s,msg)=>{state.recordState=s;byId('recordstatus').textContent=msg},onBlob:blob=>{state.blobSize=blob.size;state.blobType=blob.type}},
 {isSecureContext:true,MediaRecorder:window.MediaRecorder,document,
 navigator:{mediaDevices:{getUserMedia:async c=>{const context=new AudioContext();await context.resume();const destination=context.createMediaStreamDestination();const oscillator=context.createOscillator();oscillator.frequency.value=220;oscillator.connect(destination);oscillator.start();state.recordContext=context;state.recordOscillator=oscillator;const stream=destination.stream;state.tracks=stream.getTracks();return stream}}},
 addEventListener:window.addEventListener.bind(window),removeEventListener:window.removeEventListener.bind(window)});
};
byId('stoprecord').onclick=()=>recording?.stop();
window.harness={policy,input,audio,synth,Rec,state,latest:()=>Rec.all.at(-1)};
</script></html>'''

def run():
    tsc = ROOT / 'node_modules' / '.bin' / ('tsc.cmd' if os.name == 'nt' else 'tsc')
    compiler = str(tsc) if tsc.exists() else os.environ.get('AGENT18_TSC', 'tsc')
    total = 0
    with TemporaryDirectory(prefix='agent18-browser-') as directory:
        output = Path(directory)
        sources = [f'src/lib/{name}.ts' for name in ['audio-policy', 'audio-runtime', 'speech-input', 'island-speech']]
        subprocess.run([compiler, '--strict', '--noUnusedLocals', '--noUnusedParameters', '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node', '--lib', 'ES2022,DOM', '--outDir', directory, *sources], cwd=ROOT, check=True)
        modules = {f'./{path.stem}': path.read_text() for path in output.glob('*.js')}
        loader = 'const modules=' + json.dumps(modules) + ';const cache={};function load(name){if(cache[name])return cache[name].exports;const module={exports:{}};cache[name]=module;new Function("require","module","exports",modules[name])(load,module,module.exports);return module.exports;}'
        html = HTML.replace('__MODULES__', loader.replace('</script', '<\\/script'))
        with sync_playwright() as playwright:
            executable = os.environ.get('AGENT18_CHROMIUM') or shutil.which('chromium')
            browser = playwright.chromium.launch(executable_path=executable, headless=True, args=['--no-sandbox'])
            print(f'Chromium {browser.version}; offline harness; STT/TTS/permission mocked; MediaRecorder uses Web Audio stream.')
            for name, width, height, mobile in [('desktop',1440,900,False),('mobile',390,844,True)]:
                context = browser.new_context(viewport={'width':width,'height':height}, is_mobile=mobile, has_touch=mobile)
                page = context.new_page()
                errors=[]
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.set_content(html)
                page.wait_for_function('!!window.harness')
                def check(label, condition=True):
                    nonlocal total
                    assert condition, f'{name}: {label}; browser errors={errors}'
                    total += 1
                    print(f'PASS {name}: {label}')
                check('no automatic mic activation', page.evaluate('harness.Rec.all.length') == 0)
                page.click('#mic')
                check('pending permission is visible and cancellable', page.locator('#mic').get_attribute('aria-pressed') == 'true' and 'permission' in page.locator('#status').inner_text())
                page.click('#mic')
                check('Stop aborts pending microphone', page.evaluate('harness.latest().aborted') and page.locator('#mic').get_attribute('aria-pressed') == 'false')
                page.click('#mic'); page.evaluate('harness.latest().onstart()')
                check('explicit listening state', 'Microphone on' in page.locator('#status').inner_text())
                page.evaluate("harness.latest().onresult({results:[{isFinal:true,0:{transcript:'test answer'}}]})")
                check('final result releases microphone exactly once', page.evaluate("harness.state.transcripts.length===1 && harness.policy.getAudioFocus()===null"))
                page.click('#mic'); page.evaluate("harness.latest().onerror({error:'not-allowed'})")
                page.fill('#typed','Typing still works')
                check('denied permission keeps typing fallback', 'not allowed' in page.locator('#status').inner_text() and page.input_value('#typed') == 'Typing still works')
                page.evaluate('harness.synth.voices=[]'); page.click('#speak'); page.click('#stop')
                page.evaluate("harness.synth.voices=[{name:'Test child boy',voiceURI:'test-boy',lang:'en-GB',localService:true}];harness.synth.dispatchEvent(new Event('voiceschanged'))")
                page.wait_for_timeout(1100)
                check('no speech resurrection after Stop', page.evaluate("harness.state.result==='cancelled' && harness.synth.calls.length===0"))
                page.evaluate('harness.policy.updateAudioSettings({effects:true,music:true})'); page.click('#speak')
                check('foreground speech silences optional audio', page.evaluate("harness.policy.channelVolume('effects')===0 && harness.policy.channelVolume('music')===0"))
                page.click('#stop'); page.click('#effect'); page.wait_for_function('harness.state.effect!==null')
                check('real Web Audio effect completes after click', page.evaluate('harness.state.effect===true'))
                page.check('#quiet'); page.click('#effect'); page.wait_for_function('harness.state.effect!==null')
                check('quiet mode blocks optional effects', page.evaluate('harness.state.effect===false'))
                page.click('#record'); page.wait_for_function("harness.state.recordState==='recording'", timeout=10000)
                page.wait_for_timeout(350); page.click('#stoprecord'); page.wait_for_function('harness.state.blobSize>0', timeout=5000)
                check('real MediaRecorder returns typed clip and stops synthetic tracks', page.evaluate("harness.state.blobType.startsWith('audio/') && harness.state.tracks.every(t=>t.readyState==='ended')"))
                page.evaluate('harness.state.recordOscillator.stop();harness.state.recordContext.close()')
                page.click('#mic'); page.evaluate("window.dispatchEvent(new Event('pagehide'))")
                check('page exit switches shared microphone off', page.evaluate("harness.latest().aborted && harness.policy.getAudioFocus()===null"))
                check('harness touch targets/layout and no browser errors', not errors and page.evaluate("document.documentElement.scrollWidth<=innerWidth && document.getElementById('mic').getBoundingClientRect().height>=44"))
                context.close()
            browser.close()
    print(f'{total}/{total} browser harness checks passed. Not Safari, Android-native, hardware permissions, real speech, or full-app testing.')

if __name__ == '__main__':
    run()
