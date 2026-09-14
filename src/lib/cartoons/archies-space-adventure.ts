export type SpaceCastMember = 'archie' | 'soda-bot' | 'captain-spark' | 'professor-thinkwell';

export type SpaceSceneMood =
  | 'launch'
  | 'earth'
  | 'moon'
  | 'sun'
  | 'planets'
  | 'gravity'
  | 'iss'
  | 'home';

export interface SpaceQuestion {
  prompt: string;
  choices: readonly string[];
  answerIndex: number;
  correctReply: string;
  tryAgainReply: string;
}

export interface SpaceAdventureScene {
  id: string;
  chapter: string;
  speaker: string;
  subtitle: string;
  narration: string;
  mood: SpaceSceneMood;
  cast: readonly SpaceCastMember[];
  fact?: string;
  question?: SpaceQuestion;
}

export interface CartoonEpisodeScript {
  id: string;
  title: string;
  shortDescription: string;
  audience: string;
  scenes: readonly SpaceAdventureScene[];
}

export const SPACE_ADVENTURE: CartoonEpisodeScript = {
  id: 'archies-space-adventure',
  title: "Archie's Space Adventure",
  shortDescription: 'A rocket-powered journey from Earth to the Moon, planets and the International Space Station.',
  audience: 'Ages 5–12',
  scenes: [
    {
      id: 'mission-control',
      chapter: 'Mission control',
      speaker: 'Archie',
      subtitle: '“Three, two, one… space adventure!”',
      narration: 'Archie stood on the launch pad with his golden heart key shining like a star. Soda Bot checked the buttons, Captain Spark packed a telescope, and Professor Thinkwell held a solar-system map. “Ready, team? We are going to bring back space facts!”',
      mood: 'launch',
      cast: ['archie', 'soda-bot', 'captain-spark', 'professor-thinkwell'],
    },
    {
      id: 'rocket-basics',
      chapter: 'Rocket science',
      speaker: 'Professor Thinkwell',
      subtitle: '“A rocket pushes hot gas down to zoom up.”',
      narration: 'Professor Thinkwell pointed to the rocket’s engines. “A rocket carries fuel. When its engine blasts hot gas downwards, the rocket is pushed upwards. That is why rockets can lift off even though space has no air.” Archie gave the engine a careful thumbs-up.',
      mood: 'launch',
      cast: ['archie', 'professor-thinkwell'],
      fact: 'Rockets move by pushing exhaust gas in the opposite direction.',
    },
    {
      id: 'lift-off',
      chapter: 'Lift-off',
      speaker: 'Soda Bot',
      subtitle: '“Seat belts clicked. Engines rumbling. Blast off!”',
      narration: 'The friends clicked their seat belts. A low rumble became a mighty roar. The rocket rose slowly, then faster and faster, leaving a bright trail beneath it. Archie felt heavier in his seat as it sped upwards. “Hold on to your helmets!” laughed Soda Bot.',
      mood: 'launch',
      cast: ['archie', 'soda-bot', 'captain-spark'],
    },
    {
      id: 'earth-from-space',
      chapter: 'Our home planet',
      speaker: 'Archie',
      subtitle: '“Earth looks blue because it has lots of water.”',
      narration: 'Soon the sky turned dark, even though the Sun still shone. Through the window, Earth looked like a blue-and-white marble. The blue was mostly oceans and the white swirls were clouds. “Earth is our home planet,” Archie said. “It has air, liquid water, land and life.”',
      mood: 'earth',
      cast: ['archie', 'soda-bot'],
      fact: 'Earth is the third planet from the Sun and the only known planet with life.',
    },
    {
      id: 'earth-orbit',
      chapter: 'Going round the Sun',
      speaker: 'Captain Spark',
      subtitle: '“Earth travels around the Sun once every year.”',
      narration: 'Captain Spark unrolled the space map. “Earth spins once each day, giving us day and night. At the same time, Earth travels around the Sun. One complete trip takes one year.” Archie imagined every ocean and every friend travelling through space together.',
      mood: 'earth',
      cast: ['archie', 'captain-spark'],
      fact: 'Earth rotates in about 24 hours and orbits the Sun in about 365 days.',
    },
    {
      id: 'earth-question',
      chapter: 'Quick mission question',
      speaker: 'Archie',
      subtitle: '“Which object does Earth travel around?”',
      narration: 'Archie tapped the mission screen. “Your turn, space explorer. Which object does Earth travel around?”',
      mood: 'earth',
      cast: ['archie'],
      question: {
        prompt: 'Which object does Earth travel around?',
        choices: ['The Moon', 'The Sun', 'The International Space Station'],
        answerIndex: 1,
        correctReply: 'Correct! Earth travels around the Sun. Brilliant orbit spotting.',
        tryAgainReply: 'Nearly. Look for the bright star at the centre of our solar system.',
      },
    },
    {
      id: 'moon-hello',
      chapter: 'The Moon',
      speaker: 'Soda Bot',
      subtitle: '“Next stop: Earth’s Moon!”',
      narration: 'The rocket glided towards the Moon, Earth’s nearest neighbour in space. It is a rocky world, not cheese, although that would make a funny picnic. Its craters are bowl-shaped marks made when space rocks crashed into its surface long ago.',
      mood: 'moon',
      cast: ['archie', 'soda-bot'],
      fact: 'The Moon is Earth’s natural satellite and orbits Earth.',
    },
    {
      id: 'moon-gravity',
      chapter: 'Moon walking',
      speaker: 'Archie',
      subtitle: '“On the Moon, you could jump much higher.”',
      narration: 'After a gentle landing, Archie took one small step and floated farther than he expected. The Moon has gravity, but much less than Earth. If you stood there, you would weigh about one sixth of your Earth weight. “Boing!” said Archie, making a giant hop.',
      mood: 'moon',
      cast: ['archie', 'captain-spark'],
      fact: 'The Moon’s gravity is about one sixth as strong as Earth’s gravity.',
    },
    {
      id: 'moon-air',
      chapter: 'Space suits',
      speaker: 'Professor Thinkwell',
      subtitle: '“The Moon has almost no air, so astronauts need suits.”',
      narration: 'Professor Thinkwell reminded the team not to open their helmets. The Moon has almost no air, so people cannot breathe there. A spacesuit supplies oxygen, protects astronauts from extreme temperatures and lets them speak to their team. “Our suits are tiny safe spacecraft,” said Professor Thinkwell.',
      mood: 'moon',
      cast: ['archie', 'professor-thinkwell'],
    },
    {
      id: 'sun-star',
      chapter: 'The Sun',
      speaker: 'Captain Spark',
      subtitle: '“The Sun is a star — our nearest one.”',
      narration: 'Back in the rocket, Captain Spark pointed to a dazzling light. “That is the Sun. It is a star, not a planet. It is bigger and hotter than Earth, and gives us light and warmth.” Archie used the rocket’s sun visor. We should never look directly at the Sun.',
      mood: 'sun',
      cast: ['archie', 'captain-spark'],
      fact: 'The Sun is the star at the centre of our solar system.',
    },
    {
      id: 'solar-system',
      chapter: 'Eight planets',
      speaker: 'Professor Thinkwell',
      subtitle: '“Our solar system has eight planets.”',
      narration: 'Professor Thinkwell’s map lit up. “The planets travel around the Sun. From closest to farthest: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune.” Soda Bot sang the names. Archie noticed some planets are rocky, while others are giant worlds of gas and ice.',
      mood: 'planets',
      cast: ['archie', 'soda-bot', 'professor-thinkwell'],
      fact: 'There are eight planets in our solar system.',
    },
    {
      id: 'jupiter-saturn',
      chapter: 'Giant worlds',
      speaker: 'Soda Bot',
      subtitle: '“Jupiter is huge. Saturn has beautiful rings.”',
      narration: 'Jupiter filled the window like a striped giant. It is the largest planet in our solar system. Farther on, Saturn wore rings made mostly of ice, rock and dust. “They look solid from far away,” said Soda Bot, “but they are countless pieces moving around Saturn.”',
      mood: 'planets',
      cast: ['archie', 'soda-bot'],
      fact: 'Jupiter is the largest planet; Saturn’s rings are made of ice, rock and dust.',
    },
    {
      id: 'planet-question',
      chapter: 'Quick mission question',
      speaker: 'Professor Thinkwell',
      subtitle: '“How many planets orbit our Sun?”',
      narration: 'Professor Thinkwell raised eight glowing planet cards. “How many planets orbit our Sun?”',
      mood: 'planets',
      cast: ['archie', 'professor-thinkwell'],
      question: {
        prompt: 'How many planets are in our solar system?',
        choices: ['Six', 'Eight', 'Twelve'],
        answerIndex: 1,
        correctReply: 'Exactly right. Our solar system has eight planets.',
        tryAgainReply: 'Count the planet cards again, from Mercury all the way to Neptune.',
      },
    },
    {
      id: 'gravity-explained',
      chapter: 'Gravity',
      speaker: 'Archie',
      subtitle: '“Gravity is a pull between things with mass.”',
      narration: 'Archie floated a pencil in front of his face. “Gravity is a pull between things with mass. Earth’s gravity pulls us towards the ground, so we do not float away. Bigger objects can have a stronger pull. That is why giant planets have powerful gravity too.”',
      mood: 'gravity',
      cast: ['archie', 'captain-spark'],
      fact: 'Gravity pulls objects with mass towards each other.',
    },
    {
      id: 'orbit-and-falling',
      chapter: 'Orbit',
      speaker: 'Professor Thinkwell',
      subtitle: '“An orbit is a curved path around an object.”',
      narration: 'Professor Thinkwell showed a model rocket going around Earth. “An orbit is a curved path around an object. A spacecraft moves sideways quickly while gravity bends its path. It is always falling around Earth, rather than falling straight down onto it.”',
      mood: 'gravity',
      cast: ['archie', 'professor-thinkwell'],
    },
    {
      id: 'iss-arrival',
      chapter: 'International Space Station',
      speaker: 'Captain Spark',
      subtitle: '“Look — the International Space Station!”',
      narration: 'A bright shape appeared above Earth. “That is the International Space Station, or ISS,” said Captain Spark. It is an orbiting laboratory where astronauts from different countries live and work together. It completes a trip around Earth in about ninety minutes.',
      mood: 'iss',
      cast: ['archie', 'captain-spark', 'soda-bot'],
      fact: 'The ISS is a space laboratory that orbits Earth about every 90 minutes.',
    },
    {
      id: 'iss-microgravity',
      chapter: 'Floating laboratory',
      speaker: 'Soda Bot',
      subtitle: '“Astronauts float because the station is in continuous free fall.”',
      narration: 'Inside the ISS, a water drop floated like a shiny bubble. Astronauts look weightless, but gravity has not disappeared. The station, astronauts and everything inside are falling around Earth together. Scientists call this microgravity, and it helps them run special experiments.',
      mood: 'iss',
      cast: ['archie', 'soda-bot', 'professor-thinkwell'],
      fact: 'Astronauts on the ISS experience microgravity while orbiting Earth.',
    },
    {
      id: 'iss-day-night',
      chapter: 'Sixteen sunrises',
      speaker: 'Archie',
      subtitle: '“The ISS can see about sixteen sunrises in a day.”',
      narration: 'Archie watched the window change from sunlight to darkness and back again. Because the ISS circles Earth so quickly, astronauts can see around sixteen sunrises and sixteen sunsets in one day. “That is a lot of breakfasts,” joked Archie. “Space explorers need good schedules.”',
      mood: 'iss',
      cast: ['archie', 'soda-bot'],
    },
    {
      id: 'iss-question',
      chapter: 'Quick mission question',
      speaker: 'Soda Bot',
      subtitle: '“What does ISS stand for?”',
      narration: 'Soda Bot’s screen flashed a final question. “What does ISS stand for?”',
      mood: 'iss',
      cast: ['archie', 'soda-bot'],
      question: {
        prompt: 'What does ISS stand for?',
        choices: ['International Space Station', 'Inside Solar System', 'Important Star Ship'],
        answerIndex: 0,
        correctReply: 'Yes! ISS means International Space Station.',
        tryAgainReply: 'Think of the laboratory where astronauts from many countries work together.',
      },
    },
    {
      id: 'careful-scientists',
      chapter: 'Real space science',
      speaker: 'Professor Thinkwell',
      subtitle: '“Space facts are checked carefully by scientists.”',
      narration: 'Professor Thinkwell opened the mission log. “Space is full of amazing questions. Scientists use telescopes, satellites, robots and experiments to learn more. When something is discovered, we check evidence, compare ideas and keep asking curious questions.” Archie added a gold star beside the word curious.',
      mood: 'iss',
      cast: ['archie', 'professor-thinkwell'],
    },
    {
      id: 'homeward',
      chapter: 'Heading home',
      speaker: 'Captain Spark',
      subtitle: '“Our blue planet is waiting for us.”',
      narration: 'It was time to head home. The rocket turned towards blue Earth. Archie felt proud. They had learned about rockets, Earth, the Moon, the Sun, planets, gravity and the ISS. “The universe is enormous,” Archie said, “and every good question is a new adventure.”',
      mood: 'home',
      cast: ['archie', 'captain-spark', 'soda-bot'],
    },
    {
      id: 'space-explorer-badge',
      chapter: 'Mission complete',
      speaker: 'Archie',
      subtitle: '“You are now an official Sodafom Space Explorer!”',
      narration: 'The friends landed safely and raised their helmets in a cheer. Archie held out a sparkling Space Explorer badge for you. “Look up, wonder why, and keep learning. Maybe one day you will design a rocket, discover a planet or help astronauts explore farther. Mission complete!”',
      mood: 'home',
      cast: ['archie', 'soda-bot', 'captain-spark', 'professor-thinkwell'],
    },
  ],
};

export function countNarrationWords(episode: CartoonEpisodeScript = SPACE_ADVENTURE): number {
  return episode.scenes.reduce((total, scene) => total + scene.narration.trim().split(/\s+/).filter(Boolean).length, 0);
}

export function estimateEpisodeSeconds(episode: CartoonEpisodeScript = SPACE_ADVENTURE): number {
  const spokenSeconds = (countNarrationWords(episode) / 145) * 60;
  const sceneTransitions = Math.max(episode.scenes.length - 1, 0) * 1.25;
  const quizThinkingTime = episode.scenes.filter(scene => scene.question).length * 10;
  return Math.round(spokenSeconds + sceneTransitions + quizThinkingTime);
}

export const SPACE_FACTS_COVERED = [
  'Rockets move by pushing exhaust gas downwards.',
  'Earth rotates daily and orbits the Sun yearly.',
  'The Moon is Earth’s rocky natural satellite and has weaker gravity.',
  'The Sun is a star at the centre of our solar system.',
  'Our solar system has eight planets.',
  'Gravity pulls objects with mass towards each other.',
  'The International Space Station is an orbiting laboratory where astronauts experience microgravity.',
] as const;
