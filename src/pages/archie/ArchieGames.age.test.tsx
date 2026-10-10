import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const callbacks=vi.hoisted(()=>({setGameContext:vi.fn(),clearGameContext:vi.fn(),openArchie:vi.fn(),stop:vi.fn()}));
vi.mock('@/contexts/ArchieContext',()=>({useArchieContext:()=>callbacks}));
vi.mock('@/lib/voice-context',()=>({useVoice:()=>({stop:callbacks.stop,playing:false})}));
vi.mock('@/lib/config',()=>({ARCHIE_PREVIEW:true,API_PREFIX:''}));
vi.mock('@/pages/CartoonTheatrePage',()=>({EPISODES:[]}));
vi.mock('@/components/SceneArtwork',()=>({default:()=>null,sceneForSubject:()=> 'maths',sceneArtworkPath:()=> '/assets/scenes/archie-jigsaw-maths-v2.webp'}));
vi.mock('@/components/OrbitHome',()=>({default:()=>null}));
import { ArchieGames } from './ArchiePages';
import { updateSavedData } from '@/lib/archie/storage';
import { useChildAge } from '@/hooks/useChildAge';

function DifficultyProbe(){
  const {ageGroup,tier}=useChildAge();
  return <span data-testid="game-difficulty">{ageGroup} · tier {tier}</span>;
}
const staleProfile={id:31,ageGroup:'11-13'};
const saveYear=(year:number)=>updateSavedData(data=>({...data,settings:{...data.settings,year}}));
const show=(path='/games')=>render(<MemoryRouter initialEntries={[path]}><ArchieGames/><DifficultyProbe/></MemoryRouter>);
const gameRoutes=(container:HTMLElement)=>Array.from(container.querySelectorAll<HTMLAnchorElement>('[data-game-link]')).map(link=>link.getAttribute('href'));
const chooseYear=(year:number)=>fireEvent.change(screen.getByRole('combobox',{name:'My learning year'}),{target:{value:String(year)}});
beforeEach(()=>{localStorage.clear();localStorage.setItem('sodafom_active_child',JSON.stringify(staleProfile));});
afterEach(()=>{cleanup();vi.clearAllMocks();});

describe('selected-year game discovery and difficulty',()=>{
  it.each([
    {path:'/games?age=5-7',year:2,group:'5-7'},
    {path:'/games?age=8-10',year:5,group:'8-10'},
    {path:'/games?age=11-13',year:8,group:'11-13'},
  ])('opens footer age link $path in its matching middle school year',({path,year,group})=>{
    saveYear(9);show(path);
    expect(screen.getByRole('combobox',{name:'My learning year'})).toHaveValue(String(year));
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent(group);
    expect(JSON.parse(localStorage.getItem('sodafom_archie_design_v1')!).settings.year).toBe(year);
  });
  it.each([
    {year:3,group:'5-7',tier:1,count:109,present:'/games/crossword',absent:['/games/algebra-quest']},
    {year:6,group:'8-10',tier:2,count:119,present:'/games/algebra-quest',absent:['/games/phonics-parrot']},
    {year:9,group:'11-13',tier:3,count:86,present:'/games/algebra-quest',absent:['/games/phonics-parrot','/games/number-bonds']},
  ])('Year $year shows its eligible catalogue and matching game tier despite an old profile',({year,group,tier,count,present,absent})=>{
    saveYear(year);const view=show();const routes=gameRoutes(view.container);
    expect(screen.getByRole('combobox',{name:'My learning year'})).toHaveValue(String(year));
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent(`${group} · tier ${tier}`);
    expect(routes).toHaveLength(count);expect(routes).toContain(present);
    for(const route of absent)expect(routes).not.toContain(route);
    expect(JSON.parse(localStorage.getItem('sodafom_active_child')!)).toEqual(staleProfile);
    expect(screen.queryByRole('button',{name:'Browse all ages'})).not.toBeInTheDocument();
  });
  it('the actual school-year selector changes games and difficulty at both group boundaries and persists the chosen year',()=>{
    saveYear(3);const view=show();
    expect(gameRoutes(view.container)).toContain('/games/number-pop');
    chooseYear(4);
    expect(gameRoutes(view.container)).not.toContain('/games/phonics-parrot');
    expect(gameRoutes(view.container)).toContain('/games/spelling-bee');
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent('8-10 · tier 2');
    chooseYear(6);expect(gameRoutes(view.container)).toContain('/games/algebra-quest');
    chooseYear(7);
    expect(gameRoutes(view.container)).toContain('/games/algebra-quest');
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent('11-13 · tier 3');
    chooseYear(9);expect(gameRoutes(view.container)).toHaveLength(86);
    expect(JSON.parse(localStorage.getItem('sodafom_archie_design_v1')!).settings.year).toBe(9);
    view.unmount();show();
    expect(screen.getByRole('combobox',{name:'My learning year'})).toHaveValue('9');
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent('11-13 · tier 3');
    expect(JSON.parse(localStorage.getItem('sodafom_active_child')!)).toEqual(staleProfile);
  });
  it('subject, search and empty-search reset keep the selected-year restriction',()=>{
    saveYear(3);const view=show('/games?subject=maths');
    expect(gameRoutes(view.container)).toContain('/games/number-pop');
    expect(gameRoutes(view.container)).not.toContain('/games/spelling-bee');
    fireEvent.change(screen.getByRole('searchbox',{name:'Search games'}),{target:{value:'Algebra Quest'}});
    expect(gameRoutes(view.container)).toHaveLength(0);
    fireEvent.click(screen.getByRole('button',{name:'Show all games'}));
    expect(screen.getByRole('searchbox',{name:'Search games'})).toHaveValue('');
    expect(gameRoutes(view.container)).toHaveLength(109);
    expect(gameRoutes(view.container)).not.toContain('/games/algebra-quest');
    chooseYear(9);
    fireEvent.click(screen.getByRole('button',{name:'Maths'}));
    fireEvent.change(screen.getByRole('searchbox',{name:'Search games'}),{target:{value:'Algebra Quest'}});
    expect(gameRoutes(view.container)).toEqual(['/games/algebra-quest']);
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent('11-13 · tier 3');
  });
});
