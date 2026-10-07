import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
vi.mock('@/contexts/ArchieContext',()=>({useArchieContext:()=>({setGameContext:vi.fn()})}));vi.mock('@/lib/voice-context',()=>({useVoice:()=>({speak:vi.fn()})}));
import HistoryJigsaw,{HISTORY_TOPICS} from './HistoryJigsaw';
afterEach(cleanup);
it('rejects wrong history answers then explains and completes all four scenes',()=>{render(<HistoryJigsaw/>);HISTORY_TOPICS.forEach((topic,i)=>{fireEvent.change(screen.getByRole('combobox',{name:'History scene'}),{target:{value:String(i)}});fireEvent.click(screen.getByRole('button',{name:topic.facts[0][2]}));expect(screen.getByLabelText(`${topic.title} picture: 0 of 6 pieces`)).toBeTruthy();topic.facts.forEach(fact=>fireEvent.click(screen.getByRole('button',{name:fact[1],exact:true})));expect(screen.getByLabelText(`${topic.title} picture: 6 of 6 pieces`)).toBeTruthy();expect(screen.getByText(topic.facts[5][3])).toBeTruthy();});});
