import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the closest star to Earth?', options: ['The Sun','Sirius','Alpha Centauri','Betelgeuse'], answer: 'The Sun' },
  { question: 'How many planets are in our solar system?', options: ['8','9','7','10'], answer: '8' },
  { question: 'What is the largest planet in our solar system?', options: ['Jupiter','Saturn','Neptune','Uranus'], answer: 'Jupiter' },
  { question: 'What is the smallest planet in our solar system?', options: ['Mercury','Mars','Venus','Earth'], answer: 'Mercury' },
  { question: 'How long does Earth take to orbit the Sun?', options: ['1 year','1 month','1 day','10 years'], answer: '1 year' },
  { question: 'How long does Earth take to spin once on its axis?', options: ['1 day','1 year','1 month','1 hour'], answer: '1 day' },
  { question: 'What causes day and night?', options: ['Earth spinning on its axis','Earth orbiting the Sun','The Moon orbiting Earth','The Sun moving'], answer: 'Earth spinning on its axis' },
  { question: 'What is the Moon?', options: ["Earth's natural satellite","A planet","A star","A comet"], answer: "Earth's natural satellite" },
  { question: 'What is the name of our galaxy?', options: ['The Milky Way','Andromeda','Triangulum','Whirlpool'], answer: 'The Milky Way' },
  { question: 'Which planet is known as the Red Planet?', options: ['Mars','Venus','Jupiter','Saturn'], answer: 'Mars' },
  { question: 'What is a star made of?', options: ['Hot gas (plasma)','Rock','Ice','Metal'], answer: 'Hot gas (plasma)' },
  { question: 'What is the Sun?', options: ['A star','A planet','A moon','A comet'], answer: 'A star' },
];
const L2: QuizQuestion[] = [
  { question: 'What causes the seasons?', options: ["Earth's tilted axis as it orbits the Sun","Earth's distance from the Sun","The Moon's orbit","The Sun's rotation"], answer: "Earth's tilted axis as it orbits the Sun" },
  { question: 'What is a light year?', options: ['The distance light travels in one year','The time light takes to reach Earth','The speed of light','The age of the universe'], answer: 'The distance light travels in one year' },
  { question: 'Which planet has rings?', options: ['Saturn','Jupiter','Uranus','All of these'], answer: 'All of these' },
  { question: 'What is a comet?', options: ['A ball of ice and rock orbiting the Sun','A small planet','A type of star','A moon'], answer: 'A ball of ice and rock orbiting the Sun' },
  { question: 'What is an asteroid?', options: ['A rocky body orbiting the Sun','A type of star','A moon','A comet'], answer: 'A rocky body orbiting the Sun' },
  { question: 'What is the order of planets from the Sun?', options: ['Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune','Venus, Mercury, Earth, Mars, Jupiter, Saturn, Uranus, Neptune','Mercury, Earth, Venus, Mars, Jupiter, Saturn, Uranus, Neptune','Mercury, Venus, Mars, Earth, Jupiter, Saturn, Uranus, Neptune'], answer: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune' },
  { question: 'What is a solar eclipse?', options: ['The Moon blocks the Sun','Earth blocks the Sun','The Sun blocks the Moon','Earth blocks the Moon'], answer: 'The Moon blocks the Sun' },
  { question: 'What is a lunar eclipse?', options: ["Earth's shadow falls on the Moon","The Moon blocks the Sun","The Sun blocks the Moon","The Moon blocks Earth"], answer: "Earth's shadow falls on the Moon" },
  { question: 'What is the Big Bang theory?', options: ['The universe began from a single point','The universe has always existed','Stars explode to create new stars','Planets formed from gas clouds'], answer: 'The universe began from a single point' },
  { question: 'What is a black hole?', options: ['A region where gravity is so strong nothing can escape','A hole in space','A dark star','A type of nebula'], answer: 'A region where gravity is so strong nothing can escape' },
  { question: 'What is a nebula?', options: ['A cloud of gas and dust in space','A type of galaxy','A small planet','A type of star'], answer: 'A cloud of gas and dust in space' },
  { question: 'What is the International Space Station?', options: ['A space station orbiting Earth','A space station on the Moon','A space station on Mars','A space station orbiting the Sun'], answer: 'A space station orbiting Earth' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the Hubble Space Telescope?', options: ['A telescope orbiting Earth','A telescope on the Moon','A telescope on Mars','A telescope on the ISS'], answer: 'A telescope orbiting Earth' },
  { question: 'What is a supernova?', options: ['An exploding star','A new star forming','A type of galaxy','A type of black hole'], answer: 'An exploding star' },
  { question: 'What is a neutron star?', options: ['The dense core left after a supernova','A star made of neutrons','A type of black hole','A type of nebula'], answer: 'The dense core left after a supernova' },
  { question: 'What is the Oort Cloud?', options: ['A distant region of comets surrounding the solar system','A cloud of gas near the Sun','A region of asteroids','A type of nebula'], answer: 'A distant region of comets surrounding the solar system' },
  { question: 'What is the Kuiper Belt?', options: ['A region of icy bodies beyond Neptune','A region of asteroids between Mars and Jupiter','A cloud of comets','A ring around Saturn'], answer: 'A region of icy bodies beyond Neptune' },
  { question: 'What is the asteroid belt?', options: ['A region of rocky bodies between Mars and Jupiter','A region of icy bodies beyond Neptune','A ring around Saturn','A cloud of comets'], answer: 'A region of rocky bodies between Mars and Jupiter' },
  { question: 'What is a dwarf planet?', options: ['A body that orbits the Sun but has not cleared its orbit','A small moon','A large asteroid','A type of comet'], answer: 'A body that orbits the Sun but has not cleared its orbit' },
  { question: 'What is Pluto classified as?', options: ['A dwarf planet','A planet','A moon','An asteroid'], answer: 'A dwarf planet' },
  { question: 'What is the Andromeda Galaxy?', options: ['The nearest large galaxy to the Milky Way','A star in the Milky Way','A nebula','A type of black hole'], answer: 'The nearest large galaxy to the Milky Way' },
  { question: 'What is dark matter?', options: ['Matter that does not emit light but has gravitational effects','A type of black hole','A type of nebula','A type of star'], answer: 'Matter that does not emit light but has gravitational effects' },
  { question: 'What is the cosmic microwave background?', options: ['Radiation left over from the Big Bang','Radiation from the Sun','Radiation from black holes','Radiation from neutron stars'], answer: 'Radiation left over from the Big Bang' },
  { question: 'What is redshift?', options: ['Light from objects moving away stretching to longer wavelengths','Light from objects moving closer','Light from hot stars','Light from cold stars'], answer: 'Light from objects moving away stretching to longer wavelengths' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the Chandrasekhar limit?', options: ['The maximum mass of a white dwarf (~1.4 solar masses)','The minimum mass of a neutron star','The maximum size of a black hole','The minimum size of a star'], answer: 'The maximum mass of a white dwarf (~1.4 solar masses)' },
  { question: 'What is gravitational lensing?', options: ['Massive objects bending light from behind them','Light reflecting off planets','Light refracting through nebulae','Stars focusing light like a lens'], answer: 'Massive objects bending light from behind them' },
  { question: 'What is the Hertzsprung-Russell diagram?', options: ['A chart plotting star temperature against luminosity','A chart of planet sizes','A map of the galaxy','A chart of asteroid orbits'], answer: 'A chart plotting star temperature against luminosity' },
  { question: 'What is a white dwarf?', options: ['The remnant of a low-mass star after it sheds its outer layers','A young hot star','A type of neutron star','A type of black hole'], answer: 'The remnant of a low-mass star after it sheds its outer layers' },
  { question: 'What is stellar nucleosynthesis?', options: ['The creation of elements inside stars through nuclear fusion','The explosion of a star','The formation of a black hole','The collapse of a nebula'], answer: 'The creation of elements inside stars through nuclear fusion' },
  { question: 'What is the main sequence?', options: ['The stage where stars fuse hydrogen into helium','The stage where stars fuse helium into carbon','The final stage of a star','The formation stage of a star'], answer: 'The stage where stars fuse hydrogen into helium' },
  { question: 'What is a red giant?', options: ['An ageing star that has expanded and cooled','A young hot star','A type of neutron star','A type of black hole'], answer: 'An ageing star that has expanded and cooled' },
  { question: 'What is the escape velocity of Earth?', options: ['11.2 km/s','7.9 km/s','3.0 km/s','20.0 km/s'], answer: '11.2 km/s' },
  { question: 'What is Kepler\'s first law?', options: ['Planets orbit the Sun in ellipses','Planets orbit the Sun in circles','Planets orbit the Sun at constant speed','All planets take the same time to orbit'], answer: 'Planets orbit the Sun in ellipses' },
  { question: 'What is parallax used for in astronomy?', options: ['Measuring the distance to nearby stars','Measuring the mass of stars','Measuring the temperature of stars','Measuring the speed of stars'], answer: 'Measuring the distance to nearby stars' },
  { question: 'What is a parsec?', options: ['A unit of distance equal to about 3.26 light years','A unit of time','A unit of mass','A unit of temperature'], answer: 'A unit of distance equal to about 3.26 light years' },
  { question: 'What is the Doppler effect in astronomy?', options: ['The change in frequency of light due to relative motion','The bending of light by gravity','The splitting of light by a prism','The absorption of light by gas'], answer: 'The change in frequency of light due to relative motion' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the Schwarzschild radius?', options: ['The radius at which an object becomes a black hole','The radius of the Sun','The radius of a neutron star','The radius of the observable universe'], answer: 'The radius at which an object becomes a black hole' },
  { question: 'What is Hawking radiation?', options: ['Theoretical radiation emitted by black holes','Radiation from neutron stars','Radiation from the Big Bang','Radiation from supernovae'], answer: 'Theoretical radiation emitted by black holes' },
  { question: 'What is the Fermi paradox?', options: ['The contradiction between high probability of alien life and lack of evidence','The paradox of light speed travel','The paradox of black hole information','The paradox of the expanding universe'], answer: 'The contradiction between high probability of alien life and lack of evidence' },
  { question: 'What is the observable universe?', options: ['The region of the universe visible from Earth given the age of the universe','The entire universe','The Milky Way galaxy','The local group of galaxies'], answer: 'The region of the universe visible from Earth given the age of the universe' },
  { question: 'What is dark energy?', options: ['A hypothetical energy causing the accelerating expansion of the universe','A type of black hole energy','Energy from dark matter','Energy from neutron stars'], answer: 'A hypothetical energy causing the accelerating expansion of the universe' },
  { question: 'What is the multiverse theory?', options: ['The idea that multiple universes exist beyond our own','The idea that the universe is infinite','The idea that the universe is finite','The idea that the universe is static'], answer: 'The idea that multiple universes exist beyond our own' },
  { question: 'What is the anthropic principle?', options: ['The universe\'s conditions are as they are because they allow observers to exist','The universe was designed for humans','The universe is infinite','The universe has no beginning'], answer: 'The universe\'s conditions are as they are because they allow observers to exist' },
  { question: 'What is a magnetar?', options: ['A neutron star with an extremely strong magnetic field','A type of black hole','A type of white dwarf','A type of red giant'], answer: 'A neutron star with an extremely strong magnetic field' },
  { question: 'What is the cosmic inflation theory?', options: ['The universe expanded extremely rapidly just after the Big Bang','The universe is currently expanding','The universe will eventually contract','The universe has always been the same size'], answer: 'The universe expanded extremely rapidly just after the Big Bang' },
  { question: 'What is a quasar?', options: ['An extremely luminous active galactic nucleus powered by a supermassive black hole','A type of star','A type of nebula','A type of galaxy'], answer: 'An extremely luminous active galactic nucleus powered by a supermassive black hole' },
  { question: 'What is the event horizon of a black hole?', options: ['The boundary beyond which nothing can escape','The centre of a black hole','The outer edge of a black hole\'s gravity','The point where light bends'], answer: 'The boundary beyond which nothing can escape' },
  { question: 'What is baryonic matter?', options: ['Ordinary matter made of protons, neutrons and electrons','Dark matter','Dark energy','Antimatter'], answer: 'Ordinary matter made of protons, neutrons and electrons' },
];

export default function EarthSpaceGame() {
  return (
    <>
      <Helmet>
        <title>Earth & Space — Sodafom</title>
        <meta name="description" content="Explore our solar system, stars, and the universe beyond!" />
        <link rel="canonical" href="https://sodafom.uk/games/earth-space" />
        <meta property="og:title" content="Earth & Space — Sodafom" />
        <meta property="og:description" content="Explore our solar system, stars, and the universe beyond!" />
        <meta property="og:url" content="https://sodafom.uk/games/earth-space" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Earth & Space — Science Game for Kids — Sodafom</h1>
      <GameShell title="Earth & Space" emoji="🌍" subject="science" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="earth-space"
            title="Earth & Space"
            emoji="🌍"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
