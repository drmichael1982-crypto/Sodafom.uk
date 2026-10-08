import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const helpers=vi.hoisted(()=>({openArchie:vi.fn(),stop:vi.fn()}));
vi.mock('@/contexts/ArchieContext',()=>({useArchieContext:()=>helpers}));
vi.mock('@/lib/voice-context',()=>({useVoice:()=>helpers}));
import PagePictureJigsaw, {PagePictureFrame} from './PagePictureJigsaw';
beforeEach(()=>{localStorage.clear();vi.clearAllMocks();Object.defineProperty(window,'innerWidth',{configurable:true,value:390});Object.defineProperty(window,'innerHeight',{configurable:true,value:844});});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
function show(key='home'){return render(<MemoryRouter><PagePictureJigsaw pageKey={key}/></MemoryRouter>);}
describe('whole-page picture around fixed icons',()=>{
 it('keeps the current lesson as a fixed icon that returns to learning',()=>{
  const back=vi.fn();render(<MemoryRouter><PagePictureJigsaw pageKey="/lesson" onReturn={back}/></MemoryRouter>);
  fireEvent.click(screen.getByRole('button',{name:'My lesson'}));expect(back).toHaveBeenCalledOnce();
 });

 it('rejects the wrong space, fits the right piece and keeps the iconic buttons active',()=>{
  show();const board=screen.getByLabelText('Picture puzzle spaces');
  fireEvent.click(screen.getByRole('button',{name:'Pick picture piece 2'}));
  fireEvent.click(screen.getByRole('button',{name:'Place picture piece 3'}));
  expect(screen.getByRole('status')).toHaveTextContent('does not join');
  expect(board.querySelectorAll('.picture-piece-fitted')).toHaveLength(0);
  fireEvent.click(screen.getByRole('button',{name:'Place picture piece 2'}));
  expect(screen.getByRole('button',{name:'Fitted picture piece 2'})).toBeDisabled();
  expect(board.querySelectorAll('.picture-fixed-piece')).toHaveLength(6);
  expect(within(board).getByRole('link',{name:'Maths'})).toHaveAttribute('href','/games?subject=maths');
  fireEvent.click(within(board).getByRole('button',{name:'Ask Archie'}));expect(helpers.openArchie).toHaveBeenCalledOnce();
 });
 it('saves the completed pieces on the same page and isolates other pages',()=>{
  const view=show();fireEvent.click(screen.getByRole('button',{name:'Pick picture piece 2'}));fireEvent.click(screen.getByRole('button',{name:'Place picture piece 2'}));view.unmount();
  const again=show();expect(screen.getByRole('button',{name:'Fitted picture piece 2'})).toBeDisabled();again.unmount();
  show('/games?subject=maths');expect(screen.getByRole('button',{name:'Place picture piece 2'})).toBeEnabled();
 });
 it('finishes only when all surrounding pieces are fitted and resets without removing fixed buttons',()=>{
  show();const board=screen.getByLabelText('Picture puzzle spaces');const holes=Array.from(board.querySelectorAll('.picture-empty-space')).map(element=>Number(element.getAttribute('aria-label')!.match(/\d+/)![0]));
  for(const piece of holes){fireEvent.click(screen.getByRole('button',{name:`Pick picture piece ${piece}`}));fireEvent.click(screen.getByRole('button',{name:`Place picture piece ${piece}`}));}
  expect(screen.getByRole('status')).toHaveTextContent('completed the whole picture');expect(screen.getByLabelText('Loose picture pieces').querySelectorAll('button')).toHaveLength(0);
  fireEvent.click(screen.getByRole('button',{name:'Start picture again'}));expect(board.querySelectorAll('.picture-empty-space')).toHaveLength(14);expect(board.querySelectorAll('.picture-fixed-piece')).toHaveLength(6);
 });
 it('keeps six distinct fixed buttons on landscape phones',()=>{
  Object.defineProperty(window,'innerWidth',{configurable:true,value:844});Object.defineProperty(window,'innerHeight',{configurable:true,value:390});show();
  const board=screen.getByLabelText('Picture puzzle spaces');expect(board.querySelectorAll('.picture-fixed-piece')).toHaveLength(6);expect(board.querySelectorAll('.picture-empty-space')).toHaveLength(6);
 });
 it('rejects corrupt saved pieces and prevents duplicate completion counts',()=>{
  localStorage.setItem('sodafom:picture-jigsaw:v1:home:4x5','[0,2,2,-1,99,"4"]');show();expect(screen.getByLabelText('Picture puzzle progress')).toHaveTextContent('1 / 14');
 });
 it('retains the lesson DOM and announces a break when switching into the picture',()=>{
  const pause=vi.fn();window.addEventListener('sodafom:picture-puzzle-open',pause);
  render(<MemoryRouter initialEntries={['/lesson']}><PagePictureFrame><label>Lesson answer<input defaultValue="saved word"/></label></PagePictureFrame></MemoryRouter>);
  const answer=screen.getByLabelText('Lesson answer');fireEvent.change(answer,{target:{value:'new answer'}});fireEvent.click(screen.getByRole('button',{name:'Play this page as a jigsaw'}));expect(pause).toHaveBeenCalledOnce();
  expect(answer).toBeInTheDocument();expect(answer).not.toBeVisible();fireEvent.click(screen.getByRole('button',{name:'Back to learning'}));expect(answer).toBeVisible();expect(answer).toHaveValue('new answer');window.removeEventListener('sodafom:picture-puzzle-open',pause);
 });
});
