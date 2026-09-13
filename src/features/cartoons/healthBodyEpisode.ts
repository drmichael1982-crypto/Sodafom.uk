/**
 * Agent 32 episode manifest.
 *
 * This is deliberately framework-neutral so Agent 22's reusable cartoon engine
 * can consume the episode without copying scene text into a page component.
 * The temporary player in HealthyBodyAdventurePage is only an adapter for this
 * manifest while the shared engine branch is unavailable.
 */

export type HealthBodySpeaker =
  "Archie" | "Soda Bot" | "Sunny" | "Daisy" | "Founder";
export type HealthBodyStage =
  | "playground"
  | "body-lab"
  | "kitchen"
  | "wash-station"
  | "team-field"
  | "quiet-garden";
export type HealthBodyTopic =
  | "exercise"
  | "safe-movement"
  | "heart-and-lungs"
  | "muscles-and-bones"
  | "balanced-food"
  | "water"
  | "sleep"
  | "hygiene"
  | "teamwork"
  | "fair-play";

export interface HealthBodyChoice {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
}

export interface HealthBodyChallenge {
  title: string;
  instruction: string;
  safeNote: string;
}

export interface HealthBodyScene {
  id: string;
  title: string;
  speaker: HealthBodySpeaker;
  /** Clearly identifies the brief Founder cameo as placeholder speech. */
  temporaryVoice?: boolean;
  stage: HealthBodyStage;
  durationSeconds: number;
  caption: string;
  topics: HealthBodyTopic[];
  challenge?: HealthBodyChallenge;
  choices?: HealthBodyChoice[];
}

export interface HealthBodyEpisode {
  id: string;
  title: string;
  ageRange: string;
  estimatedRuntimeSeconds: number;
  subtitlesDefault: true;
  temporaryFounderVoice: true;
  healthEducationOnly: true;
  existingAssetPaths: readonly string[];
  scenes: readonly HealthBodyScene[];
}

/** Existing approved artwork only — no new character or background files. */
export const HEALTH_BODY_EXISTING_ASSET_PATHS = [
  "/assets/images/archie-character-v2.png",
  "/assets/cartoon/friends/soda-bot.png",
  "/assets/cartoon/friends/sunny.png",
  "/assets/cartoon/friends/daisy.png",
  "/assets/cartoon/worlds/science.png",
] as const;

