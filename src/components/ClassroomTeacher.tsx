import { motion, useReducedMotion } from 'motion/react';
import type { TeacherAssignment } from '@/lib/tutor/classroom-system';

export interface ClassroomTeacherProps {
  teacher: TeacherAssignment;
  speaking?: boolean;
  demonstrating?: boolean;
  compact?: boolean;
}

/**
 * Animates only existing approved character artwork. It deliberately avoids
 * replacing or redrawing characters so the approved designs remain intact.
 */
export default function ClassroomTeacher({
  teacher,
  speaking = false,
  demonstrating = false,
  compact = false,
}: ClassroomTeacherProps) {
  const reduceMotion = useReducedMotion();
  const size = compact ? 'h-36 sm:h-44' : 'h-48 sm:h-64';

  const animation = reduceMotion
    ? undefined
    : demonstrating
      ? { rotate: [0, -2, 2, -1, 0], scale: [1, 1.025, 1.01, 1.025, 1] }
      : speaking
        ? { rotate: [0, -0.8, 0.8, 0], scale: [1, 1.018, 1] }
        : { rotate: [0, 0.35, 0, -0.35, 0], scale: [1, 1.008, 1] };

  return (
    <figure className="relative flex min-w-28 flex-col items-center justify-end" aria-label={`${teacher.name}, ${teacher.role}`}>
      <motion.img
        src={teacher.image}
        alt={teacher.name}
        className={`${size} w-auto max-w-full object-contain drop-shadow-2xl`}
        style={{ transformOrigin: '50% 92%' }}
        animate={animation}
        transition={reduceMotion ? undefined : {
          duration: demonstrating ? 1.25 : speaking ? 0.7 : 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <figcaption className="-mt-1 max-w-52 rounded-xl border-2 border-white/80 bg-slate-950/85 px-3 py-1.5 text-center text-xs font-black text-white shadow-lg">
        {teacher.name}
        <span className="block text-[10px] font-bold text-cyan-100">{speaking ? 'Teaching now' : demonstrating ? 'Demonstrating' : teacher.role}</span>
      </figcaption>
      <span className="sr-only" aria-live="polite">{speaking ? `${teacher.name} is speaking` : ''}</span>
    </figure>
  );
}
