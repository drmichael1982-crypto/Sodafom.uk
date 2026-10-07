import {cleanup,fireEvent,render,screen} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
const saved=vi.hoisted(()=>({complete:vi.fn()}));
vi.mock('@/lib/archie/storage',()=>({useArchieData:()=>({complete:saved.complete})}));
import FractionJigsaw,{fractionTasksForYear} from './FractionJigsaw';
afterEach(()=>{cleanup();vi.clearAllMocks();});
it('one eighth needs exactly one of eight equal pieces for Year 3',()=>{render(<FractionJigsaw year={3}/>);expect(screen.getAllByRole('button',{name:/Fraction section/})).toHaveLength(8);fireEvent.click(screen.getByRole('button',{name:'Check the fraction'}));expect(screen.getByText(/You have placed 0 sections/)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Fraction section 3'}));fireEvent.click(screen.getByRole('button',{name:'Check the fraction'}));expect(screen.getByText('It fits! 1 out of 8 equal sections makes 1/8.')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Next fraction'}));expect(screen.getByText('Fit 1/2 into the circle')).toBeTruthy();expect(screen.getAllByRole('button',{name:/Fraction section/})).toHaveLength(2);});
it('supports keyboard placement and removal',()=>{render(<FractionJigsaw year={3}/>);const piece=screen.getByRole('button',{name:'Fraction section 1'});fireEvent.keyDown(piece,{key:'Enter'});expect(piece.getAttribute('aria-pressed')).toBe('true');fireEvent.keyDown(piece,{key:' '});expect(piece.getAttribute('aria-pressed')).toBe('false');});
it('keeps Year 1 to halves and quarters and Year 2 to thirds, halves and quarters',()=>{
  expect(fractionTasksForYear(1)).toEqual([[1,2],[1,4]]);
  expect(fractionTasksForYear(2)).toEqual([[1,3],[1,2],[1,4],[2,4],[3,4]]);
  expect(fractionTasksForYear(3)).toContainEqual([1,8]);
});
it('pauses without losing fitted pieces and reports a completed Year 1 sequence once',()=>{
  render(<FractionJigsaw year={1}/>);
  const first=screen.getByRole('button',{name:'Fraction section 1'});
  fireEvent.click(first);fireEvent.click(screen.getByRole('button',{name:'Pause puzzle'}));
  expect(first).toHaveAttribute('aria-pressed','true');expect(first).toHaveAttribute('aria-disabled','true');
  expect(screen.getByRole('button',{name:'Check the fraction'})).toBeDisabled();
  fireEvent.click(screen.getByRole('button',{name:'Resume puzzle'}));
  fireEvent.click(screen.getByRole('button',{name:'Check the fraction'}));
  fireEvent.click(screen.getByRole('button',{name:'Next fraction'}));
  fireEvent.click(screen.getByRole('button',{name:'Fraction section 1'}));
  fireEvent.click(screen.getByRole('button',{name:'Check the fraction'}));
  expect(saved.complete).toHaveBeenCalledExactlyOnceWith({id:'fraction-jigsaw-year-1',kind:'lesson',title:'Year 1 fraction picture puzzles',stars:1});
  expect(screen.getByRole('button',{name:'Practise the fractions again'})).toBeInTheDocument();
});
