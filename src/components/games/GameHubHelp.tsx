import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useArchieContext } from '@/contexts/ArchieContext';

export default function GameHubHelp({ title, subject }: { title: string; subject: string }) {
  const { openArchie, setGameContext, clearGameContext } = useArchieContext();
  useEffect(() => {
    setGameContext(title, subject);
    return clearGameContext;
  }, [title, subject, setGameContext, clearGameContext]);

  return <div role="group" aria-label="Game menu help" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
    <p className="font-bold text-blue-950">Need help choosing?</p>
    <button type="button" onClick={() => openArchie()} className="min-h-11 flex items-center gap-2 rounded-xl border-2 border-blue-300 bg-white px-4 py-2 font-black text-blue-900 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
      <MessageCircle size={20} aria-hidden="true" /> Ask Archie
    </button>
  </div>;
}
