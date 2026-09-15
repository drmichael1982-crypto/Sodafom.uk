import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Clock3 } from 'lucide-react';
import ClassroomTeacher from '@/components/ClassroomTeacher';
import {
  classroomMoment,
  getEnvironment,
  getPeFocus,
  type TeacherAssignment,
} from '@/lib/tutor/classroom-system';

interface ClassroomSceneProps {
  subject: string;
  day: number;
  childName: string;
  teacher: TeacherAssignment;
  speaking: boolean;
  demonstrating: boolean;
  progressPercent: number;
  stageLabel: string;
  secondsRemaining: number;
}

const ENVIRONMENT_LABELS = {
  classroom: 'Classroom',
  'football-field': 'Football field',
  'sports-hall': 'Sports hall',
  'athletics-track': 'Athletics track',
  'outdoor-field': 'Outdoor practice area',
} as const;

function PeBackdrop({ environment }: { environment: ReturnType<typeof getEnvironment> }) {
  if (environment === 'football-field') {
    return <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-600"><div className="absolute inset-x-[8%] bottom-[8%] top-[42%] rounded-t-[45%] border-4 border-white/90" /><div className="absolute bottom-[8%] left-1/2 top-[42%] w-1 -translate-x-1/2 bg-white/80" /></div>;
  }
  if (environment === 'athletics-track') {
    return <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-emerald-200 to-emerald-500"><div className="absolute inset-x-[4%] bottom-[7%] top-[45%] rounded-[50%] border-[18px] border-orange-600/90 ring-2 ring-white/70" /><div className="absolute inset-x-[9%] bottom-[13%] top-[51%] rounded-[50%] border-2 border-white/80" /></div>;
  }
  if (environment === 'outdoor-field') {
    return <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-lime-500"><div className="absolute inset-x-[8%] bottom-[9%] h-1/3 rounded-[50%] border-2 border-white/60" /></div>;
  }
  return <div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-sky-100 to-amber-200"><div className="absolute inset-x-[7%] bottom-[8%] top-[25%] rounded-3xl border-[10px] border-slate-300 bg-gradient-to-b from-sky-100 to-slate-100" /><div className="absolute left-1/2 top-[30%] h-[55%] w-1 -translate-x-1/2 bg-slate-300" /></div>;
}

export default function ClassroomScene({
  subject,
  day,
  childName,
  teacher,
  speaking,
  demonstrating,
  progressPercent,
  stageLabel,
  secondsRemaining,
}: ClassroomSceneProps) {
  const reduceMotion = useReducedMotion();
  const [now, setNow] = useState(() => new Date());
  const environment = getEnvironment(subject, day);
  const peFocus = subject === 'PE' ? getPeFocus(day) : null;
  const moment = useMemo(() => classroomMoment(day), [day]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const wallClock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(now);
  const remainingMinutes = Math.floor(secondsRemaining / 60);
  const remainingSeconds = secondsRemaining % 60;

  return (
    <section className="relative min-h-[410px] overflow-hidden rounded-[2rem] border-4 border-white/90 shadow-2xl" aria-label={`${ENVIRONMENT_LABELS[environment]} lesson scene`}>
      {environment === 'classroom' ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/assets/approved/lessons.png')" }} aria-hidden="true" />
      ) : (
        <PeBackdrop environment={environment} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/5 via-transparent to-slate-950/45" aria-hidden="true" />

      <div className="relative z-10 flex items-start justify-between gap-2 p-3 text-xs font-black sm:p-4">
        <div className="rounded-2xl border-2 border-white/80 bg-slate-950/80 px-3 py-2 text-white shadow-lg">
          <span className="block text-cyan-200">{ENVIRONMENT_LABELS[environment]}</span>
          <span>{subject === 'PE' && peFocus ? peFocus.label : subject} · {stageLabel}</span>
        </div>
        <div className="grid gap-2 text-right sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-white/80 bg-white/95 px-3 py-2 text-slate-900 shadow-lg" aria-label={`Wall clock ${wallClock}`}>
            <span className="flex items-center justify-end gap-1 text-[10px] uppercase text-slate-500"><Clock3 size={12} /> Wall clock</span>
            <time className="tabular-nums">{wallClock}</time>
          </div>
          <div className="rounded-2xl border-2 border-white/80 bg-indigo-950/90 px-3 py-2 text-white shadow-lg" aria-label={`${remainingMinutes} minutes ${remainingSeconds} seconds lesson time remaining`}>
            <span className="block text-[10px] uppercase text-indigo-200">Lesson time</span>
            <span className="tabular-nums">{String(remainingMinutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[245px] max-w-3xl items-end justify-center px-4 pb-20 pt-6">
        {environment === 'classroom' && (
          <div className="absolute inset-x-5 bottom-16 flex items-end justify-between opacity-90 sm:inset-x-12" aria-label="Classmates learning quietly">
            {[
              ['/assets/cartoon/friends/mia.png', 'Mia'],
              ['/assets/cartoon/friends/toby.png', 'Toby'],
            ].map(([src, name], index) => (
              <motion.img
                key={name}
                src={src}
                alt={`${name} learning at a classroom desk`}
                className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                animate={reduceMotion ? undefined : { rotate: index === 0 ? [0, 0.8, 0] : [0, -0.8, 0], y: [0, -1.5, 0] }}
                transition={reduceMotion ? undefined : { duration: 4 + index, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>
        )}
        <ClassroomTeacher teacher={teacher} speaking={speaking} demonstrating={demonstrating} />
      </div>

      {moment && environment === 'classroom' && (
        <div className="absolute bottom-20 left-1/2 z-20 max-w-[80%] -translate-x-1/2 rounded-xl border border-white/70 bg-white/90 px-3 py-1.5 text-center text-[11px] font-bold text-slate-700 shadow" aria-live="polite">
          {moment}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 border-t-4 border-amber-950/50 bg-gradient-to-b from-amber-600 to-amber-900 px-4 pb-3 pt-2 shadow-2xl" aria-label={`${childName}'s desk`}>
        <div className="mx-auto mb-2 h-2 max-w-lg overflow-hidden rounded-full bg-black/25" aria-label={`Lesson progress ${Math.round(progressPercent)} percent`}>
          <div className="h-full bg-white transition-[width] duration-500" style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }} />
        </div>
        <div className="mx-auto w-fit rounded-lg border-2 border-amber-950/40 bg-amber-100 px-5 py-1 text-sm font-black text-amber-950 shadow-inner">
          {childName || 'Learner'}
        </div>
      </div>
    </section>
  );
}
