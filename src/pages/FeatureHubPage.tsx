import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { ChevronRight, Clock3 } from 'lucide-react';
import { useNavigate } from 'react-router';
import FeaturePageShell from '@/components/FeaturePageShell';

const FEATURES = [
  { title: "Archie's Lessons", description: 'Choose a subject and a 15, 20, 30 or 60-minute lesson.', emoji: '🎓', route: '/lessons', colour: 'from-blue-500 to-indigo-700' },
  { title: 'Games', description: 'Maths, reading, spelling, science and more learning games.', emoji: '🎮', route: '/classic-home', colour: 'from-fuchsia-500 to-purple-700' },
  { title: 'Reading', description: 'Reading practice, phonics, stories and comprehension.', emoji: '📚', route: '/games/reading', colour: 'from-emerald-500 to-green-700' },
  { title: 'Homework Helper', description: 'Photograph homework and ask Archie for a clear explanation.', emoji: '📸', route: '/homework-helper', colour: 'from-orange-500 to-amber-700' },
  { title: 'Ask Archie', description: 'Ask a learning question by typing or speaking.', emoji: '🗝️', route: '/ask-archie', colour: 'from-cyan-500 to-blue-700' },
  { title: 'Birthday', description: 'Save a birthday on this device and see the countdown.', emoji: '🎂', route: '/birthday', colour: 'from-pink-500 to-rose-700' },
  { title: 'Pocket Money & Chores', description: 'See chores, mark them done and wait for parent approval.', emoji: '🧹', route: '/pocket-money', colour: 'from-lime-500 to-emerald-700' },
  { title: 'Parent Chore Setup', description: 'Parents create chores, choose rewards and approve completion.', emoji: '👨‍👩‍👧', route: '/pocket-money/setup', colour: 'from-teal-500 to-cyan-700' },
  { title: "Design Archie's Outfit", description: 'Choose colours, a badge and a fun accessory.', emoji: '🎨', route: '/archie-outfit', colour: 'from-violet-500 to-fuchsia-700' },
  { title: 'Seasonal Themes', description: 'Choose Everyday, Christmas or Easter decorations.', emoji: '🎄', route: '/seasonal-themes', colour: 'from-red-500 to-green-700' },
  { title: 'Parent Area', description: 'Open progress, child profiles and account controls.', emoji: '📊', route: '/parent-dashboard', colour: 'from-slate-600 to-sky-800' },
  { title: 'Holiday & Travel', description: 'A future learning section — clearly marked as planned.', emoji: '✈️', route: '/holiday-travel', colour: 'from-amber-500 to-sky-700', planned: true },
] as const;

export default function FeatureHubPage() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Archie&apos;s Menu — Sodafom</title>
        <meta name="description" content="Open Sodafom lessons, games, reading, homework help and family features." />
      </Helmet>
      <FeaturePageShell title="Archie's Menu" subtitle="Choose what you would like to do." emoji="🌈" backTo="/">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Sodafom activities">
          {FEATURES.map((feature, index) => (
            <motion.button
              key={feature.title}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.35) }}
              whileHover={{ y: -4, scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(feature.route)}
              className={`relative min-h-48 overflow-hidden rounded-[2rem] border-4 border-white/70 bg-gradient-to-br ${feature.colour} p-5 text-left text-white shadow-xl`}
            >
              {'planned' in feature && feature.planned && (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase text-sky-900">
                  <Clock3 size={13} /> Future plan
                </span>
              )}
              <span className="text-5xl" aria-hidden="true">{feature.emoji}</span>
              <h2 className="mt-3 text-xl font-black">{feature.title}</h2>
              <p className="mt-1 pr-6 text-sm font-bold text-white/85">{feature.description}</p>
              <ChevronRight className="absolute bottom-4 right-4" size={28} />
            </motion.button>
          ))}
        </section>
      </FeaturePageShell>
    </>
  );
}
