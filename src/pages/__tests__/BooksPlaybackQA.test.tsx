import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import Books from '../ArchieStoryCollectionPage';
vi.mock('react-router', () => ({useNavigate: () => vi.fn()}));
vi.mock('@/lib/voice-context', () => ({ttsSpeak: vi.fn(), stopTts: vi.fn()}));
vi.mock('@/components/ArchieCharacter', () => ({default: () => <div>Archie character</div>}));
let recognition: any;
class Recognition {
 onresult: any; onend: any; onerror: any;
 start = vi.fn(); stop = vi.fn();
 constructor() { recognition = this; }
}
beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('SpeechRecognition', Recognition); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
function openFirst() {
 const view=render(<Books/>);
 fireEvent.click(screen.getByRole('button', {name:'Open Archie and the Magic Key'}));
 fireEvent.click(screen.getByRole('button', {name:'Open the book'}));
 return view;
}
test('all ten books open, expose step-out character, turn through ten pages and return', () => {
 render(<Books/>);
 const names=screen.getAllByRole('button',{name:/^Open /}).map(b=>b.getAttribute('aria-label')!);
 expect(names).toHaveLength(10);
 for (const name of names) {
  fireEvent.click(screen.getByRole('button',{name}));
  expect(screen.getByLabelText(/^Archie steps out of/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Open the book'}));
  expect(screen.getByRole('button',{name:'Previous page'})).toBeDisabled();
  for(let page=1;page<=10;page++) {
   expect(screen.getByText(`Archie’s Stories · Page ${page} of 10`)).toBeInTheDocument();
   if(page<10) {fireEvent.click(screen.getByRole('button',{name:'Next page'}));act(()=>vi.advanceTimersByTime(750));}
  }
  expect(screen.getByRole('button',{name:'Next page'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'Previous page'}));act(()=>vi.advanceTimersByTime(750));
  expect(screen.getByText('Archie’s Stories · Page 9 of 10')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Back to library'}));
 }
});
test('read-along progresses across separate spoken chunks including the word a', () => {
 openFirst(); fireEvent.click(screen.getByRole('button',{name:'I want to read'}));
 act(()=>recognition.onresult({results:[[{transcript:'Archie found'}]]}));
 act(()=>recognition.onresult({results:[[{transcript:'a little golden key sparkling beneath his pillow'}]]}));
 expect(screen.getByRole('button',{name:'Page completed'})).toBeDisabled();
});
test('leaving the reader stops microphone recognition', () => {
 const view=openFirst();fireEvent.click(screen.getByRole('button',{name:'I want to read'}));
 const stop=recognition.stop;
 view.unmount();
 expect(stop).toHaveBeenCalled();
});
test('a pending page turn cannot leak into another book', () => {
 openFirst();
 fireEvent.click(screen.getByRole('button',{name:'Next page'}));
 fireEvent.click(screen.getByRole('button',{name:'Back to library'}));
 fireEvent.click(screen.getByRole('button',{name:'Open A Day at the Seaside'}));
 fireEvent.click(screen.getByRole('button',{name:'Open the book'}));
 act(()=>vi.advanceTimersByTime(2000));
 expect(screen.getByText('Archie’s Stories · Page 1 of 10')).toBeInTheDocument();
 expect(screen.getByRole('button',{name:'Next page'})).toBeEnabled();
});
test('microphone startup failure leaves a usable reader', () => {
 openFirst();
 vi.stubGlobal('SpeechRecognition',class extends Recognition { start=vi.fn(()=>{throw new Error('unavailable');}); });
 fireEvent.click(screen.getByRole('button',{name:'I want to read'}));
 expect(screen.getByRole('button',{name:'I want to read'})).toBeEnabled();
});
