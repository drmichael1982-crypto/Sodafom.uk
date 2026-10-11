import { Link } from 'react-router';
import { readLegacyGameStars, readScopedGameStars, useArchieData } from '@/lib/archie/storage';
import catalog from '@/lib/archie/game-catalog.json';

type RecordedGame = { id: string; title: string; subject: string; stars: number; route?: string };

export function readRecordedGameStars(scope: 'current' | 'legacy' = 'current'): RecordedGame[] {
  const raw = scope === 'legacy' ? readLegacyGameStars() : readScopedGameStars();
  return Object.entries(raw).map(([id, stars]) => {
    const game = catalog.find(item => item.id === id);
    return {
      id,
      title: game?.title ?? id.replace(/^game-/, '').replace(/-/g, ' '),
      subject: game?.subject ?? 'Unclassified game',
      stars,
      route: game?.route,
    };
  }).sort((a, b) => a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title));
}

export function learnerProfileLabel(name: string, year: number): string {
  return `Learner profile: ${name} · selected lesson year ${year}`;
}

export default function ParentLearningReport() {
  const { settings, activities, legacyActivities, progressProfile } = useArchieData();
  const games = readRecordedGameStars('current');
  const legacyGames = readRecordedGameStars('legacy');
  const learnerName = progressProfile.source === 'active-child' ? progressProfile.name : settings.childNickname?.trim() || progressProfile.name;
  const hasLegacy = legacyGames.length > 0 || legacyActivities.length > 0;
  return <section className="a-panel" aria-labelledby="parent-learning-report-title">
    <h2 id="parent-learning-report-title">Practice for {learnerName} on this device</h2>
    <p>{learnerProfileLabel(learnerName, settings.year)}</p>
    <p><strong>Learner-scoped history:</strong> new game, book and lesson results are stored under this local learner profile. Switching to another selected child uses a different record.</p>
    <p>These are recorded practice results, not a school assessment or a certificate of National Curriculum completion. Stars describe game performance; they are not marks out of 100.</p>
    <div className="a-stats">
      <div><strong>{games.reduce((sum, game) => sum + game.stars, 0)}</strong><span>Best game stars</span></div>
      <div><strong>{activities.filter(activity => activity.kind === 'lesson').length}</strong><span>Lessons recorded</span></div>
      <div><strong>{activities.filter(activity => activity.kind === 'book').length}</strong><span>Books recorded</span></div>
    </div>
    <h3>Games by learning subject</h3>
    {games.length ? <div className="parent-score-table"><table><caption>Best result for each game in this learner profile</caption><thead><tr><th scope="col">Game</th><th scope="col">Subject</th><th scope="col">Best stars</th></tr></thead><tbody>{games.map(game => <tr key={game.id}><th scope="row">{game.route ? <Link to={game.route}>{game.title} — practise again</Link> : game.title}</th><td>{game.subject}</td><td>{game.stars} / 3</td></tr>)}</tbody></table></div> : <p>No game scores have been saved for this learner yet.</p>}
    <h3>Recent books and lessons</h3>
    {activities.length ? <ul>{activities.slice(-10).reverse().map(activity => <li key={activity.id}>{activity.title} · {activity.stars} {activity.stars === 1 ? 'star' : 'stars'} · {Number.isNaN(Date.parse(activity.date)) ? 'Date unavailable' : new Date(activity.date).toLocaleDateString('en-GB')}</li>)}</ul> : <p>No books or lessons have been recorded for this learner yet.</p>}
    <Link className="a-button" to="/progress?from=parents">Open this learner’s progress</Link>
    {hasLegacy && <aside className="a-note" aria-label="Older shared device history">
      <h3>Older shared device history</h3>
      <p>{legacyGames.length} game {legacyGames.length === 1 ? 'record' : 'records'} and {legacyActivities.length} book/lesson {legacyActivities.length === 1 ? 'record was' : 'records were'} saved before learner profiles were separated. They have not been copied to {learnerName} or deleted.</p>
      <Link className="a-button" to="/progress?from=parents&scope=legacy">View older shared history</Link>
    </aside>}
    <p>Clearing browser data removes these local records.</p>
  </section>;
}
