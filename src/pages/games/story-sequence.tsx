import { useEffect, useMemo, useRef, useState } from 'react';
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
    hint: 'Think about the beginning: the puppy wanders away before someone finds it. What can happen after that?',
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
    hint: 'The children need their equipment before they can mix anything. Results are written after observing what happens.',
  },
];

function SequenceInner({ onComplete }: { onComplete: (r: GameResult) => void }) {
  const [storyIdx, setStoryIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const [neededRetry, setNeededRetry] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);
  const story = STORIES[storyIdx];
  const parts = useMemo(() => {
    const shuffled = [...story.parts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [story]);

  function tap(id: string) {
    if (feedback || selected.includes(id)) return;
    const next = [...selected, id];
    setSelected(next);
    if (next.length === story.parts.length) {
      const isCorrect = next.every((v, i) => v === story.order[i]);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (!isCorrect) { setNeededRetry(true); return; }
      const nc = correct + (neededRetry ? 0 : 1);
      advanceTimer.current = setTimeout(() => {
        setFeedback(null);
        const nr = storyIdx + 1;
        if (nr >= STORIES.length) {
          const score = Math.round((nc / STORIES.length) * 100);
          onComplete({ score, correct: nc, total: STORIES.length, stars: score >= 90 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0 });
        } else { setStoryIdx(nr); setCorrect(nc); setSelected([]); setNeededRetry(false); }
      }, 1200);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 p-4 max-w-md mx-auto">
      <p className="font-black text-lg text-center">{story.title}</p>
      <p className="text-sm text-muted-foreground text-center">Tap the sentences in the correct order (1st to last)</p>
      <div className="flex flex-col gap-3 w-full">
        {parts.map((part, i) => (
          <motion.button key={`${storyIdx}:${part.id}`} type="button" disabled={Boolean(feedback) || selected.includes(part.id)} whileTap={{ scale: 0.98 }} onClick={() => tap(part.id)}
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
        {feedback && <motion.p role="status" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}
          className={`text-xl font-black ${feedback === 'correct' ? 'text-primary' : 'text-secondary'}`}>
          {feedback === 'correct' ? '✅ Correct order!' : 'Not quite yet. Use the clue and try again.'}
        </motion.p>}
      </AnimatePresence>
      {feedback === 'wrong' && <><p>{story.hint}</p><button className="a-button" type="button" onClick={() => { setSelected([]); setFeedback(null); }}>Try the same story again</button></>}
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
