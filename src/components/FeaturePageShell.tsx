import type { ReactNode } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router';
import ArchieCharacter from './ArchieCharacter';

interface FeaturePageShellProps {
  title: string;
  subtitle: string;
  emoji: string;
  children: ReactNode;
  accent?: string;
  backTo?: string;
}

export default function FeaturePageShell({
  title,
  subtitle,
  emoji,
  children,
  accent = 'from-sky-500 via-blue-600 to-indigo-800',
  backTo = '/archie-menu',
}: FeaturePageShellProps) {
  const navigate = useNavigate();

  return (
    <main className={`min-h-screen bg-gradient-to-b ${accent} px-4 py-5 pb-28`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-white/70 bg-white/95 px-4 font-black text-sky-950 shadow-lg active:scale-95"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Go to Sodafom home"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/70 bg-white/95 text-sky-950 shadow-lg active:scale-95"
          >
            <Home size={22} />
          </button>
        </div>

        <section className="mb-6 overflow-hidden rounded-[2rem] border-4 border-white/70 bg-white/95 p-5 text-sky-950 shadow-2xl sm:p-7">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <ArchieCharacter size={90} />
              <span className="absolute -right-1 -top-1 text-3xl" aria-hidden="true">{emoji}</span>
            </div>
            <div>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
              <p className="mt-1 font-bold text-sky-700">{subtitle}</p>
            </div>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}
