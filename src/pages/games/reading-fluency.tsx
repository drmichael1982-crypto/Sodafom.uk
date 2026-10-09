import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import { READING_FLUENCY_BANKS } from '@/lib/archie/reading-practice-banks';

export default function ReadingFluencyGame() {
  return (
    <>
      <Helmet>
        <title>Reading Fluency — Sodafom</title>
        <meta name="description" content="Build your reading fluency and expression!" />
        <link rel="canonical" href="https://sodafom.uk/games/reading-fluency" />
        <meta property="og:title" content="Reading Fluency — Sodafom" />
        <meta property="og:description" content="Build your reading fluency and expression!" />
        <meta property="og:url" content="https://sodafom.uk/games/reading-fluency" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Reading Fluency — English Game for Kids — Sodafom</h1>
      <GameShell title="Reading Fluency" emoji="📝" subject="reading" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <div><p className="mx-auto max-w-lg p-4 text-center text-sm">Read aloud if you like. Practise clear words, meaningful pauses and expression. This game checks your choices, not your spoken voice.</p><LevelledQuizEngine
            gameSlug="reading-fluency"
            title="Reading Fluency"
            emoji="📝"
            questionsByLevel={READING_FLUENCY_BANKS}
            accentClass="bg-accent"
            onComplete={oc}
          /></div>
        )}
      </GameShell>
    </>
  );
}
