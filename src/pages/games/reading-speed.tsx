import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import { READING_COMPREHENSION_BANKS } from '@/lib/archie/reading-practice-banks';

export default function ReadingSpeedGame() {
  return (
    <>
      <Helmet>
        <title>Reading Speed — Sodafom</title>
        <meta name="description" content="Read short passages, find clues and build understanding at your own pace." />
        <link rel="canonical" href="https://sodafom.uk/games/reading-speed" />
        <meta property="og:title" content="Reading Speed — Sodafom" />
        <meta property="og:description" content="Read short passages, find clues and build understanding at your own pace." />
        <meta property="og:url" content="https://sodafom.uk/games/reading-speed" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Reading Speed — English Game for Kids — Sodafom</h1>
      <GameShell title="Reading Speed" emoji="⚡" subject="reading" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <div><p className="mx-auto max-w-lg p-4 text-center text-sm">Take your time. Read or listen again, then use the passage to choose an answer. There is no reading timer.</p><LevelledQuizEngine
            gameSlug="reading-speed"
            title="Reading Speed"
            emoji="⚡"
            questionsByLevel={READING_COMPREHENSION_BANKS}
            accentClass="bg-accent"
            onComplete={oc}
          /></div>
        )}
      </GameShell>
    </>
  );
}
