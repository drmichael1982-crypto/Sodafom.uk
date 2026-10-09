import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import catalog from '@/lib/archie/game-catalog.json';

const subjectLabels: Record<string, string> = { maths: 'Maths', spelling: 'Spelling', reading: 'Reading', stories: 'Stories', science: 'Science', art: 'Art' };

export default function AdminGameCatalog() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const games = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return catalog.filter(game => (subject === 'all' || game.subject === subject) &&
      (!query || `${game.title} ${game.description} ${game.subject}`.toLocaleLowerCase().includes(query)));
  }, [search, subject]);
  return <section className="admin-game-section" aria-labelledby="admin-games-heading">
    <h2 id="admin-games-heading">Game catalog</h2>
    <p>Open any listed game from your phone. “Available in catalog” means it has an app route; it is not a live test or a quality rating.</p>
    <div className="admin-game-filters"><div><label htmlFor="admin-game-search">Search games</label><input id="admin-game-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Title, topic or skill" /></div><div><label htmlFor="admin-game-subject">Filter by subject</label><select id="admin-game-subject" value={subject} onChange={event => setSubject(event.target.value)}><option value="all">All subjects</option>{Object.entries(subjectLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>
    <p role="status" className="payment-help">Showing {games.length} of {catalog.length} games.</p>
    {games.length ? <ul className="admin-game-grid">{games.map(game => <li key={game.id}>
      <span className="admin-game-status">Available in catalog</span><h3><span aria-hidden="true">{game.emoji} </span>{game.title}</h3><p className="admin-game-meta">{subjectLabels[game.subject] || game.subject} · Catalog ages {game.ageGroups.join(', ')}</p><p>{game.description}</p><Link to={game.route} aria-label={`Open ${game.title}`}>Open game →</Link>
    </li>)}</ul> : <p>No games match these filters. Try another title or subject.</p>}
  </section>;
}
