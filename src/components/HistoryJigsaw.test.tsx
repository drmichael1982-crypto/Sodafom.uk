import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
const saved=vi.hoisted(()=>({complete:vi.fn()}));
vi.mock('@/contexts/ArchieContext',()=>({useArchieContext:()=>({setGameContext:vi.fn()})}));vi.mock('@/lib/voice-context',()=>({useVoice:()=>({speak:vi.fn(),stop:vi.fn()})}));
vi.mock('@/lib/archie/storage',()=>({useArchieData:()=>({complete:saved.complete})}));
import HistoryJigsaw,{HISTORY_TOPICS} from './HistoryJigsaw';
afterEach(()=>{cleanup();vi.clearAllMocks();});
it('rejects wrong history answers then explains, records and completes all four scenes',()=>{render(<HistoryJigsaw/>);HISTORY_TOPICS.forEach((topic,i)=>{fireEvent.change(screen.getByRole('combobox',{name:'History scene'}),{target:{value:String(i)}});fireEvent.click(screen.getByRole('button',{name:topic.facts[0][2]}));expect(screen.getByLabelText(`${topic.title} picture: 0 of 6 pieces`)).toBeTruthy();topic.facts.forEach(fact=>fireEvent.click(screen.getByRole('button',{name:fact[1]})));expect(screen.getByLabelText(`${topic.title} picture: 6 of 6 pieces`)).toBeTruthy();expect(screen.getByText(topic.facts[5][3])).toBeTruthy();});expect(saved.complete).toHaveBeenCalledTimes(4);expect(saved.complete).toHaveBeenLastCalledWith({id:'history-jigsaw-anglo-saxon',kind:'lesson',title:'Anglo-Saxons history picture puzzle',stars:1});});
it('pauses answers without losing a picture piece, then resumes and can restart',()=>{
  render(<HistoryJigsaw/>);const first=HISTORY_TOPICS[0].facts[0];fireEvent.click(screen.getByRole('button',{name:first[1]}));
  expect(screen.getByLabelText('Ancient Egypt picture: 1 of 6 pieces')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Pause puzzle'}));
  expect(screen.getByRole('button',{name:HISTORY_TOPICS[0].facts[1][1]})).toBeDisabled();
  expect(screen.getByLabelText('Ancient Egypt picture: 1 of 6 pieces')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Resume puzzle'}));
  fireEvent.click(screen.getByRole('button',{name:'Start this scene again'}));
  expect(screen.getByLabelText('Ancient Egypt picture: 0 of 6 pieces')).toBeInTheDocument();
});
