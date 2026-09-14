import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { SHOPS, getShop, isShopId, type ShopId } from '@/lib/world/shop-registry';
import { ACTIVITY_AGES, createSurpriseBag, learningUrl, shopFromSearch, STREET_ROUTE, SURPRISE_MESSAGES, type Surprise } from './victorian/journey';
import type { WorldScene } from './victorian/scene';
import './victorian/victorian.css';

type CameraAction = 'left' | 'right' | 'closer' | 'further' | 'reset';

function StreetCanvas({ shopId, paused, surprise, onAction, onFailure, controlRef }: {
  shopId: ShopId | null; paused: boolean; surprise: Surprise | null;
  onAction: (action: string) => void; onFailure: (failed: boolean) => void;
  controlRef: React.MutableRefObject<((action: CameraAction) => void) | null>;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const pause = useRef(paused); pause.current = paused;
  const effect = useRef(surprise); effect.current = surprise;
  const handleAction = useRef(onAction); handleAction.current = onAction;
  const failure = useRef(onFailure); failure.current = onFailure;
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    failure.current(false);
    void Promise.all([import('three'), import('./victorian/scene')]).then(([THREE, { buildWorld }]) => {
      if (stopped) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer> | undefined;
      let world: WorldScene | undefined;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        const canvas = renderer.domElement;
        canvas.setAttribute('aria-label', shopId ? 'Interactive 3D shop interior. Use the buttons below for every action.' : 'Interactive 3D Victorian street. Use the shop buttons to enter.');
        canvas.setAttribute('role', 'img');
        host.appendChild(canvas);
        world = buildWorld(shopId);
        const activeWorld = world;
        const activeRenderer = renderer;
        const camera = new THREE.PerspectiveCamera(43, 1, .1, 120);
        let yaw = shopId ? -.08 : -.07;
        let pitch = shopId ? .24 : .21;
        let distance = activeWorld.distance;
        let frame = 0, last = 0, seconds = 0;
        let previousEffect: Surprise | null = null;
        const placeCamera = () => {
          camera.position.set(activeWorld.target.x + Math.sin(yaw) * distance * Math.cos(pitch), activeWorld.target.y + Math.sin(pitch) * distance, activeWorld.target.z + Math.cos(yaw) * distance * Math.cos(pitch));
          camera.lookAt(activeWorld.target);
        };
        const resize = () => {
          const width = host.clientWidth || 900, height = host.clientHeight || 480;
          camera.aspect = width / height; camera.updateProjectionMatrix();
          activeRenderer.setSize(width, height, false);
          placeCamera();
        };
        const observer = new ResizeObserver(resize); observer.observe(host); resize();
        controlRef.current = action => {
          if (action === 'reset') { yaw = shopId ? -.08 : -.07; pitch = shopId ? .24 : .21; distance = activeWorld.distance; }
          if (action === 'left') yaw = Math.max(-.58, yaw - .13);
          if (action === 'right') yaw = Math.min(.58, yaw + .13);
          if (action === 'closer') distance = Math.max(shopId ? 7 : 19, distance - 2);
          if (action === 'further') distance = Math.min(shopId ? 16 : 46, distance + 2);
          placeCamera();
        };
        let down: { x: number; y: number; startYaw: number; startPitch: number } | null = null;
        const pointerDown = (event: PointerEvent) => {
          if (!event.isPrimary || event.button !== 0) return;
          down = { x: event.clientX, y: event.clientY, startYaw: yaw, startPitch: pitch };
          canvas.setPointerCapture(event.pointerId);
        };
        const pointerMove = (event: PointerEvent) => {
          if (!down) return;
          yaw = Math.max(-.58, Math.min(.58, down.startYaw - (event.clientX - down.x) * .003));
          pitch = Math.max(.1, Math.min(.5, down.startPitch + (event.clientY - down.y) * .002)); placeCamera();
        };
        const pointerUp = (event: PointerEvent) => {
          if (!down) return;
          const click = Math.hypot(event.clientX - down.x, event.clientY - down.y) < 8; down = null;
          if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
          if (!click) return;
          const rect = canvas.getBoundingClientRect();
          const action = activeWorld.activate(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
          if (action) handleAction.current(action);
        };
        const pointerCancel = () => { down = null; };
        const lost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); failure.current(true); };
        canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', pointerMove);
        canvas.addEventListener('pointerup', pointerUp); canvas.addEventListener('pointercancel', pointerCancel);
        canvas.addEventListener('webglcontextlost', lost);
        const draw = (now: number) => {
          if (stopped) return;
          if (!pause.current && document.visibilityState === 'visible') seconds += Math.min((now - (last || now)) / 1000, .05);
          last = now;
          if (effect.current && effect.current !== previousEffect) { activeWorld.surprise(effect.current); previousEffect = effect.current; }
          activeWorld.tick(seconds, !pause.current);
          activeRenderer.render(activeWorld.scene, camera);
          frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
        cleanup = () => {
          cancelAnimationFrame(frame); observer.disconnect(); controlRef.current = null;
          canvas.removeEventListener('pointerdown', pointerDown); canvas.removeEventListener('pointermove', pointerMove);
          canvas.removeEventListener('pointerup', pointerUp); canvas.removeEventListener('pointercancel', pointerCancel);
          canvas.removeEventListener('webglcontextlost', lost);
          activeWorld.dispose(); activeRenderer.dispose(); activeRenderer.forceContextLoss(); canvas.remove();
        };
      } catch {
        world?.dispose(); renderer?.dispose(); renderer?.domElement.remove(); failure.current(true);
      }
    }).catch(() => { if (!stopped) failure.current(true); });
    return () => { stopped = true; cleanup?.(); };
  }, [shopId, controlRef]);
  return <div className="victorian-canvas" ref={mount} />;
}

