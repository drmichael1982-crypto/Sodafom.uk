import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is at the centre of our solar system?', options: ['Earth','The Moon','A black hole','The Sun'], answer: 'The Sun' },
  { question: 'How many planets are in our solar system?', options: ['7','8','9','10'], answer: '8' },
  { question: 'Which planet is closest to the Sun?', options: ['Venus','Earth','Mercury','Mars'], answer: 'Mercury' },
  { question: 'Which is the largest planet in our solar system?', options: ['Saturn','Neptune','Uranus','Jupiter'], answer: 'Jupiter' },
  { question: 'Which planet has the most famous rings?', options: ['Jupiter','Uranus','Saturn','Neptune'], answer: 'Saturn' },
  { question: 'What is the name of Earth\'s natural satellite?', options: ['Phobos','Europa','The Moon','Titan'], answer: 'The Moon' },
  { question: 'Which planet is known as the Red Planet?', options: ['Venus','Mars','Jupiter','Mercury'], answer: 'Mars' },
  { question: 'Which planet is furthest from the Sun?', options: ['Uranus','Saturn','Neptune','Jupiter'], answer: 'Neptune' },
  { question: 'What is a star?', options: ['A planet that reflects light','A ball of hot gas that produces light and heat','A moon','A comet'], answer: 'A ball of hot gas that produces light and heat' },
  { question: 'What is a comet?', options: ['A small planet','A moon','A ball of ice and rock that orbits the Sun','A type of star'], answer: 'A ball of ice and rock that orbits the Sun' },
  { question: 'How long does it take Earth to orbit the Sun?', options: ['1 month','6 months','1 year','10 years'], answer: '1 year' },
  { question: 'What causes day and night on Earth?', options: ['Earth orbiting the Sun','The Moon blocking the Sun','Earth rotating on its axis','The Sun moving'], answer: 'Earth rotating on its axis' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the correct order of planets from the Sun?', options: ['Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune','Venus, Mercury, Earth, Mars, Jupiter, Saturn, Uranus, Neptune','Mercury, Earth, Venus, Mars, Jupiter, Saturn, Uranus, Neptune','Mercury, Venus, Mars, Earth, Jupiter, Saturn, Uranus, Neptune'], answer: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune' },
  { question: 'What causes the seasons?', options: ["Earth's tilted axis as it orbits the Sun","Earth's distance from the Sun","The Moon's orbit","The Sun's rotation"], answer: "Earth's tilted axis as it orbits the Sun" },
  { question: 'What is a light year?', options: ['The distance light travels in one year','The time light takes to reach Earth','The speed of light','The age of the universe'], answer: 'The distance light travels in one year' },
  { question: 'What is a solar eclipse?', options: ['The Moon blocks the Sun','Earth blocks the Sun','The Sun blocks the Moon','Earth blocks the Moon'], answer: 'The Moon blocks the Sun' },
  { question: 'What is a lunar eclipse?', options: ["Earth's shadow falls on the Moon","The Moon blocks the Sun","The Sun blocks the Moon","The Moon blocks Earth"], answer: "Earth's shadow falls on the Moon" },
  { question: 'What is the Big Bang theory?', options: ['The universe began from a single point','The universe has always existed','Stars explode to create new stars','Planets formed from gas clouds'], answer: 'The universe began from a single point' },
  { question: 'What is a black hole?', options: ['A region where gravity is so strong nothing can escape','A hole in space','A dark star','A type of nebula'], answer: 'A region where gravity is so strong nothing can escape' },
  { question: 'What is a nebula?', options: ['A cloud of gas and dust in space','A type of galaxy','A small planet','A type of star'], answer: 'A cloud of gas and dust in space' },
  { question: 'What is the name of our galaxy?', options: ['Andromeda','Triangulum','The Milky Way','Whirlpool'], answer: 'The Milky Way' },
  { question: 'What is an asteroid?', options: ['A rocky body orbiting the Sun','A type of star','A moon','A comet'], answer: 'A rocky body orbiting the Sun' },
  { question: 'What is the approximate distance from Earth to the Sun?', options: ['150 million km','15 million km','1.5 billion km','15 billion km'], answer: '150 million km' },
  { question: 'What is the surface of the Sun called?', options: ['Core','Mantle','Photosphere','Corona'], answer: 'Photosphere' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the approximate diameter of the Sun?', options: ['1.4 million km','140,000 km','14 million km','140 million km'], answer: '1.4 million km' },
  { question: 'What is the corona of the Sun?', options: ['The outermost layer of the Sun\'s atmosphere','The surface of the Sun','The core of the Sun','The middle layer of the Sun'], answer: 'The outermost layer of the Sun\'s atmosphere' },
  { question: 'What is a sunspot?', options: ['A cooler, darker region on the Sun\'s surface','A hotter, brighter region on the Sun\'s surface','A type of solar flare','A type of solar wind'], answer: 'A cooler, darker region on the Sun\'s surface' },
  { question: 'What is a solar flare?', options: ['A sudden burst of energy from the Sun\'s surface','A cooler region on the Sun','A type of sunspot','A type of solar wind'], answer: 'A sudden burst of energy from the Sun\'s surface' },
  { question: 'What is the solar wind?', options: ['A stream of charged particles from the Sun','A type of solar flare','A type of sunspot','A type of aurora'], answer: 'A stream of charged particles from the Sun' },
  { question: 'What causes the Northern Lights (Aurora Borealis)?', options: ['Solar wind particles interacting with Earth\'s magnetic field','The Sun reflecting off ice','Sunlight refracting through clouds','Lightning in the upper atmosphere'], answer: 'Solar wind particles interacting with Earth\'s magnetic field' },
  { question: 'What is the Kuiper Belt?', options: ['A region of icy bodies beyond Neptune','A region of asteroids between Mars and Jupiter','A ring around Saturn','A cloud of comets'], answer: 'A region of icy bodies beyond Neptune' },
  { question: 'What is the Oort Cloud?', options: ['A distant region of comets surrounding the solar system','A cloud of gas near the Sun','A region of asteroids','A type of nebula'], answer: 'A distant region of comets surrounding the solar system' },
  { question: 'What is the largest moon in the solar system?', options: ['Ganymede (Jupiter)','Titan (Saturn)','The Moon (Earth)','Io (Jupiter)'], answer: 'Ganymede (Jupiter)' },
  { question: 'Which planet has the most moons?', options: ['Jupiter','Saturn','Uranus','Neptune'], answer: 'Jupiter' },
  { question: 'What is the Great Red Spot on Jupiter?', options: ['A giant storm that has lasted hundreds of years','A large volcano','A large crater','A large ocean'], answer: 'A giant storm that has lasted hundreds of years' },
  { question: 'What is the approximate age of the solar system?', options: ['4.6 billion years','1 billion years','10 billion years','13.8 billion years'], answer: '4.6 billion years' },
];
const L4: QuizQuestion[] = [
  { question: 'What is Kepler\'s first law?', options: ['Planets orbit the Sun in ellipses with the Sun at one focus','Planets orbit the Sun in circles','Planets orbit the Sun at constant speed','All planets take the same time to orbit'], answer: 'Planets orbit the Sun in ellipses with the Sun at one focus' },
  { question: 'What is Kepler\'s second law?', options: ['A planet sweeps equal areas in equal times','Planets orbit in circles','The square of the orbital period is proportional to the cube of the semi-major axis','All planets orbit at the same speed'], answer: 'A planet sweeps equal areas in equal times' },
  { question: 'What is Kepler\'s third law?', options: ['T² ∝ r³ (orbital period squared is proportional to orbital radius cubed)','Planets orbit in ellipses','A planet sweeps equal areas in equal times','All planets orbit at the same speed'], answer: 'T² ∝ r³ (orbital period squared is proportional to orbital radius cubed)' },
  { question: 'What is the Hill sphere?', options: ['The region around a body where it dominates the gravitational attraction','The region around the Sun where planets orbit','The region around a planet where moons orbit','The region around a star where life could exist'], answer: 'The region around a body where it dominates the gravitational attraction' },
  { question: 'What is the Roche limit?', options: ['The distance within which a satellite would be torn apart by tidal forces','The distance at which a planet can have moons','The distance at which a comet breaks up','The distance at which rings form'], answer: 'The distance within which a satellite would be torn apart by tidal forces' },
  { question: 'What is the habitable zone?', options: ['The region around a star where liquid water could exist on a planet\'s surface','The region where planets can form','The region where comets orbit','The region where asteroids orbit'], answer: 'The region around a star where liquid water could exist on a planet\'s surface' },
  { question: 'What is the approximate orbital period of Jupiter?', options: ['12 years','1 year','84 years','165 years'], answer: '12 years' },
  { question: 'What is the approximate orbital period of Neptune?', options: ['165 years','84 years','12 years','248 years'], answer: '165 years' },
  { question: 'What is the concept of tidal locking?', options: ['A moon always shows the same face to its planet due to gravitational forces','A moon orbits faster than the planet rotates','A moon orbits slower than the planet rotates','A moon has no rotation'], answer: 'A moon always shows the same face to its planet due to gravitational forces' },
  { question: 'What is the difference between a meteor, meteoroid and meteorite?', options: ['Meteoroid: in space; meteor: burning in atmosphere; meteorite: landed on Earth','Meteoroid: landed on Earth; meteor: in space; meteorite: burning in atmosphere','Meteor: in space; meteoroid: burning in atmosphere; meteorite: landed on Earth','All three are the same thing'], answer: 'Meteoroid: in space; meteor: burning in atmosphere; meteorite: landed on Earth' },
  { question: 'What is the approximate distance from Earth to the Moon?', options: ['384,000 km','38,400 km','3,840,000 km','38,400,000 km'], answer: '384,000 km' },
  { question: 'What is the concept of planetary differentiation?', options: ['The separation of a planet into layers by density during formation','The formation of different types of planets','The difference in size between planets','The difference in composition between planets'], answer: 'The separation of a planet into layers by density during formation' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the Nice model?', options: ['A model of solar system formation involving migration of giant planets','A model of star formation','A model of galaxy formation','A model of black hole formation'], answer: 'A model of solar system formation involving migration of giant planets' },
  { question: 'What is the Grand Tack hypothesis?', options: ['Jupiter migrated inward then outward, shaping the inner solar system','Jupiter has always been in its current orbit','Saturn migrated inward then outward','The asteroid belt formed from a destroyed planet'], answer: 'Jupiter migrated inward then outward, shaping the inner solar system' },
  { question: 'What is the concept of resonance in orbital mechanics?', options: ['Orbital periods of two bodies form a simple integer ratio','Two bodies orbit at the same speed','Two bodies orbit at the same distance','Two bodies have the same mass'], answer: 'Orbital periods of two bodies form a simple integer ratio' },
  { question: 'What is the Lagrange point?', options: ['A point where gravitational forces of two bodies balance, allowing a third body to orbit stably','A point where two bodies collide','A point where a body escapes the solar system','A point where a body is captured by a planet'], answer: 'A point where gravitational forces of two bodies balance, allowing a third body to orbit stably' },
  { question: 'What is the concept of planetary migration?', options: ['Planets moving inward or outward from their formation location','Planets moving between star systems','Planets changing their axial tilt','Planets changing their rotation speed'], answer: 'Planets moving inward or outward from their formation location' },
  { question: 'What is the concept of the Late Heavy Bombardment?', options: ['A period ~4 billion years ago of intense asteroid impacts on inner solar system bodies','The current rate of asteroid impacts','The formation of the asteroid belt','The formation of the Moon'], answer: 'A period ~4 billion years ago of intense asteroid impacts on inner solar system bodies' },
  { question: 'What is the Giant Impact Hypothesis?', options: ['The Moon formed from debris after a Mars-sized body hit early Earth','The Moon was captured from elsewhere','The Moon formed at the same time as Earth from the same material','The Moon is a captured asteroid'], answer: 'The Moon formed from debris after a Mars-sized body hit early Earth' },
  { question: 'What is the concept of the frost line (snow line)?', options: ['The distance from the Sun beyond which water ice can exist in the protoplanetary disc','The distance at which planets can form','The distance at which comets orbit','The distance at which asteroids orbit'], answer: 'The distance from the Sun beyond which water ice can exist in the protoplanetary disc' },
  { question: 'What is the concept of accretion in planet formation?', options: ['The gradual growth of planets by accumulation of material','The sudden formation of planets','The capture of planets by the Sun','The destruction of planets'], answer: 'The gradual growth of planets by accumulation of material' },
  { question: 'What is the concept of exoplanets?', options: ['Planets orbiting stars other than the Sun','Planets outside the solar system that orbit no star','Planets in the asteroid belt','Planets in the Kuiper Belt'], answer: 'Planets orbiting stars other than the Sun' },
  { question: 'What is the transit method of exoplanet detection?', options: ['Detecting the dimming of a star as a planet passes in front of it','Detecting the wobble of a star due to a planet\'s gravity','Detecting the light reflected by a planet','Detecting the heat emitted by a planet'], answer: 'Detecting the dimming of a star as a planet passes in front of it' },
  { question: 'What is the radial velocity method of exoplanet detection?', options: ['Detecting the Doppler shift of a star\'s light due to a planet\'s gravitational pull','Detecting the dimming of a star','Detecting the light reflected by a planet','Detecting the heat emitted by a planet'], answer: 'Detecting the Doppler shift of a star\'s light due to a planet\'s gravitational pull' },
];

export default function SolarSystemGame() {
  return (
    <>
      <Helmet>
        <title>Solar System — Sodafom</title>
        <meta name="description" content="Explore the planets, moons, and wonders of our solar system!" />
        <link rel="canonical" href="https://sodafom.uk/games/solar-system" />
        <meta property="og:title" content="Solar System — Sodafom" />
        <meta property="og:description" content="Explore the planets, moons, and wonders of our solar system!" />
        <meta property="og:url" content="https://sodafom.uk/games/solar-system" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Solar System — Science Game for Kids — Sodafom</h1>
      <GameShell title="Solar System" emoji="🪐" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="solar-system"
            title="Solar System"
            emoji="🪐"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
