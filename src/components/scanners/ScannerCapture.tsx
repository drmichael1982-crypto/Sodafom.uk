import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { PHOTO_TYPES, validatePhoto } from './scanner-core';

interface Props {
  onPhoto: (photo: string) => void;
  onError: (message: string) => void;
  onStart: () => void;
}

/** Camera and file picker are independent; neither sends a photo to a server. */
export default function ScannerCapture({ onPhoto, onError, onStart }: Props) {
  const picker = useRef<HTMLInputElement>(null);
  const nativeCamera = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const reader = useRef<FileReader | null>(null);
  const generation = useRef(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    video.current = node;
    // Permission can resolve before React mounts the preview. Attach in either order.
    if (node && stream.current) node.srcObject = stream.current;
  }, []);

  const release = useCallback(() => {
    generation.current += 1;
    reader.current?.abort();
    reader.current = null;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }, []);
  const close = useCallback(() => {
    release(); setCameraOpen(false); setOpening(false); setReady(false);
  }, [release]);

  useEffect(() => {
    const hide = () => { if (document.hidden) close(); };
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('pagehide', close);
    return () => {
      release();
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('pagehide', close);
    };
  }, [close, release]);

  const choose = (file?: File) => {
    if (!file) return;
    close(); onStart(); onError('');
    const problem = validatePhoto(file);
    if (problem) { onError(problem); return; }
    const current = generation.current;
    const next = new FileReader();
    reader.current = next;
    next.onload = () => {
      if (current !== generation.current) return;
      const data = String(next.result ?? '');
      const check = new Image();
      check.onload = () => {
        if (current !== generation.current) return;
        if (!check.naturalWidth || !check.naturalHeight) { onError('This photo could not be opened.'); return; }
        onPhoto(data);
      };
      check.onerror = () => { if (current === generation.current) onError('This file is not a readable photograph. Please choose another.'); };
      check.src = data;
    };
    next.onerror = () => { if (current === generation.current) onError('The photograph could not be opened. Please choose another.'); };
    next.readAsDataURL(file);
  };

  const openCamera = async () => {
    close(); onStart(); onError('');
    // On WebViews without live capture, let the device's camera picker handle it.
    if (!navigator.mediaDevices?.getUserMedia) { nativeCamera.current?.click(); return; }
    const current = generation.current;
    setOpening(true); setCameraOpen(true);
    try {
      const next = await navigator.mediaDevices.getUserMedia({
        audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1440 } },
      });
      if (current !== generation.current) { next.getTracks().forEach(track => track.stop()); return; }
      stream.current = next;
      if (video.current) {
        video.current.srcObject = next;
        await video.current.play();
      }
      if (current === generation.current) setOpening(false);
    } catch (error) {
      if (current !== generation.current) return;
      close();
      onError(error instanceof Error && error.name === 'NotAllowedError'
        ? 'Camera permission was not granted. You can upload a photo instead, or enable the camera in your browser settings.'
        : 'The camera could not open. You can upload a photo or use your device camera below.');
    }
  };

  const capture = () => {
    const frame = video.current;
    if (!frame?.videoWidth || !frame.videoHeight) return;
    try {
      const scale = Math.min(1, 2000 / Math.max(frame.videoWidth, frame.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(frame.videoWidth * scale);
      canvas.height = Math.round(frame.videoHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Camera image unavailable');
      context.drawImage(frame, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/jpeg', 0.9);
      close(); onPhoto(data);
    } catch {
      close(); onError('That photo could not be taken. Please upload a photo instead.');
    }
  };

  const button = 'flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2';
  return <section aria-label="Choose a scanner photo" className="space-y-3">
    <input ref={picker} aria-label="Upload a scanner photo" type="file" accept={PHOTO_TYPES} hidden onChange={event => { choose(event.target.files?.[0]); event.target.value = ''; }} />
    <input ref={nativeCamera} aria-label="Take a scanner photo with the device camera" type="file" accept={PHOTO_TYPES} capture="environment" hidden onChange={event => { choose(event.target.files?.[0]); event.target.value = ''; }} />
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" onClick={() => void openCamera()} className={`${button} bg-sky-700 text-white`}><Camera aria-hidden />Open camera</button>
      <button type="button" onClick={() => { close(); picker.current?.click(); }} className={`${button} bg-violet-700 text-white`}><Upload aria-hidden />Upload photo</button>
    </div>
    <button type="button" className="min-h-11 px-2 text-sm font-bold text-sky-800 underline" onClick={() => { close(); onStart(); nativeCamera.current?.click(); }}>Use device camera instead</button>
    {cameraOpen && <div className="space-y-3 rounded-2xl bg-slate-950 p-3 text-white">
      <p role="status">{opening ? 'Allow camera access to see your page. You can cancel below.' : 'Hold the page steady and keep names and faces out of the frame.'}</p>
      <video ref={attachVideo} muted playsInline autoPlay aria-label="Live camera preview" className="max-h-96 w-full rounded-xl" onLoadedData={() => setReady(true)} onError={() => { close(); onError('The camera preview stopped. Please try again or upload a photo.'); }} />
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={!ready} onClick={capture} className={`${button} bg-emerald-700 text-white disabled:opacity-50`}>Take photo</button>
        <button type="button" onClick={close} className={`${button} bg-white text-slate-950`}><X aria-hidden />Close camera</button>
      </div>
    </div>}
  </section>;
}
