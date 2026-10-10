import { beforeEach, expect, it } from 'vitest';
import { readRecordedGameStars, sharedDeviceProfileLabel } from './ParentLearningReport';
beforeEach(()=>localStorage.clear());
it('reports stored stars accurately and ignores invalid scores instead of inventing school marks',()=>{
 localStorage.setItem('sodafom_game_stars',JSON.stringify({'game-archie-adventure-trail':2,'game-legacy':0,'game-invalid':9,'game-text':'3','game-decimal':1.5}));
 const records=readRecordedGameStars();
 expect(records).toHaveLength(2);
 expect(records.find(record=>record.id==='game-archie-adventure-trail')).toMatchObject({title:'Archie’s Adventure Trail',subject:'maths',stars:2,route:'/games/archie-adventure-trail'});
 expect(records.find(record=>record.id==='game-legacy')).toMatchObject({subject:'Unclassified game',stars:0});
});
it('handles corrupt and unexpected saved score records safely',()=>{
 localStorage.setItem('sodafom_game_stars','oops');expect(readRecordedGameStars()).toEqual([]);
 localStorage.setItem('sodafom_game_stars','[3,2]');expect(readRecordedGameStars()).toEqual([]);
});
it('labels the selected profile without claiming shared device results belong to that learner',()=>{
 expect(sharedDeviceProfileLabel(' Mia ',2)).toBe('Current profile: Mia · selected lesson year 2');
 expect(sharedDeviceProfileLabel('',4)).toBe('Current profile: no nickname · selected lesson year 4');
});
