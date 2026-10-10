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
import catalog from '@/lib/archie/game-catalog.json';
import { isGameForYear } from '@/lib/archie/game-age';
import { useChildAge } from '@/hooks/useChildAge';

function DifficultyProbe(){
  const {ageGroup,tier}=useChildAge();
  return <span data-testid="game-difficulty">{ageGroup} · tier {tier}</span>;
}
const staleProfile={id:31,ageGroup:'11-13'};
const saveYear=(year:number)=>updateSavedData(data=>({...data,settings:{...data.settings,year}}));
const show=(path='/games')=>render(<MemoryRouter initialEntries={[path]}><ArchieGames/><DifficultyProbe/></MemoryRouter>);
const gameRoutes=(container:HTMLElement)=>Array.from(container.querySelectorAll<HTMLAnchorElement>('[data-game-link]')).map(link=>link.getAttribute('href'));
const eligibleRoutes=(year:number)=>catalog.filter(game=>isGameForYear(year,game.ageGroups)).map(game=>game.route);
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
    {year:3,group:'5-7',tier:1},
    {year:6,group:'8-10',tier:2},
    {year:9,group:'11-13',tier:3},
  ])('Year $year shows its eligible catalogue and matching game tier despite an old profile',({year,group,tier})=>{
    saveYear(year);const view=show();const routes=gameRoutes(view.container);
    expect(screen.getByRole('combobox',{name:'My learning year'})).toHaveValue(String(year));
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent(`${group} · tier ${tier}`);
    expect(routes).toEqual(eligibleRoutes(year));
    expect(JSON.parse(localStorage.getItem('sodafom_active_child')!)).toEqual(staleProfile);
    expect(screen.queryByRole('button',{name:'Browse all ages'})).not.toBeInTheDocument();
  });
  it('the actual school-year selector changes games and difficulty at both group boundaries and persists the chosen year',()=>{
    saveYear(3);const view=show();
    expect(gameRoutes(view.container)).toContain('/games/phonics-parrot');
    chooseYear(4);
    expect(gameRoutes(view.container)).not.toContain('/games/phonics-parrot');
    expect(gameRoutes(view.container)).toContain('/games/punctuation-patrol');
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent('8-10 · tier 2');
    chooseYear(6);expect(gameRoutes(view.container)).toContain('/games/algebra-quest');
    chooseYear(7);
    expect(gameRoutes(view.container)).toContain('/games/algebra-quest');
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent('11-13 · tier 3');
    chooseYear(9);expect(gameRoutes(view.container)).toEqual(eligibleRoutes(9));
    expect(JSON.parse(localStorage.getItem('sodafom_archie_design_v1')!).settings.year).toBe(9);
    view.unmount();show();
    expect(screen.getByRole('combobox',{name:'My learning year'})).toHaveValue('9');
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent('11-13 · tier 3');
    expect(JSON.parse(localStorage.getItem('sodafom_active_child')!)).toEqual(staleProfile);
  });
  it('does not advertise age 14 in the Year 9 selector',()=>{
    saveYear(9);show();
    expect(screen.getByRole('option',{name:'Year 9 · age 13 · optional extension'})).toBeInTheDocument();
    expect(screen.queryByRole('option',{name:/Year 9.*14/})).not.toBeInTheDocument();
  });
  it('subject, search and empty-search reset keep the selected-year restriction',()=>{
    saveYear(3);const view=show('/games?subject=maths');
    expect(gameRoutes(view.container)).toContain('/games/number-pop');
    expect(gameRoutes(view.container)).not.toContain('/games/spelling-bee');
    fireEvent.change(screen.getByRole('searchbox',{name:'Search games'}),{target:{value:'Algebra Quest'}});
    expect(gameRoutes(view.container)).toHaveLength(0);
    expect(screen.getByText('No games match those filters for Year 3. Try a shorter search or choose another subject.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Show Year 3 games'}));
    expect(screen.getByRole('searchbox',{name:'Search games'})).toHaveValue('');
    expect(screen.getByRole('searchbox',{name:'Search games'})).toHaveFocus();
    expect(screen.getByRole('combobox',{name:'My learning year'})).toHaveValue('3');
    expect(gameRoutes(view.container)).toEqual(eligibleRoutes(3));
    expect(gameRoutes(view.container)).not.toContain('/games/algebra-quest');
    chooseYear(9);
    fireEvent.click(screen.getByRole('button',{name:'Maths'}));
    fireEvent.change(screen.getByRole('searchbox',{name:'Search games'}),{target:{value:'Algebra Quest'}});
    expect(gameRoutes(view.container)).toEqual(['/games/algebra-quest']);
    expect(screen.getByTestId('game-difficulty')).toHaveTextContent('11-13 · tier 3');
  });
  it.each([1,2,3,4,5,6,7,8,9])('Year %i empty filters recover to that year without changing a saved profile',year=>{
    saveYear(year);const view=show('/games?subject=spelling');
    fireEvent.change(screen.getByRole('searchbox',{name:'Search games'}),{target:{value:'no such game'}});
    expect(gameRoutes(view.container)).toHaveLength(0);
    fireEvent.click(screen.getByRole('button',{name:`Show Year ${year} games`}));
    expect(screen.getByRole('searchbox',{name:'Search games'})).toHaveValue('');
    expect(screen.getByRole('searchbox',{name:'Search games'})).toHaveFocus();
    expect(screen.getByRole('button',{name:'All games'})).toHaveAttribute('aria-pressed','true');
    expect(gameRoutes(view.container)).toEqual(eligibleRoutes(year));
    expect(JSON.parse(localStorage.getItem('sodafom_archie_design_v1')!).settings.year).toBe(year);
    expect(JSON.parse(localStorage.getItem('sodafom_active_child')!)).toEqual(staleProfile);
  });
  it('offers a game when either learner age in the school year matches its entry range',()=>{
    saveYear(3);const view=show();
    for(const route of ['/games/angle-explorer','/games/area-adventure','/games/data-detective'])expect(gameRoutes(view.container)).not.toContain(route);
    chooseYear(4);
    for(const route of ['/games/angle-explorer','/games/area-adventure','/games/data-detective'])expect(gameRoutes(view.container)).toContain(route);
    chooseYear(6);expect(gameRoutes(view.container)).toContain('/games/place-value');
    chooseYear(7);expect(gameRoutes(view.container)).not.toContain('/games/place-value');
  });
});
