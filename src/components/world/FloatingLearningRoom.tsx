import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { ROOM_SKINS, createSurpriseBag, isRoomSkin, resolveRoomAction, type RoomSkin } from './floating/room-config';
import type { RoomController } from './floating/create-scene';
import './floating/floating-room.css';

export default function FloatingLearningRoom() {
  const navigate = useNavigate();
  const uid = useId();
  const [skin, setSkin] = useState<RoomSkin>('planets');
  const skinRef = useRef(skin); skinRef.current = skin;
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<RoomController | null>(null);
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(playing); playingRef.current = playing;
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(speed); speedRef.current = speed;
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState('Choose an object in the room, or use its matching activity button below.');
  const surprise = useRef(createSurpriseBag());
  const definition = ROOM_SKINS[skin];

  const activate = useCallback((id: string) => {
    const action = resolveRoomAction(skinRef.current, id);
    if (!action) return;
    if (action.kind === 'route') navigate(`${action.href}?returnTo=${encodeURIComponent('/world/floating')}`);
    else setMessage(action.text);
  }, [navigate]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(media.matches); setPlaying(!media.matches);
    const changed = () => { setReduced(media.matches); if (media.matches) setPlaying(false); };
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);

  useEffect(() => {
    if (!host.current || failed) return;
    let cancelled = false;
    let scene: RoomController | undefined;
    const element = host.current;
    setReady(false);
    // The WebGL code loads only for this room, with no network textures or assets.
    import('./floating/create-scene').then(({ createFloatingScene }) => {
      if (cancelled) return;
      scene = createFloatingScene(element, skin, id => { if (!cancelled) activate(id); }, () => { if (!cancelled) setFailed(true); });
      if (cancelled) { scene.dispose(); return; }
      controller.current = scene; scene.setSpeed(speedRef.current); scene.setPlaying(playingRef.current); setReady(true);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; scene?.dispose(); if (controller.current === scene) controller.current = null; };
  }, [skin, failed, activate]);

  useEffect(() => { controller.current?.setPlaying(playing); }, [playing]);
  useEffect(() => { controller.current?.setSpeed(speed); }, [speed]);

  function changeSkin(value: unknown) {
    if (!isRoomSkin(value) || value === skin) return;
    setSkin(value); setFailed(false); setReady(false);
    setMessage('Choose an object in the room, or use its matching activity button below.');
  }

  return <main className="floating-room" data-skin={skin}>
    <header className="floating-room__header">
      <a href="/cartoon-mode" className="floating-room__back">← Back to adventure</a>
      <p className="floating-room__eyebrow">Sodafom · Rooms of wonder</p>
      <h1>{definition.title}</h1><p>{definition.subtitle}</p>
    </header>
    <div className="floating-room__toolbar">
      <label htmlFor={`${uid}-skin`}>Room</label>
      <select id={`${uid}-skin`} value={skin} onChange={event => changeSkin(event.target.value)}>
        <option value="planets">Planets</option><option value="colouring">Colouring books</option><option value="geography">Geography & aircraft</option>
      </select>
      <button type="button" onClick={() => setPlaying(value => !value)} disabled={failed}>{playing ? 'Pause motion' : 'Play motion'}</button>
      <label htmlFor={`${uid}-speed`}>Speed</label>
      <select id={`${uid}-speed`} value={speed} onChange={event => { const value = Number(event.target.value); if ([.5, 1, 2].includes(value)) setSpeed(value); }} disabled={failed}>
        <option value="0.5">Gentle · ½×</option><option value="1">Normal · 1×</option><option value="2">Faster · 2×</option>
      </select>
    </div>
    {reduced && <p className="floating-room__hint">Motion starts paused for your reduced-motion setting. You can choose Play.</p>}
    <section className="floating-room__viewport" aria-label="Interactive three-dimensional room">
      <div ref={host} className="floating-room__canvas" aria-hidden={failed || undefined} />
      {!ready && !failed && <p className="floating-room__loading" role="status">Opening your room… Activity buttons are ready below.</p>}
      {failed && <div className="floating-room__fallback" role="status"><span aria-hidden="true">✦</span><h2>Your activities are ready</h2><p>The 3D view is unavailable on this device. All activity buttons below still work.</p><a href="/world/planets">Open the animated planet diagram</a></div>}
      {ready && !failed && <span className="floating-room__drag-hint">Drag sideways to look around · Tap an object to explore</span>}
    </section>
    <div className="floating-room__view-controls" aria-label="Camera controls">
      <button type="button" disabled={!ready || failed} onClick={() => controller.current?.moveView('left')}>Look left</button>
      <button type="button" disabled={!ready || failed} onClick={() => controller.current?.moveView('right')}>Look right</button>
      <button type="button" disabled={!ready || failed} onClick={() => controller.current?.moveView('closer')}>Closer</button>
      <button type="button" disabled={!ready || failed} onClick={() => controller.current?.moveView('farther')}>Farther</button>
      <button type="button" disabled={!ready || failed} onClick={() => controller.current?.resetView()}>Reset view</button>
    </div>
    <section className="floating-room__activities" aria-labelledby={`${uid}-activities`}>
      <h2 id={`${uid}-activities`}>Choose your next adventure</h2>
      <div className="floating-room__hotspots">{definition.hotspots.map((hotspot, index) => <button type="button" key={hotspot.id} onClick={() => activate(hotspot.id)}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{hotspot.label}<span aria-hidden="true">→</span></button>)}</div>
    </section>
    <div className="floating-room__message"><p aria-live="polite" aria-atomic="true">{message}</p><button type="button" onClick={() => setMessage(surprise.current())}>A little surprise</button></div>
    <footer className="floating-room__notes">
      {skin === 'planets' ? <p>This 3D teaching room uses simplified circular orbits. Planet sizes, distances and speeds are not to scale. Earth spins west to east around an axis tilted 23.4° from the orbit’s normal; its axis keeps the same direction as it travels. Surface marks are decorative, not a map. The Sun’s rotation is simplified. <a href="/world/planets">Explore the clearer north-view diagram</a> or <a href="https://spaceplace.nasa.gov/seasons/en/">read NASA’s explanation of Earth’s tilt</a>.</p> : skin === 'geography' ? <p>The aircraft, islands and globe are playful models. This is an imaginary flight, not a real map or flight simulator. Choose an activity to explore real geography.</p> : <p>The floating book opens the working colouring activity. Colours and drawings here are room decorations; your colouring happens in the activity.</p>}
    </footer>
  </main>;
}