export default function VictorianStreet() {
  const location = useLocation();
  const navigate = useNavigate();
  const shopId = shopFromSearch(location.search);
  const shop = getShop(shopId);
  const [age, setAge] = useState(() => {
    const value = Number(new URLSearchParams(location.search).get('age'));
    return Number.isInteger(value) && value >= 5 && value <= 13 ? value : 7;
  });
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [surprise, setSurprise] = useState<Surprise | null>(null);
  const [message, setMessage] = useState('Choose a shop door to begin your visit.');
  const bag = useRef(createSurpriseBag());
  const controlRef = useRef<((action: CameraAction) => void) | null>(null);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setReduced(media.matches);
    media.addEventListener('change', changed); return () => media.removeEventListener('change', changed);
  }, []);
  useEffect(() => { setSurprise(null); setMessage(shop ? `Welcome to the ${shop.title}. Explore the display or choose a maths activity.` : 'Choose a shop door to begin your visit.'); }, [shop]);
  const discover = useCallback(() => { const next = bag.current(); setSurprise(next); setMessage(SURPRISE_MESSAGES[next]); }, []);
  const onAction = useCallback((action: string) => {
    if (action === 'surprise') discover();
    else if (action === 'street') navigate(`${STREET_ROUTE}?age=${age}`);
    else if (action.startsWith('shop:') && isShopId(action.slice(5))) navigate(`${STREET_ROUTE}?shop=${action.slice(5)}&age=${age}`);
  }, [age, discover, navigate]);
  return <main className="victorian-world">
    <header className="victorian-heading">
      <div><p className="victorian-eyebrow">SODAFOM · A LITTLE WORLD OF WONDER</p><h1>{shop ? shop.title : 'Victorian Learning Lane'}</h1><p>{shop ? 'Come inside. Look closer. Learn something lovely.' : 'Five little shops. So many things to discover.'}</p></div>
      <nav aria-label="World navigation"><Link to="/">Home</Link>{shop && <Link to={`${STREET_ROUTE}?age=${age}`}>Return to street</Link>}</nav>
    </header>
    <div className="victorian-stage">
      <StreetCanvas key={retry} shopId={shopId} paused={paused || reduced} surprise={surprise} onAction={onAction} onFailure={setFailed} controlRef={controlRef} />
      {failed && <div className="victorian-fallback" role="status"><span aria-hidden="true">🏪</span><h2>Your visit can continue</h2><p>The 3D view is unavailable on this device. The shop doors, surprises and learning activities below still work.</p><button type="button" onClick={() => setRetry(value => value + 1)}>Try the 3D view again</button></div>}
      <div className="victorian-stage-label">{shop ? 'INSIDE THE SHOP' : 'EXPLORE THE STREET'} <span>Drag to look · Tap to discover</span></div>
    </div>
    <div className="victorian-controls" aria-label="3D view controls">
      <button disabled={failed} onClick={() => controlRef.current?.('left')} aria-label="Look left">← Look left</button>
      <button disabled={failed} onClick={() => controlRef.current?.('right')} aria-label="Look right">Look right →</button>
      <button disabled={failed} onClick={() => controlRef.current?.('closer')}>Move closer</button>
      <button disabled={failed} onClick={() => controlRef.current?.('further')}>Step back</button>
      <button disabled={failed} onClick={() => controlRef.current?.('reset')}>Reset view</button>
      <button aria-pressed={paused || reduced} disabled={reduced} onClick={() => setPaused(value => !value)}>{reduced ? 'Reduced motion on' : paused ? 'Resume motion' : 'Pause motion'}</button>
    </div>
    <section className="victorian-explore" aria-label={shop ? 'Explore this shop' : 'Choose a shop'}>
      {!shop ? <div className="victorian-doors">{SHOPS.map((item, index) => <Link key={item.id} to={`${STREET_ROUTE}?shop=${item.id}&age=${age}`}><span aria-hidden="true">{['🍬', '👞', '📚', '🧁', '🎁'][index]}</span><strong>{item.title}</strong><small>Open the door →</small></Link>)}</div> : <div className="victorian-shop-layout">
        <div className="victorian-discover"><p className="victorian-eyebrow">LOOK A LITTLE CLOSER</p><h2>A tiny surprise is waiting</h2><p>{shop.id === 'sweet-shop' ? 'Clear jars, colourful sweets and a friendly little secret in the central display.' : 'Explore the shelves and central display. There is a little surprise to find.'}</p><button onClick={discover}>Explore the display ✨</button><p className="victorian-message" aria-live="polite" aria-atomic="true">{message}</p></div>
        <div className="victorian-learning"><div className="victorian-learning-heading"><div><p className="victorian-eyebrow">PLAY & PRACTISE</p><h2>A little maths adventure</h2></div><label>Choose age<select value={age} onChange={event => setAge(Number(event.target.value))}>{Array.from({ length: 9 }, (_, i) => i + 5).map(value => <option key={value} value={value}>{value}</option>)}</select></label></div>
          <p>Choose the right age for activity suggestions. Games may offer their own challenge choices.</p>
          <div className="victorian-activities">{shop.activities.map(activity => {
            const url = learningUrl(shop.id, activity.id, age); const [min, max] = ACTIVITY_AGES[activity.route];
            return <div key={activity.id}><strong>{activity.title}</strong><span>Ages {min}–{max}{activity.route === '/games/fraction-pizza' ? ' · Uses pizza fractions' : ''}</span>{url ? <Link to={url}>Play {activity.title} →</Link> : <small>Suggested for ages {min}–{max}. You can still explore this shop.</small>}</div>;
          })}</div>
        </div>
      </div>}
    </section>
    <footer className="victorian-footer">A place for pretend play and learning. All shop activities use pretend money.</footer>
  </main>;
}