export const HEALTH_BODY_SCENES = [
  {
    id: "welcome",
    title: "The golden heart key lights up",
    speaker: "Archie",
    stage: "playground",
    durationSeconds: 10,
    caption:
      "Welcome to Archie’s Healthy Body Adventure! Today we are exploring cheerful, everyday ways to care for our amazing bodies.",
    topics: ["exercise"],
  },
  {
    id: "every-body",
    title: "Everyone joins their own way",
    speaker: "Sunny",
    stage: "playground",
    durationSeconds: 10,
    caption:
      "Bodies come in lots of wonderful shapes and sizes. You can join in your own way, at your own pace, or simply watch and cheer.",
    topics: ["exercise", "safe-movement"],
  },
  {
    id: "movement-kindness",
    title: "A kind movement rule",
    speaker: "Archie",
    stage: "playground",
    durationSeconds: 12,
    caption:
      "Our kind movement rule is simple: make space, choose a comfortable option, and stop to tell a grown-up if a movement hurts or worries you.",
    topics: ["safe-movement"],
  },
  {
    id: "warm-up",
    title: "Wake-up wiggles",
    speaker: "Daisy",
    stage: "playground",
    durationSeconds: 10,
    caption:
      "Before playful movement, a gentle warm-up can help us notice how our bodies feel. Daisy starts with tiny hand and shoulder wiggles.",
    topics: ["exercise", "safe-movement"],
  },
  {
    id: "warm-up-challenge",
    title: "Choose-your-way warm-up",
    speaker: "Daisy",
    stage: "playground",
    durationSeconds: 18,
    caption:
      "Try a choice: wiggle your fingers, roll your shoulders, march gently, or sit tall and reach one arm at a time. Every option counts.",
    topics: ["exercise", "safe-movement"],
    challenge: {
      title: "Choose-your-way warm-up",
      instruction:
        "Pick one gentle movement, or be the team’s brilliant observer.",
      safeNote: "Move only in a way that feels comfortable for you.",
    },
  },
  {
    id: "heart",
    title: "The heart drum",
    speaker: "Soda Bot",
    stage: "body-lab",
    durationSeconds: 11,
    caption:
      "Inside your chest, your heart is a strong muscle that pumps blood around your body. After playful movement, you may notice it beating a little faster.",
    topics: ["heart-and-lungs", "exercise"],
  },
  {
    id: "lungs",
    title: "The lung balloon room",
    speaker: "Sunny",
    stage: "body-lab",
    durationSeconds: 11,
    caption:
      "Your lungs help you take in air, including oxygen. A calm pause can help you notice your breathing settle after you move.",
    topics: ["heart-and-lungs"],
  },
  {
    id: "muscles-bones",
    title: "The support team",
    speaker: "Archie",
    stage: "body-lab",
    durationSeconds: 11,
    caption:
      "Muscles help us pull and move. Bones help support our bodies. Joints are the bendy meeting places that help us wave, step and stretch.",
    topics: ["muscles-and-bones"],
  },
  {
    id: "kind-choice-quiz",
    title: "The kind-choice checkpoint",
    speaker: "Daisy",
    stage: "body-lab",
    durationSeconds: 22,
    caption:
      "Quick pause-and-think: what is a kind way to move when you are joining a game?",
    topics: ["safe-movement"],
    choices: [
      {
        id: "copy",
        label: "Copy everybody, even if it feels wrong for you",
        correct: false,
        feedback:
          "Not quite. Your body gets a vote too — choose a movement that feels comfortable.",
      },
      {
        id: "comfortable",
        label: "Choose a comfortable option at your own pace",
        correct: true,
        feedback:
          "Great thinking! Moving in a comfortable way is a kind choice.",
      },
      {
        id: "push-on",
        label: "Keep going if something hurts",
        correct: false,
        feedback:
          "Nope — pause and tell a grown-up if something hurts or worries you.",
      },
    ],
  },
  {
    id: "food-variety",
    title: "The rainbow picnic",
    speaker: "Sunny",
    stage: "kitchen",
    durationSeconds: 12,
    caption:
      "Food is fuel and enjoyment too. Different foods bring different things to a meal, so variety can help us make a colourful, balanced day.",
    topics: ["balanced-food"],
  },
  {
    id: "food-groups",
    title: "Many foods, many jobs",
    speaker: "Soda Bot",
    stage: "kitchen",
    durationSeconds: 11,
    caption:
      "Meals can include a mix of fruit or vegetables, starchy foods like bread, rice, pasta or potatoes, protein foods such as beans or eggs, and dairy or alternatives. Families make different choices.",
    topics: ["balanced-food"],
  },
  {
    id: "water-break",
    title: "A water refill",
    speaker: "Archie",
    stage: "kitchen",
    durationSeconds: 11,
    caption:
      "Water is a simple everyday drink. Build in a drink break when the grown-up looking after you says it is a good time.",
    topics: ["water"],
  },
  {
    id: "sleep",
    title: "The recharge cloud",
    speaker: "Daisy",
    stage: "quiet-garden",
    durationSeconds: 11,
    caption:
      "Sleep and quiet rest are part of a balanced day too. They give our busy bodies and brains time to recharge for tomorrow’s adventures.",
    topics: ["sleep"],
  },
  {
    id: "balanced-day-quiz",
    title: "Build a balanced day",
    speaker: "Archie",
    stage: "kitchen",
    durationSeconds: 15,
    caption: "Which idea sounds like part of a balanced day?",
    topics: ["balanced-food", "water", "sleep", "exercise"],
    choices: [
      {
        id: "mix",
        label: "Move, rest, drink water and eat a mix of foods",
        correct: true,
        feedback:
          "Yes! A balanced day has room for movement, rest, drinks and lots of different foods.",
      },
      {
        id: "same",
        label: "Eat exactly the same snack forever",
        correct: false,
        feedback:
          "Try again. Different foods can play different helpful parts in our meals.",
      },
      {
        id: "no-rest",
        label: "Skip rest so there is more time to play",
        correct: false,
        feedback:
          "Rest is useful too — it helps us recharge for the next adventure.",
      },
    ],
  },
  {
    id: "handwashing",
    title: "The clean-hands sparkle",
    speaker: "Soda Bot",
    stage: "wash-station",
    durationSeconds: 12,
    caption:
      "Handwashing helps keep hands clean after the toilet, before food, and after messy play. Soap and water make a brilliant clean-hands team.",
    topics: ["hygiene"],
  },
  {
    id: "wash-challenge",
    title: "Twenty-second handwash beat",
    speaker: "Daisy",
    stage: "wash-station",
    durationSeconds: 24,
    caption:
      "Join the pretend handwash beat: palms, backs of hands, between fingers, thumbs, then rinse and dry. A short song can help you remember the time.",
    topics: ["hygiene"],
    challenge: {
      title: "Pretend handwash beat",
      instruction:
        "Practise the hand motions while Daisy counts a short song beat.",
      safeNote:
        "This is a pretend play challenge — use real soap and water with a grown-up’s usual help.",
    },
  },
  {
    id: "hygiene-recap",
    title: "Small habits, big help",
    speaker: "Sunny",
    stage: "wash-station",
    durationSeconds: 10,
    caption:
      "Clean hands are one small, helpful habit. Nobody has to be perfect — we can simply remember the next good moment to wash.",
    topics: ["hygiene"],
  },
  {
    id: "teamwork",
    title: "The friendship relay",
    speaker: "Archie",
    stage: "team-field",
    durationSeconds: 12,
    caption:
      "PE can be about play, not just winning. Passing, listening, taking turns and inviting people in can make a game more fun for everyone.",
    topics: ["teamwork", "fair-play"],
  },
  {
    id: "fair-play",
    title: "The fair-play flag",
    speaker: "Sunny",
    stage: "team-field",
    durationSeconds: 12,
    caption:
      "Fair play means we use kind words, follow the agreed rules, celebrate effort and help each other enjoy the game.",
    topics: ["fair-play", "teamwork"],
  },
  {
    id: "teamwork-quiz",
    title: "A teammate needs a cheer",
    speaker: "Daisy",
    stage: "team-field",
    durationSeconds: 15,
    caption: "A teammate misses a pass. What could help the team feel welcome?",
    topics: ["teamwork", "fair-play"],
    choices: [
      {
        id: "laugh",
        label: "Laugh at them",
        correct: false,
        feedback:
          "That could make someone feel left out. Let’s choose a kinder team response.",
      },
      {
        id: "blame",
        label: "Blame them",
        correct: false,
        feedback: "Not this time. Teams grow by helping, not blaming.",
      },
      {
        id: "cheer",
        label: "Say “good try” and offer another turn",
        correct: true,
        feedback:
          "Exactly! A kind cheer and another turn are great fair-play moves.",
      },
    ],
  },
  {
    id: "founder-cameo",
    title: "A quick founder question",
    speaker: "Founder",
    temporaryVoice: true,
    stage: "team-field",
    durationSeconds: 10,
    caption:
      "Founder, using a temporary computer voice, asks: “What is the secret ingredient?” Archie laughs: “Kindness to your body and your team!”",
    topics: ["teamwork", "fair-play"],
  },
  {
    id: "movement-trail",
    title: "The choose-your-way movement trail",
    speaker: "Archie",
    stage: "playground",
    durationSeconds: 24,
    caption:
      "For our final trail, choose one: take three gentle steps, reach toward the sky, tap your knees, or sit tall and give a superhero wave. Then give yourself a quiet high-five.",
    topics: ["exercise", "safe-movement"],
    challenge: {
      title: "Choose-your-way movement trail",
      instruction:
        "Choose one gentle movement, then pause and notice how you feel.",
      safeNote:
        "You never have to copy a move. Resting and observing are good choices too.",
    },
  },
  {
    id: "everyday-movement",
    title: "Movement can be ordinary",
    speaker: "Sunny",
    stage: "playground",
    durationSeconds: 11,
    caption:
      "Movement does not have to be a big sport. Walking, dancing, playground games, gardening, stretching and playful chores can all be ways to move.",
    topics: ["exercise"],
  },
  {
    id: "different-needs",
    title: "Different bodies, different choices",
    speaker: "Soda Bot",
    stage: "quiet-garden",
    durationSeconds: 11,
    caption:
      "Every person’s body is different, so the best activity is one that feels welcoming and works for you. Asking for a different option is always okay.",
    topics: ["safe-movement", "teamwork"],
  },
  {
    id: "cool-down",
    title: "The calm-down garden",
    speaker: "Daisy",
    stage: "quiet-garden",
    durationSeconds: 20,
    caption:
      "Let’s cool down together. Sit or stand comfortably, soften your shoulders, and take one slow, easy breath. Notice the adventure settling into a calm finish.",
    topics: ["heart-and-lungs", "safe-movement", "sleep"],
    challenge: {
      title: "Calm-down pause",
      instruction:
        "Choose a comfortable position and take one slow, easy breath.",
      safeNote:
        "There is no need to force a big breath or hold it — comfortable and calm is enough.",
    },
  },
  {
    id: "golden-summary",
    title: "Ten golden ideas",
    speaker: "Archie",
    stage: "quiet-garden",
    durationSeconds: 12,
    caption:
      "We moved kindly, met our heart, lungs, muscles and bones, explored colourful food, water, sleep and clean hands, then practised teamwork and fair play.",
    topics: [
      "exercise",
      "heart-and-lungs",
      "muscles-and-bones",
      "balanced-food",
      "water",
      "sleep",
      "hygiene",
      "teamwork",
      "fair-play",
    ],
  },
  {
    id: "final-quiz",
    title: "The golden word",
    speaker: "Soda Bot",
    stage: "quiet-garden",
    durationSeconds: 14,
    caption:
      "One last question: which two words help games feel good for everyone?",
    topics: ["teamwork", "fair-play"],
    choices: [
      {
        id: "fair-play",
        label: "Fair play",
        correct: true,
        feedback: "Golden answer! Fair play helps everybody belong.",
      },
      {
        id: "loudest",
        label: "Be the loudest",
        correct: false,
        feedback:
          "Being loud can be fun, but fair play is what helps everyone belong.",
      },
      {
        id: "fastest",
        label: "Be the fastest",
        correct: false,
        feedback: "Speed is not the goal. Fair play is the golden team idea.",
      },
    ],
  },
  {
    id: "goodbye",
    title: "A golden-key goodbye",
    speaker: "Archie",
    stage: "playground",
    durationSeconds: 10,
    caption:
      "Brilliant adventuring! Your body deserves kindness, movement, rest and fun. See you next time for another Sodafom adventure.",
    topics: ["exercise", "safe-movement", "sleep", "teamwork"],
  },
] as const satisfies readonly HealthBodyScene[];

