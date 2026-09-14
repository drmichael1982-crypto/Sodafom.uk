import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Maximize, Pause, Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { initialPlayback, LITTLE_JOKES, makeJokeBag, playbackReducer } from './playback';
import { LIBRARY_ART, pageDurationMs, type CinemaStory } from './stories';

export function StoryArtwork({ story, className = '' }: { story: CinemaStory; className?: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? <div className={`cinema-art-fallback ${className}`} role="img" aria-label={`Illustration unavailable for ${story.title}`}>
    <BookOpen size={64} aria-hidden="true" /><span>The story is ready below.</span>
  </div> : <img className={className} src={story.image || LIBRARY_ART}
    alt={story.image ? `${story.title} cover illustration` : 'Archie’s illustrated library shelf'}
    onError={() => setFailed(true)} />;
}

export default function StoryPlayer({ story, mode, onClose }: {
  story: CinemaStory; mode: 'cinema' | 'book'; onClose: () => void;
}) {
  const [state, dispatch] = useReducer(playbackReducer, initialPlayback);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [notice, setNotice] = useState('');
  const [jokeIndex, setJokeIndex] = useState<number | null>(null);
  const jokeBag = useRef<number[]>([]);
  const lastJoke = useRef<number | null>(null);
  const spoken = useRef<SpeechSynthesisUtterance | null>(null);
  const playerRef = useRef<HTMLElement>(null);
  const text = story.pages[state.page];
  const durationMs = pageDurationMs(text);
  const unit = mode === 'book' ? 'Page' : 'Scene';

  const stopReading = useCallback(() => {
    if (spoken.current) {
      spoken.current.onend = null;
      spoken.current.onerror = null;
      spoken.current = null;
      window.speechSynthesis?.cancel();
    }
    setSpeaking(false);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const syncPreference = () => {
      setReducedMotion(Boolean(preference?.matches));
      if (preference?.matches) dispatch({ type: 'pause' });
    };
    syncPreference();
    preference?.addEventListener?.('change', syncPreference);
    setSpeechAvailable('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
    const onVisibility = () => {
      if (document.hidden) {
        dispatch({ type: 'pause' });
        stopReading();
        setNotice('Paused while you were away. Press Play when you are ready.');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      preference?.removeEventListener?.('change', syncPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      stopReading();
    };
  }, [stopReading]);

  useEffect(() => {
    if (!state.playing) return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      if (document.hidden) { dispatch({ type: 'pause' }); return; }
      const now = performance.now();
      dispatch({ type: 'tick', deltaMs: Math.min(1_000, now - previous), durationMs, count: story.pages.length });
      previous = now;
    }, 200);
    return () => window.clearInterval(timer);
  }, [state.playing, state.page, durationMs, story.pages.length]);

  useEffect(() => { stopReading(); }, [state.page, stopReading]);

  const turnPage = (next: number) => {
    stopReading();
    setNotice('');
    dispatch({ type: 'page', page: next, count: story.pages.length });
  };
  const togglePlay = () => {
    stopReading();
    setNotice('');
    dispatch({ type: 'toggle' });
  };
  const restart = () => {
    stopReading();
    setNotice('Back to the beginning. Press Play or turn the pages yourself.');
    dispatch({ type: 'restart' });
  };
  const readPage = () => {
    if (speaking) { stopReading(); return; }
    if (!speechAvailable) return;
    dispatch({ type: 'pause' });
    stopReading();
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB';
      utterance.rate = .85;
      utterance.onend = () => { spoken.current = null; setSpeaking(false); };
      utterance.onerror = () => {
        spoken.current = null;
        setSpeaking(false);
        setNotice('Read aloud is unavailable just now. You can still read every page.');
      };
      spoken.current = utterance;
      setSpeaking(true);
      setNotice('Reading this page. Press Play afterwards to continue the story.');
      window.speechSynthesis.speak(utterance);
    } catch {
      stopReading();
      setNotice('Read aloud is unavailable just now. You can still read every page.');
    }
  };
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (playerRef.current?.requestFullscreen) await playerRef.current.requestFullscreen();
      else setNotice('Full screen is unavailable here. The story still fits this screen.');
    } catch { setNotice('Full screen is unavailable here. The story still fits this screen.'); }
  };
  const surprise = () => {
    if (!jokeBag.current.length) jokeBag.current = makeJokeBag(lastJoke.current);
    lastJoke.current = jokeBag.current.shift()!;
    setJokeIndex(lastJoke.current);
  };
  const endingVisible = state.ended || (!state.playing && state.page === story.pages.length - 1);
  const progress = endingVisible ? 100 : (state.page + state.elapsedMs / durationMs) / story.pages.length * 100;

  return <section ref={playerRef} className={`cinema-player cinema-player--${mode}`} aria-label={`${story.title} story player`}
    onKeyDown={event => {
      // Buttons and inputs retain their native Space/arrow behaviour.
      if (event.target instanceof HTMLElement && event.target.closest('button, a, input, select, textarea')) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); turnPage(Math.min(story.pages.length - 1, state.page + 1)); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); turnPage(Math.max(0, state.page - 1)); }
      if (event.key === ' ') { event.preventDefault(); togglePlay(); }
    }}>
    <div className="cinema-player-heading">
      <button className="cinema-button cinema-button--quiet" onClick={() => { stopReading(); onClose(); }}><ArrowLeft size={19} aria-hidden="true" /> Back to shelf</button>
      <span>{mode === 'book' ? 'ANIMATED STORYBOOK' : 'ARCHIE’S PICTURE CINEMA'}</span>
      <button className="cinema-button cinema-button--quiet" onClick={fullscreen} aria-label="Toggle full screen"><Maximize size={19} aria-hidden="true" /><span className="cinema-fullscreen-label">Full screen</span></button>
    </div>
    <div className="cinema-story-heading"><p>{story.strapline}</p><h1>{story.title}</h1></div>
    <div className="cinema-story-spread">
      <div className="cinema-stage" data-moving={state.playing && motionEnabled && !reducedMotion} tabIndex={0} aria-label="Story screen. Use left and right arrows to turn pages, or Space to play and pause.">
        <div key={state.page} className={`cinema-camera cinema-camera--${state.page % 3}`}>
          <StoryArtwork story={story} className="cinema-scene-art" />
        </div>
        <div className="cinema-stage-shade" aria-hidden="true" />
        <div className="cinema-scene-marker">{unit} {state.page + 1} / {story.pages.length}</div>
        <span className="cinema-stage-word" aria-hidden="true">{story.strapline}</span>
        <button className="cinema-surprise-button" aria-label="Find a little surprise" onClick={surprise}><Sparkles size={23} aria-hidden="true" /></button>
      </div>
      <div className="cinema-caption-panel">
        <p className="cinema-eyebrow">{unit} {state.page + 1} of {story.pages.length}</p>
        <p className="cinema-caption" aria-live="polite" aria-atomic="true">{text}</p>
        {endingVisible && <div className="cinema-ending" role="status"><BookOpen size={24} aria-hidden="true" /><strong>The end. Thank you for joining Archie!</strong><p>Watch again, or choose another adventure.</p></div>}
        {!story.image && <p className="cinema-art-note">An adventure from Archie’s library.</p>}
      </div>
    </div>
    <div className="cinema-controls">
      <progress className="cinema-progress" max={100} value={progress} aria-label="Story progress" />
      <div className="cinema-control-row">
        <button className="cinema-button" disabled={state.page === 0} onClick={() => turnPage(state.page - 1)} aria-label={`Previous ${unit.toLowerCase()}`}><ChevronLeft size={22} aria-hidden="true" />Back</button>
        <button className="cinema-button cinema-button--primary" onClick={togglePlay}>
          {state.playing ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
          {state.ended ? 'Play again' : state.playing ? 'Pause' : 'Play story'}
        </button>
        <button className="cinema-button" disabled={state.page === story.pages.length - 1} onClick={() => turnPage(state.page + 1)} aria-label={`Next ${unit.toLowerCase()}`}>Next<ChevronRight size={22} aria-hidden="true" /></button>
        <button className="cinema-button cinema-button--quiet" onClick={restart}><RotateCcw size={19} aria-hidden="true" />Restart</button>
        {speechAvailable && <button className="cinema-button cinema-button--quiet" onClick={readPage} aria-pressed={speaking}>
          {speaking ? <VolumeX size={19} aria-hidden="true" /> : <Volume2 size={19} aria-hidden="true" />}{speaking ? 'Stop reading' : 'Read this page'}
        </button>}
      </div>
      <div className="cinema-options"><label><input type="checkbox" checked={motionEnabled && !reducedMotion} disabled={reducedMotion} onChange={event => setMotionEnabled(event.target.checked)} /> Gentle picture motion</label><span>{reducedMotion ? 'Reduced motion is on.' : 'Pictures move only while playing.'} {speechAvailable ? 'Sound is off until you choose Read this page.' : 'Read at your own pace, with no sound needed.'}</span></div>
      {notice && <p className="cinema-notice" role="status">{notice}</p>}
      {jokeIndex !== null && <aside className="cinema-joke" aria-label="Little surprise"><p aria-live="polite">{LITTLE_JOKES[jokeIndex]}</p><button className="cinema-button cinema-button--quiet" onClick={surprise}>Another giggle</button><button className="cinema-button cinema-button--quiet" onClick={() => setJokeIndex(null)}>Close surprise</button></aside>}
    </div>
  </section>;
}
