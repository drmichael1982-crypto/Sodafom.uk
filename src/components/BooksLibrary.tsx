import { useState } from 'react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

import ArchieCharacter from '@/components/ArchieCharacter';

export type StoryBook = {
  title: string;
  strapline: string;
  colour: string;
};

// These are the story choices already shown in the current Archie Stories screen.
// The library changes their presentation, without inventing new story content.
export const STORY_BOOKS: StoryBook[] = [
  { title: 'Rendlesham Forest Adventure', strapline: 'A woodland mystery with Archie', colour: 'from-emerald-500 to-teal-800' },
  { title: 'Archie and the Orford Boat Discovery', strapline: 'A riverside discovery', colour: 'from-sky-500 to-blue-800' },
  { title: 'Archie Saves the Seal Pup', strapline: 'A kind seaside adventure', colour: 'from-cyan-500 to-blue-700' },
  { title: 'Archie and the Lost Key', strapline: 'Follow the golden clue', colour: 'from-amber-500 to-orange-700' },
  { title: 'Archie Builds a Treehouse', strapline: 'Make, plan and play', colour: 'from-lime-500 to-green-800' },
  { title: 'Archie Visits London', strapline: 'A big-city day out', colour: 'from-rose-500 to-red-800' },
  { title: 'Archie Explores Space', strapline: 'A starry adventure', colour: 'from-indigo-500 to-violet-900' },
  { title: 'Archie Helps in the Community', strapline: 'Small acts of kindness', colour: 'from-orange-500 to-pink-700' },
  { title: 'Archie and the Dinosaur Trail', strapline: 'Follow clues from the past', colour: 'from-green-500 to-emerald-800' },
  { title: 'A Brighter Tomorrow', strapline: 'Imagine what is possible', colour: 'from-yellow-500 to-orange-700' },
  { title: 'Archie and the Nature Trail', strapline: 'Look closely outdoors', colour: 'from-teal-500 to-emerald-800' },
  { title: 'Archie’s Science Adventure', strapline: 'Ask, test and discover', colour: 'from-fuchsia-500 to-purple-800' },
  { title: 'Archie Travels Through History', strapline: 'Step into the past', colour: 'from-stone-500 to-slate-800' },
  { title: 'Friends From Different Places', strapline: 'Meet, learn and belong', colour: 'from-pink-500 to-rose-800' },
  { title: 'Archie Learns Healthy Living', strapline: 'Care for body and mind', colour: 'from-lime-500 to-green-800' },
  { title: 'Archie’s Future Dreams', strapline: 'Think big and kindly', colour: 'from-violet-500 to-indigo-800' },
];

export const BOOKS_PER_SHELF = 4;

export function buildLibraryShelves(books: readonly StoryBook[], size = BOOKS_PER_SHELF): StoryBook[][] {
  if (!Number.isInteger(size) || size < 1) return [];

  return Array.from({ length: Math.ceil(books.length / size) }, (_, shelfIndex) => (
    books.slice(shelfIndex * size, shelfIndex * size + size)
  ));
}

const SHELVES = buildLibraryShelves(STORY_BOOKS);

type BooksLibraryProps = {
  onBack: () => void;
};

