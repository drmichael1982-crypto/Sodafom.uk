import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Clock3, Play, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import FeaturePageShell from '@/components/FeaturePageShell';
import { ttsSpeak } from '@/lib/voice-context';
import { CURRICULUM_DAYS, type CurriculumAgeGroup, type CurriculumSubject } from '@/lib/tutor/curriculum-year-plan';

const SUBJECTS: Array<{ name: CurriculumSubject; label?: string; emoji: string; colour: string }> = [
  { name: 'Maths', emoji: '🔢', colour: 'from-blue-500 to-indigo-700' },
  { name: 'English', emoji: '✍️', colour: 'from-purple-500 to-fuchsia-700' },
  { name: 'Reading', emoji: '📖', colour: 'from-emerald-500 to-green-700' },
  { name: 'Spelling', emoji: '🔤', colour: 'from-red-500 to-rose-700' },
  { name: 'Science', emoji: '🔬', colour: 'from-emerald-500 to-green-700' },
  { name: 'Geography', emoji: '🌍', colour: 'from-cyan-500 to-sky-700' },
  { name: 'History', emoji: '🏛️', colour: 'from-amber-500 to-orange-700' },
  { name: 'Computing', label: 'Technology', emoji: '💻', colour: 'from-slate-500 to-blue-800' },
  { name: 'Design & Technology', emoji: '🛠️', colour: 'from-orange-500 to-red-700' },
  { name: 'Art & Design', emoji: '🎨', colour: 'from-pink-500 to-purple-700' },
  { name: 'Music', emoji: '🎵', colour: 'from-violet-500 to-indigo-700' },
  { name: 'PE', emoji: '🏃', colour: 'from-lime-500 to-emerald-700' },
  { name: 'RE', emoji: '🕊️', colour: 'from-yellow-500 to-amber-700' },
  { name: 'PSHE', emoji: '💚', colour: 'from-teal-500 to-emerald-700' },
  { name: 'French', emoji: '🇫🇷', colour: 'from-blue-500 to-red-600' },
  { name: 'German', emoji: '🇩🇪', colour: 'from-amber-400 to-red-700' },
];

const DURATIONS = [15, 20, 30, 60] as const;
const AGE_GROUPS: Array<{ value: CurriculumAgeGroup; label: string }> = [
  { value: '5-7', label: 'Ages 5–7 · KS1' },
  { value: '8-10', label: 'Ages 8–10 · KS2' },
  { value: '11-13', label: 'Ages 11–13 · KS3' },
];

export default function LessonsPage() {
  const navigate = useNavigate();
  const [minutes, setMinutes] = useState<(typeof DURATIONS)[number]>(30);
  const [ageGroup, setAgeGroup] = useState<CurriculumAgeGroup>('8-10');
  const [lessonDay, setLessonDay] = useState(1);

  useEffect(() => {
    const storedAge = localStorage.getItem('sodafom_lesson_age');
    if (storedAge === '5-7' || storedAge === '8-10' || storedAge === '11-13') setAgeGroup(storedAge);
    const storedDay = Number(localStorage.getItem('sodafom_lesson_day'));
    if (Number.isInteger(storedDay) && storedDay >= 1 && storedDay <= CURRICULUM_DAYS) setLessonDay(storedDay);
  }, []);

  const startLesson = (subject: CurriculumSubject) => {
    localStorage.setItem('sodafom_lesson_subject', subject);
    localStorage.setItem('sodafom_lesson_minutes', String(minutes));
    localStorage.setItem('sodafom_lesson_age', ageGroup);
    localStorage.setItem('sodafom_lesson_day', String(lessonDay));
    ttsSpeak(`Starting day ${lessonDay} of your ${minutes} minute ${subject} lesson with Archie.`);
    navigate('/tutor');
  };

  return (
    <>
      <Helmet>
        <title>Archie&apos;s Lessons — Sodafom</title>
        <meta name="description" content="Choose an age-friendly Sodafom lesson with Archie." />
      </Helmet>
      <FeaturePageShell title="Archie's Lessons" subtitle="Choose an age, a day and a subject from the 365-day learning path." emoji="🎓" accent="from-blue-500 via-purple-600 to-indigo-900">
        <section className="mb-6 rounded-[2rem] border-4 border-white/70 bg-white/95 p-5 text-sky-950 shadow-xl">
          <h2 className="text-xl font-black">1. Who is learning?</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {AGE_GROUPS.map(age => (
              <button
                key={age.value}
                type="button"
                onClick={() => setAgeGroup(age.value)}
                aria-pressed={ageGroup === age.value}
                className={`min-h-14 rounded-2xl border-2 px-3 font-black transition ${ageGroup === age.value ? 'border-sky-700 bg-sky-600 text-white shadow-lg' : 'border-sky-200 bg-sky-50 text-sky-900'}`}
              >
                {age.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 rounded-2xl bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="lesson-day" className="font-black text-indigo-950">Learning path day</label>
            <div className="flex items-center gap-2">
              <input
                id="lesson-day"
                type="number"
                min={1}
                max={CURRICULUM_DAYS}
                value={lessonDay}
                onChange={event => setLessonDay(Math.min(CURRICULUM_DAYS, Math.max(1, Number(event.target.value) || 1)))}
                className="min-h-12 w-24 rounded-xl border-2 border-indigo-300 bg-white px-3 text-center text-lg font-black text-indigo-950"
              />
              <span className="font-black text-indigo-800">of {CURRICULUM_DAYS}</span>
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-600">Curriculum-informed planning for England. A school or qualified teacher should review plans before formal classroom adoption.</p>
        </section>

        <section className="mb-6 rounded-[2rem] border-4 border-white/70 bg-white/95 p-5 text-sky-950 shadow-xl">
          <h2 className="flex items-center gap-2 text-xl font-black"><Clock3 className="text-purple-600" /> 2. How long should the lesson be?</h2>
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

        <h2 className="mb-3 text-xl font-black text-white drop-shadow">3. Choose a subject</h2>
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Lesson subjects">
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
              <h2 className="mt-3 text-lg font-black">{subject.label ?? subject.name}</h2>
              <p className="mt-1 text-xs font-bold text-white/85">{subject.label ? `${subject.name} · ` : ''}Day {lessonDay} · {minutes} minutes</p>
              <Play className="mx-auto mt-3" size={20} fill="currentColor" />
            </motion.button>
          ))}
        </section>
      </FeaturePageShell>
    </>
  );
}
