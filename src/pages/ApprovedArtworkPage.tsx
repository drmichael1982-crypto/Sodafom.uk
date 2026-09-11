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
  { label: "Open Archie's Stories", left: 4, top: 48, width: 18, height: 20, route: '/stories' },
  { label: "Open Archie's Lessons", left: 24, top: 48, width: 17, height: 20, route: '/lessons' },
  { label: 'Ask Archie', left: 42, top: 48, width: 17, height: 20, route: '/ask-archie' },
  { label: 'Open Game Islands', left: 60, top: 48, width: 17, height: 20, route: '/game-islands' },
  { label: 'Open Homework Helper', left: 78, top: 48, width: 18, height: 20, route: '/homework-helper' },
  { label: 'Open Archie Theatre', left: 1, top: 68, width: 18, height: 21, route: '/archie-theatre' },
  { label: "Open Parents' Evening", left: 19, top: 68, width: 18, height: 21, route: '/parent-dashboard' },
  { label: 'Open Teacher Classroom', left: 36, top: 68, width: 18, height: 21, route: '/teacher-hub' },
  { label: 'Open Sodafom Shop', left: 53, top: 68, width: 17, height: 21, route: '/sodafom-shop' },
  { label: "Open Archie's Sticker Book", left: 70, top: 68, width: 17, height: 21, route: '/rewards' },
  { label: 'Open Settings', left: 87, top: 68, width: 13, height: 21, route: '/sodafom-settings' },
  { label: 'Open My Progress', left: 0, top: 90, width: 10, height: 10, route: '/hub/progress' },
  { label: 'Open Rewards', left: 10, top: 90, width: 10, height: 10, route: '/rewards' },
  { label: 'Meet Archie and Friends', left: 20, top: 90, width: 12, height: 10, route: '/archie-friends' },
];

const PAGE_HOTSPOTS: Record<Exclude<ApprovedArtworkVariant, 'home'>, Hotspot[]> = {
  lessons: [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 12, route: '/' },
    { label: 'Start a structured lesson', left: 8, top: 25, width: 84, height: 65, route: '/tutor' },
  ],
  'game-islands': [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 12, route: '/' },
    { label: 'Open all educational games', left: 8, top: 20, width: 84, height: 72, route: '/games' },
  ],
  'homework-helper': [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 10, route: '/' },
    { label: 'Scan or explain homework', left: 7, top: 60, width: 86, height: 28, route: '/ai-teacher' },
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
    { label: 'Return home', left: 0, top: 0, width: 9, height: 12, route: '/' },
    { label: 'Open account and accessibility settings', left: 8, top: 18, width: 84, height: 72, route: '/hub/profile' },
  ],
  stories: [
    { label: 'Return home', left: 0, top: 0, width: 9, height: 12, route: '/' },
    { label: "Open Archie's reading collection", left: 7, top: 24, width: 86, height: 60, route: '/subjects/reading' },
    { label: 'Write your own story', left: 70, top: 74, width: 24, height: 19, route: '/story-writer' },
  ],
};

export default function ApprovedArtworkPage({ variant }: { variant: ApprovedArtworkVariant }) {
  const navigate = useNavigate();
  const artwork = ARTWORK[variant];
  const hotspots = variant === 'home' ? HOME_HOTSPOTS : PAGE_HOTSPOTS[variant];

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-800 to-emerald-900 px-0 py-0 sm:px-4 sm:py-4">
      <Helmet>
        <title>{artwork.title}</title>
      </Helmet>
      <div className="mx-auto w-full max-w-[1536px] overflow-hidden bg-white shadow-2xl sm:rounded-3xl">
        <div className="relative w-full">
          <img src={artwork.src} alt={artwork.alt} className="block h-auto w-full" draggable={false} />
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
