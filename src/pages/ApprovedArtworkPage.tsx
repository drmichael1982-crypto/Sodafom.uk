import { Helmet } from '@dr.pogodin/react-helmet';
import { useNavigate } from 'react-router';

export type ApprovedArtworkVariant =
  | 'home'
  | 'lessons'
  | 'game-islands'
  | 'homework-helper'
  | 'archie-theatre'
  | 'shop'
  | 'settings'
  | 'stories';

type Hotspot = {
  label: string;
  left: number;
  top: number;
  width: number;
  height: number;
  route?: string;
};

const ARTWORK: Record<ApprovedArtworkVariant, { src: string; title: string; alt: string }> = {
  home: {
    src: '/assets/approved/home.png',
    title: 'Sodafom — A brighter future for every child',
    alt: 'The approved Sodafom family home screen with Archie, his family, the dogs and the main learning buttons.',
  },
  lessons: {
    src: '/assets/approved/lessons.png',
    title: "Archie's Lessons",
    alt: "The approved illustrated Archie's Lessons classroom with colourful subject doors.",
  },
  'game-islands': {
    src: '/assets/approved/game-islands.png',
    title: 'Sodafom Game Islands',
    alt: 'The approved illustrated Sodafom Game Islands learning map.',
  },
  'homework-helper': {
    src: '/assets/approved/homework-helper.png',
    title: 'Homework Helper',
    alt: 'The approved illustrated Homework Helper classroom with Archie and the homework tools.',
  },
  'archie-theatre': {
    src: '/assets/approved/archie-theatre.png',
    title: 'Archie Theatre',
    alt: 'The approved illustrated Archie Theatre screen.',
  },
  shop: {
    src: '/assets/approved/shop.png',
    title: 'Sodafom Shop',
    alt: 'The approved illustrated Sodafom Shop screen.',
  },
  settings: {
    src: '/assets/approved/settings.png',
    title: 'Sodafom Settings',
    alt: 'The approved illustrated Sodafom Settings screen.',
  },
  stories: {
    src: '/assets/approved/stories.png',
    title: "Archie's Stories",
    alt: "The approved illustrated Archie's Stories library.",
  },
};

const HOME_HOTSPOTS: Hotspot[] = [
  { label: "Open Archie's Stories", left: 9, top: 43, width: 20, height: 11, route: '/stories' },
  { label: "Open Archie's Lessons", left: 30, top: 43, width: 20, height: 11, route: '/lessons' },
  { label: 'Ask Archie', left: 51, top: 43, width: 19, height: 11, route: '/ask-archie' },
  { label: 'Open Game Islands', left: 71, top: 43, width: 20, height: 11, route: '/game-islands' },
  { label: 'Open Homework Helper', left: 9, top: 55, width: 20, height: 11, route: '/homework-helper' },
  { label: 'Open Museum Explorer', left: 30, top: 55, width: 20, height: 11, route: '/museum' },
  { label: 'Open Archie Theatre', left: 51, top: 55, width: 19, height: 11, route: '/archie-theatre' },
  { label: 'Open Birthday and Parties', left: 71, top: 55, width: 20, height: 11, route: '/birthday-party' },
  { label: "Open Parents' Evening", left: 9, top: 67, width: 20, height: 11, route: '/parent-area' },
  { label: 'Open Teacher Classroom', left: 30, top: 67, width: 20, height: 11, route: '/teacher-hub' },
  { label: 'Open Sodafom Shop', left: 51, top: 67, width: 19, height: 11, route: '/sodafom-shop' },
  { label: "Open Archie's Sticker Book", left: 71, top: 67, width: 20, height: 11, route: '/rewards' },
  { label: 'Open Settings', left: 9, top: 79, width: 20, height: 11, route: '/sodafom-settings' },
  { label: 'Open My Progress', left: 30, top: 79, width: 20, height: 11, route: '/hub/progress' },
  { label: 'Open Rewards', left: 51, top: 79, width: 19, height: 11, route: '/rewards' },
  { label: 'Meet Archie and Friends', left: 71, top: 79, width: 20, height: 11, route: '/archie-friends' },
];

