import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What are the three states of matter?', options: ['Solid, liquid, gas','Hard, soft, fluid','Fixed, moving, floating','Dense, light, medium'], answer: 'Solid, liquid, gas' },
  { question: 'What is a solid?', options: ['A state with fixed shape and volume','A state with no fixed shape','A state with no fixed volume','A state that fills its container'], answer: 'A state with fixed shape and volume' },
  { question: 'What is a liquid?', options: ['A state with fixed volume but no fixed shape','A state with fixed shape and volume','A state with no fixed volume','A state that fills its container'], answer: 'A state with fixed volume but no fixed shape' },
  { question: 'What is a gas?', options: ['A state with no fixed shape or volume','A state with fixed shape and volume','A state with fixed volume','A state that does not fill its container'], answer: 'A state with no fixed shape or volume' },
  { question: 'What is melting?', options: ['Solid changing to liquid','Liquid changing to gas','Gas changing to liquid','Liquid changing to solid'], answer: 'Solid changing to liquid' },
  { question: 'What is freezing?', options: ['Liquid changing to solid','Solid changing to liquid','Liquid changing to gas','Gas changing to liquid'], answer: 'Liquid changing to solid' },
  { question: 'What is evaporation?', options: ['Liquid changing to gas','Gas changing to liquid','Solid changing to liquid','Liquid changing to solid'], answer: 'Liquid changing to gas' },
  { question: 'What is condensation?', options: ['Gas changing to liquid','Liquid changing to gas','Solid changing to liquid','Liquid changing to solid'], answer: 'Gas changing to liquid' },
  { question: 'What is sublimation?', options: ['Solid changing directly to gas','Gas changing directly to solid','Liquid changing to gas','Gas changing to liquid'], answer: 'Solid changing directly to gas' },
  { question: 'At what temperature does water freeze?', options: ['0°C','100°C','-100°C','50°C'], answer: '0°C' },
  { question: 'At what temperature does water boil?', options: ['100°C','0°C','50°C','200°C'], answer: '100°C' },
  { question: 'What is the melting point of ice?', options: ['0°C','100°C','-100°C','50°C'], answer: '0°C' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the particle model of matter?', options: ['All matter is made of tiny particles','Matter is made of waves','Matter is made of fields','Matter is continuous'], answer: 'All matter is made of tiny particles' },
  { question: 'How are particles arranged in a solid?', options: ['Close together in a regular pattern','Close together in a random pattern','Far apart in a random pattern','Far apart in a regular pattern'], answer: 'Close together in a regular pattern' },
  { question: 'How are particles arranged in a liquid?', options: ['Close together in a random pattern','Close together in a regular pattern','Far apart in a random pattern','Far apart in a regular pattern'], answer: 'Close together in a random pattern' },
  { question: 'How are particles arranged in a gas?', options: ['Far apart in a random pattern','Close together in a regular pattern','Close together in a random pattern','Far apart in a regular pattern'], answer: 'Far apart in a random pattern' },
  { question: 'What is diffusion?', options: ['The spreading of particles from high to low concentration','The movement of particles in a solid','The arrangement of particles in a liquid','The speed of particles in a gas'], answer: 'The spreading of particles from high to low concentration' },
  { question: 'What is Brownian motion?', options: ['The random movement of particles in a fluid','The regular movement of particles in a solid','The movement of particles in a vacuum','The movement of particles in a magnetic field'], answer: 'The random movement of particles in a fluid' },
  { question: 'What happens to particles when heated?', options: ['They move faster','They move slower','They stop moving','They become heavier'], answer: 'They move faster' },
  { question: 'What is the fourth state of matter?', options: ['Plasma','Superfluid','Bose-Einstein condensate','Dark matter'], answer: 'Plasma' },
  { question: 'What is absolute zero?', options: ['-273°C (the lowest possible temperature)','0°C','100°C','-100°C'], answer: '-273°C (the lowest possible temperature)' },
  { question: 'What is the Kelvin scale?', options: ['A temperature scale starting at absolute zero','A temperature scale starting at 0°C','A temperature scale starting at 100°C','A temperature scale starting at -100°C'], answer: 'A temperature scale starting at absolute zero' },
  { question: 'What is 0°C in Kelvin?', options: ['273 K','0 K','100 K','373 K'], answer: '273 K' },
  { question: 'What is 100°C in Kelvin?', options: ['373 K','273 K','100 K','473 K'], answer: '373 K' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the formula for converting Celsius to Kelvin?', options: ['K = °C + 273','K = °C - 273','K = °C × 273','K = °C / 273'], answer: 'K = °C + 273' },
  { question: 'What is the ideal gas law?', options: ['PV = nRT','PV = nR/T','P = nRT/V','PV = RT'], answer: 'PV = nRT' },
  { question: 'What is Boyle\'s Law?', options: ['At constant temperature, pressure × volume = constant','At constant pressure, volume / temperature = constant','At constant volume, pressure / temperature = constant','Pressure × volume × temperature = constant'], answer: 'At constant temperature, pressure × volume = constant' },
  { question: 'What is Charles\'s Law?', options: ['At constant pressure, volume / temperature = constant','At constant temperature, pressure × volume = constant','At constant volume, pressure / temperature = constant','Pressure × volume × temperature = constant'], answer: 'At constant pressure, volume / temperature = constant' },
  { question: 'What is Gay-Lussac\'s Law?', options: ['At constant volume, pressure / temperature = constant','At constant temperature, pressure × volume = constant','At constant pressure, volume / temperature = constant','Pressure × volume × temperature = constant'], answer: 'At constant volume, pressure / temperature = constant' },
  { question: 'What is a Bose-Einstein condensate?', options: ['A fifth state of matter formed at temperatures near absolute zero','A type of plasma','A type of superfluid','A type of superconductor'], answer: 'A fifth state of matter formed at temperatures near absolute zero' },
  { question: 'What is a superfluid?', options: ['A fluid with zero viscosity that flows without friction','A very fast-flowing fluid','A very dense fluid','A very hot fluid'], answer: 'A fluid with zero viscosity that flows without friction' },
  { question: 'What is viscosity?', options: ['A fluid\'s resistance to flow','A fluid\'s density','A fluid\'s temperature','A fluid\'s pressure'], answer: 'A fluid\'s resistance to flow' },
  { question: 'What is surface tension?', options: ['The tendency of a liquid surface to minimise its area due to cohesive forces','The pressure at the surface of a liquid','The temperature at the surface of a liquid','The density at the surface of a liquid'], answer: 'The tendency of a liquid surface to minimise its area due to cohesive forces' },
  { question: 'What is capillary action?', options: ['The ability of a liquid to flow in narrow spaces against gravity','The ability of a liquid to evaporate','The ability of a liquid to freeze','The ability of a liquid to conduct electricity'], answer: 'The ability of a liquid to flow in narrow spaces against gravity' },
  { question: 'What is the critical point?', options: ['The temperature and pressure above which a substance cannot exist as a liquid','The temperature at which a substance melts','The temperature at which a substance boils','The temperature at which a substance sublimes'], answer: 'The temperature and pressure above which a substance cannot exist as a liquid' },
  { question: 'What is a supercritical fluid?', options: ['A substance above its critical temperature and pressure with properties of both liquid and gas','A very hot gas','A very dense liquid','A type of plasma'], answer: 'A substance above its critical temperature and pressure with properties of both liquid and gas' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the van der Waals equation?', options: ['(P + a/V²)(V - b) = nRT — a correction to the ideal gas law','PV = nRT','P = nRT/V','PV = RT'], answer: '(P + a/V²)(V - b) = nRT — a correction to the ideal gas law' },
  { question: 'What is the concept of intermolecular forces?', options: ['Forces between molecules that determine physical properties','Forces within molecules','Forces between atoms','Forces between electrons'], answer: 'Forces between molecules that determine physical properties' },
  { question: 'What are van der Waals forces?', options: ['Weak intermolecular forces including London dispersion, dipole-dipole and hydrogen bonding','Strong covalent bonds','Ionic bonds','Metallic bonds'], answer: 'Weak intermolecular forces including London dispersion, dipole-dipole and hydrogen bonding' },
  { question: 'What is a hydrogen bond?', options: ['A strong intermolecular force between H bonded to N, O or F and another N, O or F','A covalent bond involving hydrogen','An ionic bond involving hydrogen','A metallic bond involving hydrogen'], answer: 'A strong intermolecular force between H bonded to N, O or F and another N, O or F' },
  { question: 'What is the concept of entropy in phase transitions?', options: ['Entropy increases when going from solid to liquid to gas','Entropy decreases when going from solid to liquid to gas','Entropy is constant during phase transitions','Entropy only changes during chemical reactions'], answer: 'Entropy increases when going from solid to liquid to gas' },
  { question: 'What is a phase diagram?', options: ['A graph showing the states of matter at different temperatures and pressures','A graph showing the energy of a substance','A graph showing the density of a substance','A graph showing the viscosity of a substance'], answer: 'A graph showing the states of matter at different temperatures and pressures' },
  { question: 'What is the triple point?', options: ['The temperature and pressure at which all three states of matter coexist','The temperature at which a substance melts','The temperature at which a substance boils','The temperature at which a substance sublimes'], answer: 'The temperature and pressure at which all three states of matter coexist' },
  { question: 'What is latent heat?', options: ['The energy needed to change state without changing temperature','The energy needed to raise temperature','The energy released when cooling','The energy absorbed when heating'], answer: 'The energy needed to change state without changing temperature' },
  { question: 'What is the specific latent heat of fusion?', options: ['Energy needed per kg to melt a substance','Energy needed per kg to boil a substance','Energy needed per kg to sublime a substance','Energy needed per kg to raise temperature by 1°C'], answer: 'Energy needed per kg to melt a substance' },
  { question: 'What is the specific latent heat of vaporisation?', options: ['Energy needed per kg to boil a substance','Energy needed per kg to melt a substance','Energy needed per kg to sublime a substance','Energy needed per kg to raise temperature by 1°C'], answer: 'Energy needed per kg to boil a substance' },
  { question: 'What is the specific heat capacity?', options: ['Energy needed per kg per °C to raise temperature','Energy needed per kg to melt','Energy needed per kg to boil','Energy needed per kg to sublime'], answer: 'Energy needed per kg per °C to raise temperature' },
  { question: 'What is the formula for heat energy?', options: ['Q = mcΔT','Q = mc/ΔT','Q = m/cΔT','Q = mcT'], answer: 'Q = mcΔT' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of quantum statistics?', options: ['Fermions obey Fermi-Dirac statistics; bosons obey Bose-Einstein statistics','All particles obey the same statistics','Particles obey classical Maxwell-Boltzmann statistics at all temperatures','Quantum statistics only apply to gases'], answer: 'Fermions obey Fermi-Dirac statistics; bosons obey Bose-Einstein statistics' },
  { question: 'What is the Pauli exclusion principle?', options: ['No two fermions can occupy the same quantum state simultaneously','All bosons must occupy the same quantum state','Particles can occupy any quantum state','Quantum states are not quantised'], answer: 'No two fermions can occupy the same quantum state simultaneously' },
  { question: 'What is the concept of degenerate matter?', options: ['Matter so dense that quantum effects dominate (e.g. in white dwarfs and neutron stars)','Matter at very low temperature','Matter at very high temperature','Matter in a superfluid state'], answer: 'Matter so dense that quantum effects dominate (e.g. in white dwarfs and neutron stars)' },
  { question: 'What is the concept of plasma oscillations?', options: ['Collective oscillations of electrons in a plasma','Oscillations of ions in a plasma','Oscillations of neutral atoms in a plasma','Oscillations of photons in a plasma'], answer: 'Collective oscillations of electrons in a plasma' },
  { question: 'What is the concept of the Debye model?', options: ['A model of heat capacity of solids treating vibrations as phonons','A model of ideal gases','A model of liquids','A model of plasmas'], answer: 'A model of heat capacity of solids treating vibrations as phonons' },
  { question: 'What is the concept of the Einstein model of solids?', options: ['A model treating each atom as an independent quantum harmonic oscillator','A model of ideal gases','A model of liquids','A model of plasmas'], answer: 'A model treating each atom as an independent quantum harmonic oscillator' },
  { question: 'What is the concept of the Fermi energy?', options: ['The highest energy occupied by electrons at absolute zero','The average energy of electrons','The minimum energy of electrons','The energy of the most energetic photon'], answer: 'The highest energy occupied by electrons at absolute zero' },
  { question: 'What is the concept of Cooper pairs?', options: ['Pairs of electrons that form in superconductors and carry current without resistance','Pairs of protons','Pairs of neutrons','Pairs of atoms'], answer: 'Pairs of electrons that form in superconductors and carry current without resistance' },
  { question: 'What is the concept of topological phases of matter?', options: ['Phases characterised by topological properties rather than symmetry breaking','Phases characterised by temperature only','Phases characterised by pressure only','Phases characterised by density only'], answer: 'Phases characterised by topological properties rather than symmetry breaking' },
  { question: 'What is the concept of quantum spin liquids?', options: ['A state of matter where spins are entangled but do not order even at absolute zero','A liquid with quantum properties','A superfluid','A Bose-Einstein condensate'], answer: 'A state of matter where spins are entangled but do not order even at absolute zero' },
  { question: 'What is the concept of the Ising model?', options: ['A mathematical model of ferromagnetism using interacting spins on a lattice','A model of ideal gases','A model of liquids','A model of plasmas'], answer: 'A mathematical model of ferromagnetism using interacting spins on a lattice' },
  { question: 'What is the concept of universality in phase transitions?', options: ['Different systems near a critical point share the same critical exponents regardless of microscopic details','All phase transitions are identical','Phase transitions depend only on temperature','Phase transitions depend only on pressure'], answer: 'Different systems near a critical point share the same critical exponents regardless of microscopic details' },
];

export default function StatesOfMatterGame() {
  return (
    <>
      <Helmet>
        <title>States of Matter — Sodafom</title>
        <meta name="description" content="Learn about solids, liquids, and gases!" />
        <link rel="canonical" href="https://sodafom.uk/games/states-of-matter" />
        <meta property="og:title" content="States of Matter — Sodafom" />
        <meta property="og:description" content="Learn about solids, liquids, and gases!" />
        <meta property="og:url" content="https://sodafom.uk/games/states-of-matter" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">States of Matter — Science Game for Kids — Sodafom</h1>
      <GameShell title="States of Matter" emoji="💧" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="states-of-matter"
            title="States of Matter"
            emoji="💧"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
