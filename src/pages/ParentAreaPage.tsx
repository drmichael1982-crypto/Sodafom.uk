import { Helmet } from '@dr.pogodin/react-helmet';
import { Bell, ChevronRight, ClipboardCheck, CreditCard, LogIn, Trophy, UserRoundCog } from 'lucide-react';
import { useNavigate } from 'react-router';
import FeaturePageShell from '@/components/FeaturePageShell';

const PARENT_CHOICES = [
  { title: 'Parent Dashboard', text: 'See children, learning activity and account controls.', icon: UserRoundCog, route: '/parent-dashboard', colour: 'from-blue-500 to-indigo-800' },
  { title: 'Chores & Pocket Money', text: 'Create chores, choose values and approve completed jobs.', icon: ClipboardCheck, route: '/parent-dashboard/chores', colour: 'from-teal-500 to-cyan-800' },
  { title: 'Progress', text: 'See stars, lessons and recent learning.', icon: Trophy, route: '/hub/progress', colour: 'from-purple-500 to-fuchsia-800' },
  { title: 'Profiles', text: 'Manage the parent account and child profiles.', icon: UserRoundCog, route: '/hub/profile', colour: 'from-orange-500 to-red-700' },
  { title: 'Subscription', text: 'View the current plan or cancellation controls.', icon: CreditCard, route: '/hub/subscription', colour: 'from-sky-500 to-blue-800' },
  { title: 'Sign in', text: 'Securely open an existing parent account.', icon: LogIn, route: '/hub/login', colour: 'from-violet-500 to-purple-900' },
] as const;

export default function ParentAreaPage() {
  const navigate = useNavigate();
  return (
    <>
      <Helmet><title>Parent Area — Sodafom</title></Helmet>
      <FeaturePageShell title="Parent Area" subtitle="Profiles, progress, chores and account controls." emoji="👨‍👩‍👧" accent="from-sky-500 via-blue-700 to-indigo-950" backTo="/">
        <section className="mb-5 rounded-[2rem] border-4 border-yellow-300/80 bg-white/95 p-5 text-blue-950 shadow-2xl">
          <p className="flex items-start gap-3 font-bold"><Bell className="mt-0.5 shrink-0 text-orange-500" /> Parent controls remain protected by sign-in. Children cannot approve their own chores, alter payments or change account settings.</p>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PARENT_CHOICES.map((choice) => (
            <button key={choice.title} type="button" onClick={() => navigate(choice.route)} className={`relative min-h-48 rounded-[2rem] border-4 border-white/80 bg-gradient-to-br ${choice.colour} p-5 text-left text-white shadow-2xl active:scale-95`}>
              <choice.icon size={38} />
              <h2 className="mt-4 text-xl font-black">{choice.title}</h2>
              <p className="mt-2 text-sm font-bold text-white/85">{choice.text}</p>
              <ChevronRight className="absolute bottom-4 right-4" />
            </button>
          ))}
        </section>
      </FeaturePageShell>
    </>
  );
}