const PAGE_HOTSPOTS: Record<Exclude<ApprovedArtworkVariant, 'home'>, Hotspot[]> = {
  lessons: [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 12, route: '/' },
    { label: 'Start a Maths lesson', left: 8, top: 32, width: 18, height: 24, route: '/tutor?subject=Maths&direct=1' },
    { label: 'Start an English lesson', left: 27, top: 32, width: 18, height: 24, route: '/tutor?subject=English&direct=1' },
    { label: 'Start a Spelling lesson', left: 45, top: 32, width: 18, height: 24, route: '/tutor?subject=Spelling&direct=1' },
    { label: 'Start a Science lesson', left: 63, top: 32, width: 18, height: 24, route: '/tutor?subject=Science&direct=1' },
    { label: 'Start a Geography lesson', left: 81, top: 32, width: 18, height: 24, route: '/tutor?subject=Geography&direct=1' },
    { label: 'Start a History lesson', left: 8, top: 56, width: 18, height: 24, route: '/tutor?subject=History&direct=1' },
    { label: 'Start a PE lesson', left: 27, top: 56, width: 18, height: 24, route: '/tutor?subject=PE&direct=1' },
    { label: 'Start a Technology lesson', left: 45, top: 56, width: 18, height: 24, route: '/tutor?subject=Computing&direct=1' },
    { label: 'Start a French lesson', left: 63, top: 56, width: 18, height: 24, route: '/tutor?subject=French&direct=1' },
    { label: 'Start a German lesson', left: 81, top: 56, width: 18, height: 24, route: '/tutor?subject=German&direct=1' },
  ],
  'game-islands': [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 12, route: '/' },
    { label: 'Open Maths Island games', left: 9, top: 17, width: 22, height: 21, route: '/games?cat=maths' },
    { label: 'Open English Island games', left: 30, top: 22, width: 21, height: 22, route: '/games?cat=reading' },
    { label: 'Open Science Island games', left: 50, top: 20, width: 21, height: 22, route: '/games?cat=science' },
    { label: 'Open History Island games', left: 75, top: 18, width: 20, height: 22, route: '/games?cat=science' },
    { label: 'Open Geography Island games', left: 13, top: 37, width: 22, height: 22, route: '/games?cat=science' },
    { label: 'Open PE Island games', left: 59, top: 38, width: 21, height: 22, route: '/games' },
    { label: 'Open Technology Island games', left: 79, top: 38, width: 20, height: 22, route: '/games?cat=science' },
    { label: 'Open French Island games', left: 25, top: 56, width: 21, height: 21, route: '/games' },
    { label: 'Open German Island games', left: 48, top: 56, width: 21, height: 21, route: '/games' },
    { label: 'Open Spelling Island games', left: 70, top: 57, width: 22, height: 21, route: '/games?cat=spelling' },
  ],
  'homework-helper': [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 10, route: '/' },
    { label: 'Scan or explain homework', left: 7, top: 60, width: 86, height: 28, route: '/homework-tools' },
  ],
  'archie-theatre': [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 12, route: '/' },
    { label: 'Open Archie cartoons', left: 24, top: 16, width: 58, height: 55, route: '/cartoons' },
  ],
  shop: [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 12, route: '/' },
    { label: 'Open the Back-to-School Shop', left: 23, top: 18, width: 60, height: 67, route: '/shop/back-to-school' },
  ],
  settings: [
    { label: 'Return home', left: 2, top: 82, width: 22, height: 15, route: '/' },
    { label: 'Open Audio and Voice settings', left: 31, top: 25, width: 15, height: 20, route: '/hub/profile?section=audio' },
    { label: 'Open Child Profile settings', left: 46, top: 24, width: 15, height: 20, route: '/hub/profile?section=child' },
    { label: 'Open Display settings', left: 61, top: 24, width: 15, height: 20, route: '/hub/profile?section=display' },
    { label: 'Open Language settings', left: 28, top: 43, width: 16, height: 20, route: '/hub/profile?section=language' },
    { label: 'Open Sodafom settings', left: 44, top: 42, width: 18, height: 22, route: '/hub/profile' },
    { label: 'Open Privacy and Safety settings', left: 64, top: 43, width: 16, height: 20, route: '/parent-area' },
    { label: 'Open Learning Preferences', left: 34, top: 61, width: 16, height: 20, route: '/tutor' },
    { label: 'Open Account settings', left: 49, top: 63, width: 16, height: 21, route: '/hub/profile?section=account' },
    { label: 'Open protected Admin Access', left: 63, top: 61, width: 17, height: 21, route: '/admin-panel' },
  ],
  stories: [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 12, route: '/' },
    { label: "Open Archie's reading collection", left: 7, top: 24, width: 86, height: 60, route: '/reading' },
    { label: 'Write your own story', left: 70, top: 74, width: 24, height: 19, route: '/story-writer' },
  ],
};

export default function ApprovedArtworkPage({ variant }: { variant: ApprovedArtworkVariant }) {
  const navigate = useNavigate();
  const artwork = ARTWORK[variant];
  const hotspots = variant === 'home' ? HOME_HOTSPOTS : PAGE_HOTSPOTS[variant];

  return (
    <main className="h-[100svh] w-full overflow-hidden bg-sky-500 p-0">
      <Helmet>
        <title>{artwork.title}</title>
      </Helmet>
      <div className="mx-auto h-full w-full max-w-[1536px] overflow-hidden bg-white shadow-2xl">
        <div className="relative h-full w-full">
          <img src={artwork.src} alt={artwork.alt} className="block h-full w-full object-cover object-top" draggable={false} />
          {hotspots.map((hotspot) => (
            <button
              key={hotspot.label}
              type="button"
              aria-label={hotspot.label}
              title={hotspot.label}
              onClick={() => hotspot.route && navigate(hotspot.route)}
              className="absolute cursor-pointer rounded-2xl bg-transparent focus-visible:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300"
              style={{
                left: `${hotspot.left}%`,
                top: `${hotspot.top}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`,
              }}
            >
              <span className="sr-only">{hotspot.label}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
