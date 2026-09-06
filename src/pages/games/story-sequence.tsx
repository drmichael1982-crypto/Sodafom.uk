import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';

const STORIES = [
  {
    title: 'The Lost Puppy',
    parts: [
      { id: 'a', text: 'A small puppy wandered away from home.' },
      { id: 'b', text: 'A kind girl found the puppy shivering in the rain.' },
      { id: 'c', text: 'She took the puppy inside and dried it with a towel.' },
      { id: 'd', text: 'The next day, she found the owner and returned the puppy safely.' },
    ],
    order: ['a','b','c','d'],
  },
  {
    title: 'The Science Experiment',
    parts: [
      { id: 'a', text: 'The teacher handed out the equipment.' },
      { id: 'b', text: 'The children mixed the chemicals carefully.' },
      { id: 'c', text: 'The mixture fizzed and turned bright blue!' },
      { id: 'd', text: 'Everyone wrote up their results in their books.' },
    ],
    order: ['a','b','c','d'],
  },
];

function SequenceInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [storyIdx, setStoryIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const story = STORIES[storyIdx];
  const shuffled = [...story.parts].sort(() => Math.random() - 0.5);
  const [parts] = useState(shuffled);

  function tap(id: string) {
    if (selected.includes(id)) return;
    const next = [...selected, id];
    setSelected(next);
    if (next.length === story.parts.length) {
      const isCorrect = next.every((v, i) => v === story.order[i]);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      const nc = correct + (isCorrect ? 1 : 0);
      setTimeout(() => {
        setFeedback(null);
        const nr = storyIdx + 1;
        if (nr >= STORIES.length) {
          const score = Math.round((nc / STORIES.length) * 100);
          onComplete({ score, correct: nc, total: STORIES.length, stars: score >= 90 ? 3 : score >= 60 ? 2 : 1 });
        } else { setStoryIdx(nr); setCorrect(nc); setSelected([]); }
      }, 1200);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4 max-w-md mx-auto">
      <p className="font-black text-lg text-center">{story.title}</p>
      <p className="text-sm text-muted-foreground text-center">Tap the sentences in the correct order (1st to last)</p>
      <div className="flex flex-col gap-3 w-full">
        {parts.map((part, i) => (
          <motion.button key={part.id} whileTap={{ scale: 0.98 }} onClick={() => tap(part.id)}
            className={`p-4 rounded-xl text-left font-medium border-2 transition-all ${
              selected.includes(part.id)
                ? 'bg-primary text-primary-foreground border-primary opacity-60'
                : 'bg-card border-border hover:border-primary'
            }`}>
            {selected.includes(part.id) && <span className="font-black mr-2">{selected.indexOf(part.id) + 1}.</span>}
            {part.text}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {feedback && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
          className={`text-xl font-black ${feedback === 'correct' ? 'text-primary' : 'text-secondary'}`}>
          {feedback === 'correct' ? '✅ Correct order!' : '❌ Not quite right!'}
        </motion.p>}
      </AnimatePresence>
    </div>
  );
}

export default function StorySequence() {
  return (
    <>
      <Helmet>
        <title>Story Sequence — Sodafom</title>
        <meta name="description" content="Put the story events in the right order. Sequence the sentences from beginning to end!" />
        <link rel="canonical" href="https://sodafom.uk/games/story-sequence" />
        <meta property="og:title" content="Story Sequence — Sodafom" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0" style={{ clip: 'rect(0,0,0,0)' }}>
        Story Sequence — Reading Game for Kids — Sodafom
      </h1>
      <GameShell title="Story Sequence" emoji="📋" subject="reading" ageGroups={['5–7', '8–10']}>
        {(oc) => <SequenceInner onComplete={oc} />}
      </GameShell>
    </>
  );
}
