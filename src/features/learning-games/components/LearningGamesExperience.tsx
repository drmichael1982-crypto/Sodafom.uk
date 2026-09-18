import { useState } from "react";
import type { LearningProgressSink, LearningRewardHook } from "../progress";
import type {
  GameAttemptReceipt,
  LearningAgeBand,
  LearningGameDefinition,
} from "../types";
import { LearningGameLauncher } from "./LearningGameLauncher";
import { MultipleChoiceLearningGame } from "./MultipleChoiceLearningGame";

export interface LearningGamesExperienceProps {
  learnerAgeBand?: LearningAgeBand;
  attemptsByGameId?: Readonly<Record<string, GameAttemptReceipt>>;
  onProgress?: LearningProgressSink;
  onReward?: LearningRewardHook;
  onReadAloud?: (text: string) => void;
}

export function LearningGamesExperience(props: LearningGamesExperienceProps) {
  const [activeGame, setActiveGame] = useState<LearningGameDefinition | null>(
    null,
  );

  if (!activeGame) {
    return (
      <LearningGameLauncher
        learnerAgeBand={props.learnerAgeBand}
        onLaunch={setActiveGame}
      />
    );
  }

  return (
    <MultipleChoiceLearningGame
      definition={activeGame}
      attempt={props.attemptsByGameId?.[activeGame.id]}
      onExit={() => setActiveGame(null)}
      onProgress={props.onProgress}
      onReward={props.onReward}
      onReadAloud={props.onReadAloud}
    />
  );
}
