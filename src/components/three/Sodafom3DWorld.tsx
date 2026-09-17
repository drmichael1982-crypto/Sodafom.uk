import {
  Component,
  Suspense,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, Preload } from '@react-three/drei';

import {
  detectLowPowerMode,
  getSodafom3DQualitySettings,
  resolveSodafom3DQuality,
} from './quality';
import type {
  Sodafom3DEnvironment,
  Sodafom3DRenderMode,
  Sodafom3DWorldProps,
} from './types';

type ViewportOrientation = 'unknown' | 'portrait' | 'landscape';
type WebGLState = 'checking' | 'supported' | 'unsupported';

const Sodafom3DEnvironmentContext =
  createContext<Sodafom3DEnvironment | null>(null);

export function useSodafom3DEnvironment(): Sodafom3DEnvironment {
  const context = useContext(Sodafom3DEnvironmentContext);
  if (!context) {
    throw new Error(
      'useSodafom3DEnvironment must be used inside <Sodafom3DWorld>.',
    );
  }
  return context;
}

function readOrientation(): ViewportOrientation {
  if (typeof window === 'undefined') return 'unknown';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

function useViewportOrientation(): ViewportOrientation {
  const [orientation, setOrientation] = useState<ViewportOrientation>('unknown');

  useEffect(() => {
    const updateOrientation = () => setOrientation(readOrientation());
    const screenOrientation = window.screen?.orientation;

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    screenOrientation?.addEventListener?.('change', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
      screenOrientation?.removeEventListener?.('change', updateOrientation);
    };
  }, []);

  return orientation;
}

function useReducedMotion(explicitValue: boolean | undefined): boolean {
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] =
    useState(false);

  useEffect(() => {
    if (explicitValue !== undefined || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setSystemPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener?.('change', updatePreference);

    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, [explicitValue]);

  return explicitValue ?? systemPrefersReducedMotion;
}

export function browserSupportsWebGL(): boolean {
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function initialWebGLState(renderMode: Sodafom3DRenderMode): WebGLState {
  if (renderMode === 'webgl') return 'supported';
  if (renderMode === 'fallback') return 'unsupported';
  return 'checking';
}

function DefaultLoadingFallback() {
  return (
    <div
      aria-live="polite"
      style={{
        borderRadius: 12,
        background: 'rgba(255,255,255,0.92)',
        padding: '0.75rem 1rem',
        color: '#172033',
        fontWeight: 700,
      }}
    >
      Loading the 3D world…
    </div>
  );
}

function DefaultAccessibilityFallback({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{
        display: 'grid',
        minHeight: 220,
        placeItems: 'center',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <div>
        <strong>3D view is unavailable on this device.</strong>
        <div>You can still use the normal Sodafom buttons and learning routes.</div>
      </div>
    </div>
  );
}

class Sodafom3DErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Sodafom3DWorld render failed', error, info);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function WorldLights({ shadows }: { shadows: boolean }) {
  return (
    <>
      <ambientLight intensity={0.75} />
      <hemisphereLight intensity={0.6} groundColor="#7b8a63" />
      <directionalLight
        castShadow={shadows}
        intensity={1.15}
        position={[8, 12, 6]}
      />
    </>
  );
}

export function Sodafom3DWorld({
  children,
  className,
  style,
  ariaLabel = 'Sodafom interactive 3D world',
  paused = false,
  reducedMotion: reducedMotionProp,
  lowPowerMode: lowPowerModeProp,
  quality = 'auto',
  renderMode = 'auto',
  loadingFallback,
  accessibilityFallback,
  cameraPosition = [0, 5, 10],
  cameraFov = 50,
}: Sodafom3DWorldProps) {
  const orientation = useViewportOrientation();
  const reducedMotion = useReducedMotion(reducedMotionProp);
  const [detectedLowPowerMode, setDetectedLowPowerMode] = useState(false);
  const [webGLState, setWebGLState] = useState<WebGLState>(() =>
    initialWebGLState(renderMode),
  );

  useEffect(() => {
    setDetectedLowPowerMode(detectLowPowerMode());
  }, []);

  useEffect(() => {
    if (renderMode === 'webgl') {
      setWebGLState('supported');
      return;
    }
    if (renderMode === 'fallback') {
      setWebGLState('unsupported');
      return;
    }
    setWebGLState(browserSupportsWebGL() ? 'supported' : 'unsupported');
  }, [renderMode]);

  const lowPowerMode = lowPowerModeProp ?? detectedLowPowerMode;
  const resolvedQuality = resolveSodafom3DQuality(quality, lowPowerMode);
  const settings = getSodafom3DQualitySettings(resolvedQuality);
  const environment = useMemo<Sodafom3DEnvironment>(
    () => ({ paused, reducedMotion, lowPowerMode, quality: resolvedQuality }),
    [lowPowerMode, paused, reducedMotion, resolvedQuality],
  );

  const fallback = accessibilityFallback ?? (
    <DefaultAccessibilityFallback ariaLabel={ariaLabel} />
  );

  const wrapperStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: 220,
    ...style,
  } as const;

  if (webGLState === 'checking') {
    return (
      <div
        className={className}
        style={wrapperStyle}
        data-sodafom-3d="checking"
        data-orientation={orientation}
        aria-label={ariaLabel}
      >
        {loadingFallback ?? <DefaultLoadingFallback />}
      </div>
    );
  }

  if (webGLState === 'unsupported') {
    return (
      <div
        className={className}
        style={wrapperStyle}
        data-sodafom-3d="fallback"
        data-orientation={orientation}
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={wrapperStyle}
      data-sodafom-3d="webgl"
      data-quality={resolvedQuality}
      data-orientation={orientation}
      data-paused={paused ? 'true' : 'false'}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      aria-label={ariaLabel}
    >
      <Sodafom3DErrorBoundary fallback={fallback}>
        <Canvas
          camera={{ position: cameraPosition, fov: cameraFov }}
          dpr={settings.dpr}
          frameloop={paused || reducedMotion ? 'demand' : 'always'}
          gl={{
            antialias: settings.antialias,
            powerPreference: settings.powerPreference,
          }}
          shadows={settings.shadows}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 80 } }}
          fallback={fallback}
        >
          <Sodafom3DEnvironmentContext.Provider value={environment}>
            <WorldLights shadows={settings.shadows} />
            <Suspense
              fallback={
                <Html center>{loadingFallback ?? <DefaultLoadingFallback />}</Html>
              }
            >
              {children}
              <Preload all />
            </Suspense>
          </Sodafom3DEnvironmentContext.Provider>
        </Canvas>
      </Sodafom3DErrorBoundary>
    </div>
  );
}
