import { useId } from 'react';
import { sceneForSubject } from './SceneArtwork';

export default function ArchiePicturePiece({ label }: { label: string }) {
  const id = useId().replace(/:/g, '');
  const scene = sceneForSubject(label);
  const path = 'M8 8 H38 C33 -2 57 -2 52 8 H92 V38 C82 33 82 57 92 52 V92 H62 C67 82 43 82 48 92 H8 V62 C-2 67 -2 43 8 48 Z';
  return <svg className="archie-picture-piece" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs><clipPath id={`picture-${id}`}><path d={path}/></clipPath></defs>
    <image href={`/assets/scenes/${scene}-v1.webp`} x="-42" y="0" width="150" height="100" preserveAspectRatio="xMidYMid slice" clipPath={`url(#picture-${id})`}/>
    <path d={path} fill="none" stroke="white" strokeWidth="2.8"/>
  </svg>;
}
