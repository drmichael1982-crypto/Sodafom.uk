import { Helmet } from '@dr.pogodin/react-helmet';
import { BookOpen, Camera, ChevronRight, Gamepad2, Volume2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import FeaturePageShell from '@/components/FeaturePageShell';
import { ttsSpeak } from '@/lib/voice-context';
import ArchieStoryCollectionPage from './ArchieStoryCollectionPage';

const READING_CHOICES = [
  { title: "Archie’s Book Collection", text: 'Choose one of ten illustrated Archie storybooks.', icon: BookOpen, route: '/reading?books=1', colour: 'from-violet-600 to-purple-950' },
  { title: 'Reading Games', text: 'Play phonics, stories and comprehension games.', icon: Gamepad2, route: '/games/reading', colour: 'from-emerald-500 to-green-800' },
  { title: 'Read With Archie', text: 'Photograph a book page for help with tricky words.', icon: Camera, route: '/ai-teacher', colour: 'from-purple-500 to-indigo-800' },
  { title: 'Archie Reading Lesson', text: 'Start a spoken reading lesson with Archie.', icon: Volume2, route: '/lessons', colour: 'from-orange-500 to-rose-700' },
] as const;

export default function ReadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  if (searchParams.get('books') === '1') return <ArchieStoryCollectionPage />;
  return (
    <>
      <Helmet><title>Reading With Archie — Sodafom</title></Helmet>
      <FeaturePageShell title="Reading With Archie" subtitle="Stories, phonics and reading help in one colourful place." emoji="📚" accent="from-emerald-500 via-blue-700 to-purple-950" backTo="/">
        <section className="relative mb-6 min-h-72 overflow-hidden rounded-[2rem] border-4 border-white/80 shadow-2xl">
          <img src="/assets/cartoon/worlds/reading.png" alt="A magical floating reading world" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <h2 className="flex items-center gap-2 text-2xl font-black"><BookOpen /> Enter the Word Kingdom</h2>
            <p className="mt-1 max-w-lg font-bold text-white/90">Choose a reading activity and Archie will help whenever a word feels difficult.</p>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {READING_CHOICES.map((choice) => (
            <button key={choice.title} type="button" onClick={() => { ttsSpeak(choice.title); navigate(choice.route); }} className={`relative min-h-52 overflow-hidden rounded-[2rem] border-4 border-white/80 bg-gradient-to-br ${choice.colour} p-5 text-left text-white shadow-2xl active:scale-95`}>
              <choice.icon size={38} />
              <h2 className="mt-5 text-xl font-black">{choice.title}</h2>
              <p className="mt-2 text-sm font-bold text-white/85">{choice.text}</p>
              <ChevronRight className="absolute bottom-4 right-4" />
            </button>
          ))}
        </section>
      </FeaturePageShell>
    </>
  );
}
