import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import DailyLearningDashboard from '@/components/DailyLearningDashboard';

export default function DailyLearningPage() {
  return (
    <>
      <Helmet>
        <title>Daily Learning — Sodafom</title>
        <meta name="description" content="A gentle, read-only view of saved daily learning progress for the selected child profile." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <Link to="/hub" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 font-bold text-primary hover:bg-primary/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary">
            <ArrowLeft size={18} aria-hidden="true" /> Parent Hub
          </Link>
          <header className="mb-6 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 font-black text-primary"><CalendarDays size={18} aria-hidden="true" /> Daily learning</div>
            <h1 className="text-3xl font-black text-foreground sm:text-4xl">Small steps, your pace</h1>
            <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">A read-only view of activity already saved to the selected learner profile. Rest days are always okay.</p>
          </header>
          <DailyLearningDashboard />
        </div>
      </main>
    </>
  );
}
