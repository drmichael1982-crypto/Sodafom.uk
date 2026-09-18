import { useState } from "react";
import type { LearningProgressSink, LearningRewardHook } from "../progress";
import type { LearningGameDefinition } from "../types";
import { LearningGameLauncher } from "./LearningGameLauncher";
import { MultipleChoiceLearningGame } from "./MultipleChoiceLearningGame";

export interface LearningGamesExperienceProps {
  learnerAge?: number;
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
        learnerAge={props.learnerAge}
        onLaunch={setActiveGame}
      />
    );
  }

  return (
    <MultipleChoiceLearningGame
      definition={activeGame}
      onExit={() => setActiveGame(null)}
      onProgress={props.onProgress}
      onReward={props.onReward}
      onReadAloud={props.onReadAloud}
    />
  );
}
