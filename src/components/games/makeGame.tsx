/**
 * makeGame — factory helper for stub games using LevelledQuizEngine.
 * Generates a complete game page component from a config object.
 * This avoids repeating the same boilerplate 80 times.
 */
import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from './GameShell';
import LevelledQuizEngine from './LevelledQuizEngine';
import type { QuizQuestion } from './QuizEngine';

export interface GameConfig {
  slug: string;
  title: string;
  emoji: string;
  subject: 'maths' | 'spelling' | 'reading' | 'science';
  ageGroups: string[];
  description: string;
  accentClass?: string;
  questionsByLevel: QuizQuestion[][];
}

export function makeGame(cfg: GameConfig) {
  const siteUrl = 'https://sodafom.uk';
  return function GamePage() {
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentOptions, setCurrentOptions] = useState<string[]>([]);
    return (
      <>
        <Helmet>
          <title>{cfg.title} — Sodafom</title>
          <meta name="description" content={cfg.description} />
          <link rel="canonical" href={`${siteUrl}/games/${cfg.slug}`} />
          <meta property="og:title" content={`${cfg.title} — Sodafom`} />
          <meta property="og:image" content={`${siteUrl}/og-image.png`} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
        </Helmet>
        <h1 className="sr-only">{cfg.title} — {cfg.subject.charAt(0).toUpperCase() + cfg.subject.slice(1)} Game for Kids — Sodafom</h1>
        <GameShell title={cfg.title} emoji={cfg.emoji} subject={cfg.subject} ageGroups={cfg.ageGroups} currentQuestion={currentQuestion} currentOptions={currentOptions}>
          {(oc: (r: GameResult) => void) => (
            <LevelledQuizEngine
              gameSlug={cfg.slug}
              title={cfg.title}
              emoji={cfg.emoji}
              subject={cfg.subject}
              questionsByLevel={cfg.questionsByLevel}
              accentClass={cfg.accentClass ?? 'bg-primary'}
              onComplete={oc}
              onQuestionChange={(q, opts) => {
                setCurrentQuestion(q);
                if (opts) setCurrentOptions(opts);
              }}
            />
          )}
        </GameShell>
      </>
    );
  };
}
