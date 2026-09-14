import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Clapperboard, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import StoryPlayer, { StoryArtwork } from '@/components/cinema/StoryPlayer';
import { CINEMA_STORIES, ILLUSTRATED_SHORTS, storyDurationLabel, type CinemaStory } from '@/components/cinema/stories';
import '@/components/cinema/cinema.css';

function StoryShelf({ mode }: { mode: 'cinema' | 'book' }) {
  const [selected, setSelected] = useState<CinemaStory | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const lastOpened = useRef<string | null>(null);
  const isBook = mode === 'book';
  const stories = isBook ? CINEMA_STORIES : ILLUSTRATED_SHORTS;

  useEffect(() => {
    if (selected) heading.current?.focus();
    else if (lastOpened.current) document.getElementById(lastOpened.current)?.focus();
  }, [selected]);

  return <main className={`cinema-page ${isBook ? 'cinema-page--books' : ''}`}>
    {selected ? <div className="cinema-container">
      <h2 ref={heading} tabIndex={-1} className="sr-only">{selected.title}</h2>
      <StoryPlayer key={selected.id} story={selected} mode={mode} onClose={() => setSelected(null)} />
    </div> : <div className="cinema-container">
      <nav className="cinema-navigation" aria-label="Reading and cinema"><Link className="cinema-button cinema-button--quiet" to="/reading"><ArrowLeft size={19} aria-hidden="true" />Reading world</Link><Link className="cinema-button" to={isBook ? '/cinema' : '/books/animated'}>{isBook ? <Clapperboard size={20} aria-hidden="true" /> : <BookOpen size={20} aria-hidden="true" />}{isBook ? 'Picture cinema' : 'Animated books'}</Link></nav>
      <header className="cinema-shelf-header">
        <p className="cinema-eyebrow"><Sparkles size={16} aria-hidden="true" /> A LITTLE WONDER, A PAGE AT A TIME</p>
        <h1>{isBook ? 'Open a book.\nFind an adventure.' : 'A front-row seat\nfor little adventures.'}</h1>
        <p>{isBook ? 'Ten Archie stories to explore together. Turn each page yourself, or press Play and let the pictures gently move.' : 'Settle in with Archie and friends. Choose an illustrated story short, press Play, and follow the words on screen.'}</p>
        <div className="cinema-shelf-details"><span><BookOpen size={17} aria-hidden="true" />{isBook ? '10 complete stories' : '4 illustrated shorts'}</span><span>Words always on screen</span><span>Starts with sound off</span></div>
      </header>
      <section className="cinema-shelf" aria-label={isBook ? 'Choose an animated book' : 'Choose an illustrated short'}>
        {stories.map((story, index) => <button key={story.id} id={story.id} className="cinema-story-card" onClick={() => { lastOpened.current = story.id; setSelected(story); }} aria-label={`Open ${story.title}`}>
          <div className="cinema-card-picture"><StoryArtwork story={story} /><span className="cinema-card-number">{String(index + 1).padStart(2, '0')}</span><span className="cinema-card-play" aria-hidden="true">{isBook ? <BookOpen size={23} /> : <Play size={23} />}</span></div>
          <div className="cinema-card-copy"><p>{story.strapline}</p><h2>{story.title}</h2><div><span>{story.pages.length} {isBook ? 'pages' : 'scenes'}</span><span>{isBook ? 'Read together' : `${storyDurationLabel(story)} at normal pace`}</span></div></div>
        </button>)}
      </section>
      <footer className="cinema-shelf-footer"><BookOpen size={22} aria-hidden="true" /><p>Every adventure works without sound. Pause whenever you like. A little sparkle in the story screen has a giggle to share.</p></footer>
    </div>}
  </main>;
}

export default function CinemaPage() { return <StoryShelf mode="cinema" />; }
export function AnimatedBooksPage() { return <StoryShelf mode="book" />; }
