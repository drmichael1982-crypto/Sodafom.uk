import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Clock3, Play, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import FeaturePageShell from '@/components/FeaturePageShell';
import { ttsSpeak } from '@/lib/voice-context';

const SUBJECTS = [
  { name: 'Maths', emoji: '🔢', colour: 'from-blue-500 to-indigo-700' },
  { name: 'English', emoji: '✍️', colour: 'from-purple-500 to-fuchsia-700' },
  { name: 'Science', emoji: '🔬', colour: 'from-emerald-500 to-green-700' },
  { name: 'Geography', emoji: '🌍', colour: 'from-cyan-500 to-sky-700' },
  { name: 'History', emoji: '🏛️', colour: 'from-amber-500 to-orange-700' },
  { name: 'Technology', emoji: '💻', colour: 'from-slate-500 to-blue-800' },
  { name: 'PE', emoji: '🏃', colour: 'from-lime-500 to-emerald-700' },
  { name: 'Spelling', emoji: '🔤', colour: 'from-red-500 to-rose-700' },
  { name: 'French', emoji: '🇫🇷', colour: 'from-blue-500 to-red-600' },
  { name: 'German', emoji: '🇩🇪', colour: 'from-amber-400 to-red-700' },
] as const;

const DURATIONS = [15, 20, 30, 60] as const;

export default function LessonsPage() {
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState<(typeof DURATIONS)[number]>(30);

  const startLesson = (subject: string) => {
    localStorage.setItem('sodafom_lesson_subject', subject);
    localStorage.setItem('sodafom_lesson_minutes', String(minutes));
    ttsSpeak(`Starting your ${minutes} minute ${subject} lesson with Archie.`);
    navigate('/tutor');
  };

  return (
    <>
      <Helmet>
        <title>Archie&apos;s Lessons — Sodafom</title>
        <meta name="description" content="Choose an age-friendly Sodafom lesson with Archie." />
      </Helmet>
      <FeaturePageShell title="Archie's Lessons" subtitle="Choose the lesson time, then choose a subject." emoji="🎓" accent="from-blue-500 via-purple-600 to-indigo-900">
        <section className="mb-6 rounded-[2rem] border-4 border-white/70 bg-white/95 p-5 text-sky-950 shadow-xl">
          <h2 className="flex items-center gap-2 text-xl font-black"><Clock3 className="text-purple-600" /> How long should the lesson be?</h2>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {DURATIONS.map(duration => (
              <button
                key={duration}
                type="button"
                onClick={() => setMinutes(duration)}
                aria-pressed={minutes === duration}
                className={`min-h-14 rounded-2xl border-2 px-2 font-black transition ${minutes === duration ? 'border-purple-700 bg-purple-600 text-white shadow-lg' : 'border-purple-200 bg-purple-50 text-purple-900'}`}
              >
                {duration} min
              </button>
            ))}
          </div>
          <button type="button" onClick={() => ttsSpeak(`Your lesson will last ${minutes} minutes. Now choose a subject.`)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-sky-900">
            <Volume2 size={17} /> Read this aloud
          </button>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Lesson subjects">
          {SUBJECTS.map(subject => (
            <motion.button
              key={subject.name}
              type="button"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => startLesson(subject.name)}
              className={`relative min-h-44 rounded-[1.75rem] border-4 border-white/75 bg-gradient-to-br ${subject.colour} p-4 text-white shadow-xl`}
            >
              <span className="text-5xl" aria-hidden="true">{subject.emoji}</span>
              <h2 className="mt-3 text-lg font-black">{subject.name}</h2>
              <p className="mt-1 text-xs font-bold text-white/85">{minutes}-minute lesson</p>
              <Play className="mx-auto mt-3" size={20} fill="currentColor" />
            </motion.button>
          ))}
        </section>
      </FeaturePageShell>
    </>
  );
}
