import { Link } from 'react-router';
import { useArchieData } from '@/lib/archie/storage';
import catalog from '@/lib/archie/game-catalog.json';
export function readRecordedGameStars(): { id: string; title: string; subject: string; stars: number }[] {
  try {
    const raw=JSON.parse(localStorage.getItem('sodafom_game_stars')||'{}');
    if(!raw||typeof raw!=='object'||Array.isArray(raw))return [];
    return Object.entries(raw).flatMap(([id,stars])=>{
      if(typeof stars!=='number'||!Number.isInteger(stars)||stars<0||stars>3)return [];
      const game=catalog.find(game=>game.id===id);
      return [{id,title:game?.title ?? id.replace(/^game-/,'').replace(/-/g,' '),subject:game?.subject ?? 'Unclassified game',stars}];
    }).sort((a,b)=>a.subject.localeCompare(b.subject)||a.title.localeCompare(b.title));
  } catch{return [];}
}
export default function ParentLearningReport(){
 const {settings,activities}=useArchieData();const games=readRecordedGameStars();
 return <section className="a-panel" aria-labelledby="parent-learning-report-title"><h2 id="parent-learning-report-title">Learning record on this device</h2><p>{settings.childNickname?`${settings.childNickname}’s saved practice`:'Saved practice'} · lesson year {settings.year}</p><p>These are recorded practice results, not a school assessment or a certificate of National Curriculum completion. Stars describe game performance; they are not marks out of 100.</p><div className="a-stats"><div><strong>{games.reduce((sum,game)=>sum+game.stars,0)}</strong><span>Best game stars saved</span></div><div><strong>{activities.filter(activity=>activity.kind==='lesson').length}</strong><span>Lessons recorded</span></div><div><strong>{activities.filter(activity=>activity.kind==='book').length}</strong><span>Books recorded</span></div></div><h3>Games by learning subject</h3>{games.length?<div className="parent-score-table"><table><caption>Best recorded result for each game</caption><thead><tr><th scope="col">Game</th><th scope="col">Subject</th><th scope="col">Best stars</th></tr></thead><tbody>{games.map(game=><tr key={game.id}><th scope="row">{game.title}</th><td>{game.subject}</td><td>{game.stars} / 3</td></tr>)}</tbody></table></div>:<p>No game scores have been saved yet. Completing a scored game adds its result here.</p>}<h3>Recent books and lessons</h3>{activities.length?<ul>{activities.slice(-10).reverse().map(activity=><li key={activity.id}>{activity.title} · {activity.stars} {activity.stars===1?'star':'stars'} · {Number.isNaN(Date.parse(activity.date))?'Date unavailable':new Date(activity.date).toLocaleDateString('en-GB')}</li>)}</ul>:<p>No books or lessons have been recorded yet.</p>}<p>Records belong to this browser’s practice profile. Clearing browser data removes them; using the same device for several children mixes their records.</p><Link className="a-button" to="/progress">Open detailed progress</Link></section>;
}
