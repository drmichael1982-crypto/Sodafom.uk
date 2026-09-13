import { useEffect, useRef } from 'react';
import { API_PREFIX } from '@/lib/config';
import { mountFeatureControls } from './feature-controls-view';
import './admin-feature-controls.css';

/** Mounted in FounderVoiceControl, after the existing server-checked Admin Hub login. */
export function AdminFeatureControls() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (host.current) return mountFeatureControls(host.current, API_PREFIX);
  }, []);
  return <div ref={host} aria-label="Owner feature controls" />;
}