function BookCover({ book, onOpen }: { book: StoryBook; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative min-h-64 w-full overflow-hidden rounded-r-2xl border-y-4 border-r-4 border-amber-100 bg-gradient-to-br ${book.colour} p-4 text-left text-white shadow-[inset_10px_0_0_rgba(59,29,17,.55),0_14px_20px_rgba(61,31,13,.35)] transition duration-200 hover:-translate-y-2 hover:rotate-1 focus:outline-none focus:ring-4 focus:ring-purple-400 active:scale-95`}
      aria-label={`Open ${book.title} from the library`}
    >
      <div aria-hidden className="absolute inset-y-0 left-0 w-3 border-r border-amber-100/30 bg-black/35" />
      <div aria-hidden className="absolute right-3 top-3 h-20 w-20 rounded-full bg-white/15 blur-xl" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <BookOpen aria-hidden className="h-8 w-8 drop-shadow" />
          <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-black uppercase tracking-wider">Story</span>
        </div>
        <div>
          <h2 className="font-serif text-xl font-black leading-tight drop-shadow-lg">{book.title}</h2>
          <p className="mt-2 text-sm font-bold text-white/90">{book.strapline}</p>
          <span className="mt-4 inline-block rounded-full bg-white/95 px-3 py-1 text-xs font-black text-purple-900">
            Choose book
          </span>
        </div>
      </div>
    </button>
  );
}

function SelectedBook({ book, onBackToLibrary }: { book: StoryBook; onBackToLibrary: () => void }) {
  return (
    <main className={`min-h-screen bg-gradient-to-b ${book.colour} px-4 py-5 text-slate-950`}>
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onBackToLibrary}
          className="mb-4 flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-black shadow-xl transition hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-300"
        >
          <ArrowLeft aria-hidden /> Back to library
        </button>

        <motion.section
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[2.5rem] border-8 border-amber-200 bg-[#f9e7bd] shadow-2xl"
        >
          <div className="grid min-h-[570px] items-stretch md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative flex items-center justify-center overflow-hidden bg-amber-950/10 p-8">
              <motion.div
                initial={{ rotateY: -28, rotateZ: -2 }}
                animate={{ rotateY: 0, rotateZ: 0 }}
                transition={{ type: 'spring', stiffness: 110, damping: 16 }}
                className={`relative flex h-[420px] w-[280px] flex-col justify-between overflow-hidden rounded-r-2xl border-y-4 border-r-4 border-amber-100 bg-gradient-to-br ${book.colour} p-7 text-white shadow-2xl [box-shadow:-16px_0_0_#5b341d,0_28px_50px_rgba(60,28,10,.35)]`}
              >
                <BookOpen aria-hidden className="h-12 w-12" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Archie’s Stories</p>
                  <h1 className="mt-3 font-serif text-4xl font-black leading-tight">{book.title}</h1>
                  <p className="mt-4 font-bold text-white/90">{book.strapline}</p>
                </div>
              </motion.div>
            </div>

            <div className="relative flex min-h-[470px] flex-col justify-end overflow-hidden bg-gradient-to-b from-sky-100 via-amber-50 to-amber-100 p-7 sm:p-10">
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 border-t-4 border-amber-300 bg-amber-200/80" />
              <motion.div
                aria-label={`Archie steps out of ${book.title}`}
                className="absolute bottom-16 left-1/2 -translate-x-1/2"
                initial={{ x: -150, y: 18, scale: 0.38, opacity: 0 }}
                animate={{ x: [-150, -105, -55, -10, 24], y: [18, -12, 8, -10, 0], scale: [0.38, 0.55, 0.72, 0.9, 1], opacity: [0, 1, 1, 1, 1] }}
                transition={{ duration: 1.65, ease: 'easeOut' }}
              >
                <ArchieCharacter size={190} />
              </motion.div>

              <div className="relative z-10 rounded-3xl bg-white/95 p-6 shadow-xl backdrop-blur-sm">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-700">Selected story</p>
                <h2 className="mt-2 font-serif text-3xl font-black text-purple-950 sm:text-4xl">{book.title}</h2>
                <p className="mt-2 font-bold text-slate-700">Archie has stepped out of the cover to welcome you. Choose another book whenever you are ready.</p>
                <button
                  type="button"
                  onClick={onBackToLibrary}
                  className="mt-5 min-h-12 rounded-full bg-purple-700 px-7 font-black text-white shadow-lg transition hover:bg-purple-800 active:scale-95 focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                  Explore the shelves
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default function BooksLibrary({ onBack }: BooksLibraryProps) {
  const [selectedBook, setSelectedBook] = useState<StoryBook | null>(null);

  if (selectedBook) {
    return <SelectedBook book={selectedBook} onBackToLibrary={() => setSelectedBook(null)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-50 to-amber-100 px-4 py-5 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-12 items-center gap-2 rounded-full bg-white px-5 font-black shadow-xl transition hover:bg-amber-50 focus:outline-none focus:ring-4 focus:ring-amber-300"
          >
            <ArrowLeft aria-hidden /> Back to home
          </button>
          <div className="rounded-3xl border-4 border-amber-700 bg-white px-5 py-3 text-center shadow-lg">
            <div className="flex items-center justify-center gap-2 text-purple-950">
              <BookOpen aria-hidden />
              <h1 className="text-2xl font-black sm:text-4xl">ARCHIE’S BOOK LIBRARY</h1>
            </div>
            <p className="mt-1 font-bold text-slate-600">Choose a cover from the colourful shelves.</p>
          </div>
          <span aria-hidden className="hidden w-32 sm:block" />
        </div>

        <section aria-label="Archie’s story shelves" className="overflow-hidden rounded-[2.5rem] border-8 border-amber-900 bg-gradient-to-b from-[#f7dca6] via-[#edc47d] to-[#d19a50] shadow-2xl">
          <div className="border-b-4 border-amber-800 bg-[#6f3f24] px-6 py-4 text-center text-lg font-black text-amber-50 shadow-inner">
            The Story Library
          </div>

          <div className="space-y-8 px-4 py-8 sm:px-8">
            {SHELVES.map((shelf, shelfIndex) => (
              <section key={`shelf-${shelfIndex}`} aria-label={`Shelf ${shelfIndex + 1}`} className="relative pb-8">
                <div className="grid grid-cols-2 gap-4 px-2 pb-4 pt-3 sm:grid-cols-4 sm:gap-5">
                  {shelf.map((book) => (
                    <BookCover key={book.title} book={book} onOpen={() => setSelectedBook(book)} />
                  ))}
                </div>
                <div aria-hidden className="absolute inset-x-0 bottom-1 h-7 rounded-md border-y-4 border-[#6b351c] bg-gradient-to-b from-[#b96f35] to-[#7a3f21] shadow-[0_12px_18px_rgba(62,31,13,.35)]" />
                <div aria-hidden className="absolute inset-x-4 bottom-0 h-2 rounded-b-full bg-[#4d2819]" />
              </section>
            ))}
          </div>
        </section>

        <p className="mt-5 text-center font-bold text-slate-700">Pick a story to watch Archie step out from its cover.</p>
      </div>
    </main>
  );
}
