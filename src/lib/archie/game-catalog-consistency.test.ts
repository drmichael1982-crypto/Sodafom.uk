import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import catalog from './game-catalog.json';

const displayContent=JSON.parse(readFileSync(`${process.cwd()}/src/content/pages/games.json`,'utf8')) as {
  games:Array<{slug:string;ageGroups:string[]}>;
};

describe('game catalogues',()=>{
  it('every canonical entry uses the same age ranges as its game',()=>{for(const game of catalog){const source=readFileSync(`${process.cwd()}/src/pages/games/${game.slug}.tsx`,'utf8');const match=source.match(/ageGroups\s*(?:=\s*\{\s*|:\s*)\[([^\]]+)\]/);expect(match,game.slug).toBeTruthy();const ages=[...match![1].matchAll(/['"](\d+[–-]\d+)['"]/g)].map(m=>m[1]);expect(game.ageGroups,game.slug).toEqual(ages);}});

  it('keeps every routed game and its age ranges in the displayed catalogue',()=>{
    const displayedBySlug=new Map(displayContent.games.map(game=>[game.slug,game]));
    expect([...displayedBySlug.keys()].sort()).toEqual(catalog.map(game=>game.slug).sort());
    for(const game of catalog) expect(displayedBySlug.get(game.slug)?.ageGroups,game.slug).toEqual(game.ageGroups);
  });
});
