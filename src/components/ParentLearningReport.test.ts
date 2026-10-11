import { beforeEach, expect, it } from 'vitest';
import { currentProgressProfile, scopedGameStarsKey } from '@/lib/archie/storage';
import { learnerProfileLabel, readRecordedGameStars } from './ParentLearningReport';
beforeEach(()=>localStorage.clear());
it('reports stored stars accurately and ignores invalid scores instead of inventing school marks',()=>{
 localStorage.setItem(scopedGameStarsKey(currentProgressProfile()),JSON.stringify({'game-archie-adventure-trail':2,'game-legacy':0,'game-invalid':9,'game-text':'3','game-decimal':1.5}));
 const records=readRecordedGameStars('current');
 expect(records).toHaveLength(2);
 expect(records.find(record=>record.id==='game-archie-adventure-trail')).toMatchObject({title:'Archie’s Adventure Trail',subject:'maths',stars:2,route:'/games/archie-adventure-trail'});
 expect(records.find(record=>record.id==='game-legacy')).toMatchObject({subject:'Unclassified game',stars:0});
});
it('handles corrupt and unexpected saved score records safely',()=>{
 localStorage.setItem('sodafom_game_stars','oops');expect(readRecordedGameStars('legacy')).toEqual([]);
 localStorage.setItem('sodafom_game_stars','[3,2]');expect(readRecordedGameStars('legacy')).toEqual([]);
});
it('labels the selected profile without claiming shared device results belong to that learner',()=>{
 expect(learnerProfileLabel('Mia',2)).toBe('Learner profile: Mia · selected lesson year 2');
 expect(learnerProfileLabel('local learner',4)).toBe('Learner profile: local learner · selected lesson year 4');
});
it('keeps current learner scores separate from older shared scores',()=>{
 localStorage.setItem('sodafom_active_child',JSON.stringify({id:7,name:'Mia'}));
 localStorage.setItem(scopedGameStarsKey(currentProgressProfile()),JSON.stringify({'game-counting':3}));
 localStorage.setItem('sodafom_game_stars',JSON.stringify({'game-spelling-bee':2}));
 expect(readRecordedGameStars('current').map(game=>game.id)).toEqual(['game-counting']);
 expect(readRecordedGameStars('legacy').map(game=>game.id)).toEqual(['game-spelling-bee']);
});
