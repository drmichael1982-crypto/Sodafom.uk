import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './completion-scene.css';

/** A completion reward; never mounted for an incorrect or partial answer. */
export default function CompletionScene({ kind, onClose }: { kind: 'words' | 'maths' | 'science' | 'art'; onClose: () => void }) {
  const title=kind==='words'?'Your word world is alive!':kind==='maths'?'Your rocket is ready!':kind==='science'?'Your discovery is alive!':'Your colours are dancing!';
  const message=kind==='words'?'You built the words. Now explore Archie’s moving world!':kind==='maths'?'You solved the maths. Watch your rocket launch!':kind==='science'?'You completed your discovery. Watch your science world move!':'You completed your art. Watch the colours dance!';
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  const root = useRef<HTMLElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if(!query)return;
    const update = () => setReduced(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const buttons = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); if (previous?.isConnected) previous.focus(); else document.querySelector<HTMLElement>('[data-reward-return]')?.focus(); };
  }, [onClose]);
  return createPortal(<section ref={root} className={`completion-scene scene-${kind} ${paused || reduced ? 'scene-paused' : ''}`} role="dialog" aria-modal="true" aria-labelledby="moving-scene-title">
    <header><div><span>Puzzle complete!</span><h1 id="moving-scene-title">{title}</h1></div><button ref={close} type="button" onClick={onClose}>Back to puzzle</button></header>
    <div className="completion-scene-art" aria-hidden="true"><div className="reward-sparkles">✦ · ★ · ✦ · ★</div>{kind === 'maths' ? <div className="reward-rocket">🚀</div> : kind==='science'?<div className="reward-atom">⚛</div>:kind==='art'?<div className="reward-colours">🎨 🌈</div>:<><div className="reward-butterfly butterfly-one">🦋</div><div className="reward-butterfly butterfly-two">🦋</div><div className="reward-balloon">🎈</div></>}</div>
    <footer><p>{message}</p><button type="button" disabled={reduced} aria-pressed={paused || reduced} onClick={() => setPaused(value => !value)}>{reduced ? 'Still scene' : paused ? 'Resume scene' : 'Pause scene'}</button>{reduced && <small>Your motion setting keeps this reward still.</small>}</footer>
  </section>, document.body);
}
