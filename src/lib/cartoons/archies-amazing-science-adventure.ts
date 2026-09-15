export type Speaker = 'Archie' | 'Soda Bot' | 'Professor Thinkwell' | 'Captain Spark' | 'Bella';

export type Choice = { label: string; correct: boolean; feedback: string };

export type ScienceScene = {
  id: string;
  title: string;
  speaker: Speaker;
  narration: string;
  subtitle: string;
  durationSeconds: number;
  colours: string;
  characterAssets: string[];
  topics: string[];
  question?: { prompt: string; choices: Choice[] };
  safety?: string;
};

export type ScienceEpisode = {
  id: string;
  title: string;
  runtimeSeconds: number;
  scenes: ScienceScene[];
};

const archie = '/assets/images/archie-character-v2.png';
const soda = '/assets/cartoon/friends/soda-bot.png';
const professor = '/assets/cartoon/friends/professor-thinkwell.png';
const spark = '/assets/cartoon/friends/captain-spark.png';
const bella = '/assets/cartoon/friends/bella.png';

/**
 * Data-first episode prepared for Agent 22's cartoon engine. The renderer can
 * be replaced later without changing the verified scenes, subtitles, prompts,
 * timings, safety notes or approved-asset references.
 */
export const ARCHIES_AMAZING_SCIENCE_ADVENTURE: ScienceEpisode = {
  id: 'archies-amazing-science-adventure',
  title: "Archie's Amazing Science Adventure",
  runtimeSeconds: 375,
  scenes: [
    {
      id: 'curiosity-door', title: 'The Curious Door', speaker: 'Archie', durationSeconds: 28,
      colours: 'from-cyan-500 via-sky-500 to-indigo-700', characterAssets: [archie, soda],
      topics: ['asking why', 'observing'],
      narration: 'Welcome to my Amazing Science Adventure! Soda Bot and I have found a door with three sparkling words: Why? Predict? Observe? Science is not only a big book of answers. It is a way of being curious, looking carefully, and changing our minds when new evidence appears. Shall we open the door together?',
      subtitle: 'Science starts with a curious question: why?',
    },
    {
      id: 'matter', title: 'Three Material Friends', speaker: 'Professor Thinkwell', durationSeconds: 35,
      colours: 'from-blue-700 via-cyan-500 to-teal-400', characterAssets: [archie, professor],
      topics: ['solids', 'liquids', 'gases'],
      narration: 'Professor Thinkwell shows an ice cube. A solid keeps its own shape. Water is a liquid: it can flow and takes the shape of its container. Air fills a balloon. A gas spreads out to fill the space it is in. The same material can sometimes change state. Ice can melt into liquid water, and water can become water vapour when it warms up.',
      subtitle: 'Solid: keeps its shape. Liquid: flows. Gas: fills its space.',
      question: { prompt: 'Which one can flow and take the shape of its container?', choices: [
        { label: 'A solid', correct: false, feedback: 'Good thinking. A solid usually keeps its own shape, like a brick or an ice cube.' },
        { label: 'A liquid', correct: true, feedback: 'Correct! A liquid flows and takes the shape of its container.' },
        { label: 'A gas', correct: false, feedback: 'Nearly! A gas spreads to fill its space. A liquid is the one that flows into a container’s shape.' },
      ] },
    },
    {
      id: 'observe', title: 'Look, Then Notice', speaker: 'Soda Bot', durationSeconds: 28,
      colours: 'from-teal-500 via-emerald-500 to-lime-400', characterAssets: [archie, soda],
      topics: ['predicting', 'observing', 'fair tests'],
      narration: 'Soda Bot says, first make a prediction. That means making your best careful guess. Then observe: use your eyes, ears, and other safe senses to notice what happens. A fair test changes one thing at a time, so the result is easier to understand. Scientists do not need to be perfect. They need to be honest about what they see.',
      subtitle: 'Predict, test safely, observe, then explain what you noticed.',
    },
    {
      id: 'forces', title: 'The Push and Pull Parade', speaker: 'Archie', durationSeconds: 30,
      colours: 'from-fuchsia-600 via-violet-600 to-indigo-700', characterAssets: [archie, spark],
      topics: ['forces', 'pushes', 'pulls', 'friction'],
      narration: 'At the Forces Festival, Captain Spark gives a toy car a gentle push. It starts moving. Then he pulls a little wagon. A force is a push or a pull. Forces can start, stop, speed up, slow down, or change direction. Friction is a force too. It can slow a rolling toy down when its wheels rub against the ground.',
      subtitle: 'A force is a push or a pull that can change movement.',
      question: { prompt: 'What kind of force helps a toy car begin to move?', choices: [
        { label: 'A push', correct: true, feedback: 'Yes! A gentle push is a force that can start the toy car moving.' },
        { label: 'A shadow', correct: false, feedback: 'A shadow changes light, not movement. A push can start the car moving.' },
        { label: 'A habitat', correct: false, feedback: 'A habitat is an animal’s home. A push is the force that starts the car moving.' },
      ] },
    },
    {
      id: 'gravity', title: 'The Golden Apple Drop', speaker: 'Professor Thinkwell', durationSeconds: 31,
      colours: 'from-indigo-800 via-blue-700 to-sky-500', characterAssets: [archie, professor],
      topics: ['gravity'],
      narration: 'A golden apple slips from a branch and falls into a soft basket. Why does it go down instead of up? Gravity is a pulling force. Earth’s gravity pulls objects toward the centre of our planet. Gravity helps keep us, the oceans, and even the Moon in its path around Earth. Always keep the space below clear and never drop objects from a height near people or pets.',
      subtitle: 'Gravity pulls objects toward Earth.', safety: 'Keep people and pets clear. Never drop objects from a height.',
    },
    {
      id: 'light', title: 'The Shadow Show', speaker: 'Bella', durationSeconds: 28,
      colours: 'from-amber-500 via-orange-500 to-rose-600', characterAssets: [archie, bella],
      topics: ['light', 'shadows'],
      narration: 'Bella switches on a torch and makes a puppet shadow dance on a screen. Light travels from a source, such as the Sun, a lamp, or a torch. A shadow appears when an object blocks some of that light. Move the object closer to the light and its shadow can look bigger. Never shine a torch into anyone’s eyes, and never stare at the Sun.',
      subtitle: 'A shadow forms when an object blocks light.', safety: 'Never shine a torch into eyes or look directly at the Sun.',
      question: { prompt: 'What makes a shadow appear?', choices: [
        { label: 'An object blocks light', correct: true, feedback: 'Exactly! When an object blocks light, a shadow can appear behind it.' },
        { label: 'A loud noise', correct: false, feedback: 'Noise is sound, but a shadow is made when light is blocked.' },
        { label: 'Adding water', correct: false, feedback: 'Water can do exciting things with light, but a shadow happens when an object blocks light.' },
      ] },
    },
    {
      id: 'electricity', title: 'Captain Spark’s Safe Circuit', speaker: 'Captain Spark', durationSeconds: 31,
      colours: 'from-slate-800 via-blue-800 to-cyan-600', characterAssets: [archie, spark],
      topics: ['simple electricity', 'electricity safety'],
      narration: 'Captain Spark shows a small, adult-supervised battery circuit. Electricity needs a complete path, called a circuit, to travel around and light the tiny bulb. But wall sockets and mains electricity are not experiments for children. Never put anything into a socket, never touch damaged wires, and keep water away from electricity. Smart scientists put safety first.',
      subtitle: 'A circuit needs a complete path. Mains electricity is for trained adults.', safety: 'Never put anything in a socket. Keep water away from electricity and ask an adult for help.',
    },
    {
      id: 'plants', title: 'The Leafy Lift', speaker: 'Archie', durationSeconds: 32,
      colours: 'from-emerald-700 via-green-500 to-lime-400', characterAssets: [archie, soda],
      topics: ['plants'],
      narration: 'In the garden, a little seedling stretches toward the light. Most plants need water, light, air, nutrients, and enough room to grow. Their roots help take in water and minerals from the soil. Their leaves help them use light to make food. You can observe a plant without picking its leaves. Try measuring its height once a week with a grown-up.',
      subtitle: 'Most plants need water, light, air, nutrients and room to grow.',
    },
    {
      id: 'habitats', title: 'Homes for Every Creature', speaker: 'Soda Bot', durationSeconds: 31,
      colours: 'from-emerald-700 via-teal-600 to-cyan-600', characterAssets: [archie, soda],
      topics: ['animals', 'habitats'],
      narration: 'A frog hops by the pond, a hedgehog rustles beneath leaves, and bees visit flowers. A habitat is the place where a living thing finds what it needs: food, water, shelter, and space. Different animals suit different habitats. We can help wildlife by leaving their homes undisturbed, taking litter home, and watching quietly. The best explorers are kind to the places they explore.',
      subtitle: 'A habitat gives living things food, water, shelter and space.',
      question: { prompt: 'Which place would suit a frog best?', choices: [
        { label: 'A pond', correct: true, feedback: 'Great observing! A pond gives frogs water and a useful habitat.' },
        { label: 'A freezer', correct: false, feedback: 'A freezer is far too cold and has no food or shelter for a frog.' },
        { label: 'A busy road', correct: false, feedback: 'A busy road is dangerous. A pond is a much better place for a frog.' },
      ] },
    },
    {
      id: 'body', title: 'The Inside-You Orchestra', speaker: 'Professor Thinkwell', durationSeconds: 31,
      colours: 'from-rose-600 via-pink-500 to-orange-400', characterAssets: [archie, professor],
      topics: ['human body'],
      narration: 'Professor Thinkwell calls your body an amazing team. Your lungs help move oxygen into your body when you breathe. Your heart pumps blood around your body. Your brain helps you think, feel, learn, and control many actions. Put a hand gently on your chest after a safe, calm walk and notice your heartbeat. If you feel unwell or worried, tell a trusted grown-up.',
      subtitle: 'Lungs, heart and brain are part of an amazing body team.', safety: 'If you feel unwell or worried, tell a trusted grown-up.',
    },
    {
      id: 'experiment', title: 'The Float-or-Sink Mission', speaker: 'Archie', durationSeconds: 34,
      colours: 'from-sky-600 via-cyan-500 to-teal-400', characterAssets: [archie, bella],
      topics: ['safe simple experiments', 'observing'],
      narration: 'Here is a safe experiment to try with a grown-up. Put a bowl of cool water on a steady table, well away from plugs and devices. Choose three clean waterproof objects that an adult says are safe, such as a cork, a plastic spoon, or a small stone. Predict whether each will float or sink. Test one at a time and write down what you observe. Materials and density help decide whether something floats.',
      subtitle: 'With an adult: predict, test one safe object at a time, then record what happens.', safety: 'Use cool water on a steady table with an adult. Keep water away from plugs and devices.',
    },
    {
      id: 'celebration', title: 'The Curiosity Key', speaker: 'Archie', durationSeconds: 36,
      colours: 'from-violet-700 via-fuchsia-600 to-rose-500', characterAssets: [archie, soda, professor],
      topics: ['science recap'],
      narration: 'We did it! Today we met solids, liquids and gases; pushes, pulls and gravity; light, shadows and safe circuits; plants, habitats, and your brilliant body. The biggest science tool is still your curiosity. Ask why. Make a careful prediction. Observe what happens. Be safe, be kind to living things, and share your discoveries. Be curious, be kind, be brave. The end!',
      subtitle: 'Be curious • Be kind • Be brave • The End',
    },
  ],
};

export const scienceAdventureRuntimeSeconds = ARCHIES_AMAZING_SCIENCE_ADVENTURE.scenes
  .reduce((total, scene) => total + scene.durationSeconds, 0);

