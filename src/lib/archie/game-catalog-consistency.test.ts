import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import catalog from './game-catalog.json';
it('every menu entry uses the same age ranges as its game',()=>{for(const game of catalog){const source=readFileSync(`${process.cwd()}/src/pages/games/${game.slug}.tsx`,'utf8');const match=source.match(/ageGroups\s*(?:=\s*\{\s*|:\s*)\[([^\]]+)\]/);expect(match,game.slug).toBeTruthy();const ages=[...match![1].matchAll(/['"](\d+[–-]\d+)['"]/g)].map(m=>m[1]);expect(game.ageGroups,game.slug).toEqual(ages);}});
