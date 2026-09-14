/**
 * Shared episode contract for the Sodafom cartoon catalogue.
 *
 * Agent 22's reusable engine was not present on the repository when this
 * episode was made. Keeping episode data separate from the renderer means its
 * engine can consume this manifest without rewriting the story or controls.
 */

export type CartoonActorKind = 'character' | 'dinosaur' | 'prop';

export type CartoonActor = {
  id: string;
  label: string;
  kind: CartoonActorKind;
  /** Existing approved asset path. Omit for label-only dinosaur callouts. */
  asset?: string;
  emoji?: string;
  side: 'left' | 'centre' | 'right';
  entrance?: 'walk' | 'float' | 'pop' | 'still';
};

export type CartoonQuestion = {
  prompt: string;
  choices: string[];
  answer: string;
  correctResponse: string;
  tryAgainResponse: string;
};

export type CartoonScene = {
  id: string;
  title: string;
  /** Planned screen time at normal playback speed. */
  durationSeconds: number;
  setting: string;
  speaker: string;
  dialogue: string;
  fact: string;
  cast: CartoonActor[];
  question?: CartoonQuestion;
};

export type CartoonEpisodeManifest = {
  id: string;
  title: string;
  ageRange: '5–12';
  targetDurationSeconds: number;
  subtitleDefault: true;
  engine: {
    contractVersion: '1.0';
    preferredRenderer: 'SOD-CARTOON-ENGINE-22';
    integrationStatus: 'ready-for-agent-22-engine';
  };
  audio: {
    narration: 'browser-or-native-tts';
    founderVoice: 'not-used-no-approved-founder-asset-on-branch';
    music: 'gentle-synth-underscore';
    effects: 'gentle-synth-cues';
  };
  scenes: CartoonScene[];
};

export function getEpisodeRuntimeSeconds(episode: CartoonEpisodeManifest): number {
  return episode.scenes.reduce((total, scene) => total + scene.durationSeconds, 0);
}