export const HEALTH_BODY_RUNTIME_SECONDS = HEALTH_BODY_SCENES.reduce(
  (total, scene) => total + scene.durationSeconds,
  0,
);

export const HEALTH_BODY_EPISODE: HealthBodyEpisode = {
  id: "archies-healthy-body-adventure",
  title: "Archie’s Healthy Body Adventure",
  ageRange: "5–12",
  estimatedRuntimeSeconds: HEALTH_BODY_RUNTIME_SECONDS,
  subtitlesDefault: true,
  temporaryFounderVoice: true,
  healthEducationOnly: true,
  existingAssetPaths: HEALTH_BODY_EXISTING_ASSET_PATHS,
  scenes: HEALTH_BODY_SCENES,
};

const REQUIRED_TOPICS: readonly HealthBodyTopic[] = [
  "exercise",
  "safe-movement",
  "heart-and-lungs",
  "muscles-and-bones",
  "balanced-food",
  "water",
  "sleep",
  "hygiene",
  "teamwork",
  "fair-play",
] as const;

/**
 * A lightweight content gate used by the page test and available to the future
 * shared engine. It checks duration, topic coverage and that the founder cameo
 * is explicitly marked as temporary rather than pretending to be Michael's
 * real voice.
 */
export function validateHealthBodyEpisode(
  episode: HealthBodyEpisode = HEALTH_BODY_EPISODE,
): string[] {
  const errors: string[] = [];
  const runtime = episode.scenes.reduce(
    (total, scene) => total + scene.durationSeconds,
    0,
  );
  const topics = new Set(episode.scenes.flatMap((scene) => scene.topics));

  if (runtime < 300 || runtime > 420) {
    errors.push(`Expected a 5–7 minute episode, received ${runtime} seconds.`);
  }

  for (const topic of REQUIRED_TOPICS) {
    if (!topics.has(topic)) errors.push(`Missing required topic: ${topic}.`);
  }

  if (!episode.subtitlesDefault) errors.push("Subtitles must default to on.");
  if (!episode.healthEducationOnly)
    errors.push("Episode must remain general health education only.");
  if (!episode.temporaryFounderVoice)
    errors.push("Founder cameo must be marked as a temporary voice.");
  if (
    !episode.scenes.some(
      (scene) => scene.speaker === "Founder" && scene.temporaryVoice,
    )
  ) {
    errors.push("Founder cameo is not explicitly marked as a temporary voice.");
  }
  if (episode.scenes.filter((scene) => scene.challenge).length < 3) {
    errors.push("Expected at least three safe join-in movement challenges.");
  }
  if (episode.scenes.filter((scene) => scene.choices).length < 3) {
    errors.push("Expected at least three gentle pause-and-think questions.");
  }

  return errors;
}
