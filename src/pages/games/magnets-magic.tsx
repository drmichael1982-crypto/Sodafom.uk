import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What does a magnet attract?', options: ['Magnetic materials like iron and steel','All metals','All materials','Only gold and silver'], answer: 'Magnetic materials like iron and steel' },
  { question: 'What are the two poles of a magnet called?', options: ['North and South','East and West','Positive and Negative','Up and Down'], answer: 'North and South' },
  { question: 'What happens when two north poles are brought together?', options: ['They repel','They attract','Nothing happens','They stick together'], answer: 'They repel' },
  { question: 'What happens when a north and south pole are brought together?', options: ['They attract','They repel','Nothing happens','They push apart'], answer: 'They attract' },
  { question: 'Is iron magnetic?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Is copper magnetic?', options: ['No','Yes'], answer: 'No' },
  { question: 'Is steel magnetic?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Is aluminium magnetic?', options: ['No','Yes'], answer: 'No' },
  { question: 'What is a compass used for?', options: ['Finding direction using a magnetic needle','Measuring distance','Measuring temperature','Measuring time'], answer: 'Finding direction using a magnetic needle' },
  { question: 'What does a compass needle point towards?', options: ['Magnetic north','True north','South','East'], answer: 'Magnetic north' },
  { question: 'What is a permanent magnet?', options: ['A magnet that keeps its magnetism','A magnet that loses its magnetism','A magnet that can be switched on and off','A magnet made of copper'], answer: 'A magnet that keeps its magnetism' },
  { question: 'What is an electromagnet?', options: ['A magnet created by electric current','A permanent magnet','A natural magnet','A magnet made of copper'], answer: 'A magnet created by electric current' },
];
const L2: QuizQuestion[] = [
  { question: 'What is a magnetic field?', options: ['The region around a magnet where magnetic forces act','The strength of a magnet','The poles of a magnet','The material a magnet is made of'], answer: 'The region around a magnet where magnetic forces act' },
  { question: 'Where is a magnetic field strongest?', options: ['At the poles','In the middle','Everywhere equally','Away from the magnet'], answer: 'At the poles' },
  { question: 'What do magnetic field lines show?', options: ['The direction and strength of the magnetic field','The temperature of the magnet','The weight of the magnet','The colour of the magnet'], answer: 'The direction and strength of the magnetic field' },
  { question: 'What is magnetic induction?', options: ['Making a material magnetic by placing it near a magnet','Making a magnet stronger','Making a magnet weaker','Destroying a magnet'], answer: 'Making a material magnetic by placing it near a magnet' },
  { question: 'What is demagnetisation?', options: ['Removing the magnetism from a magnet','Adding magnetism to a material','Making a magnet stronger','Making a magnet weaker'], answer: 'Removing the magnetism from a magnet' },
  { question: 'How can you demagnetise a magnet?', options: ['Heating it or hitting it','Cooling it','Placing it near another magnet','Wrapping it in copper wire'], answer: 'Heating it or hitting it' },
  { question: 'What is the Earth\'s magnetic field caused by?', options: ['Movement of molten iron in the core','The rotation of the Earth','The Sun\'s gravity','The Moon\'s gravity'], answer: 'Movement of molten iron in the core' },
  { question: 'What is a solenoid?', options: ['A coil of wire that acts as a magnet when current flows','A type of permanent magnet','A type of compass','A type of iron ore'], answer: 'A coil of wire that acts as a magnet when current flows' },
  { question: 'How can you make an electromagnet stronger?', options: ['Increase the current or add more coils','Decrease the current','Use a shorter wire','Use a thinner wire'], answer: 'Increase the current or add more coils' },
  { question: 'What is magnetic flux density measured in?', options: ['Tesla (T)','Newton (N)','Ampere (A)','Volt (V)'], answer: 'Tesla (T)' },
  { question: 'What is electromagnetic induction?', options: ['Generating electricity by moving a conductor in a magnetic field','Creating a magnetic field with electricity','Making a material magnetic','Demagnetising a magnet'], answer: 'Generating electricity by moving a conductor in a magnetic field' },
  { question: 'What is a generator?', options: ['A device that converts kinetic energy to electrical energy','A device that converts electrical energy to kinetic energy','A device that stores electrical energy','A device that converts electrical energy to heat'], answer: 'A device that converts kinetic energy to electrical energy' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the right-hand rule for a solenoid?', options: ['Curl fingers in direction of current; thumb points to north pole','Curl fingers in direction of current; thumb points to south pole','Point fingers in direction of current; thumb points to north pole','Point fingers in direction of current; thumb points to south pole'], answer: 'Curl fingers in direction of current; thumb points to north pole' },
  { question: 'What is the motor effect?', options: ['A current-carrying conductor in a magnetic field experiences a force','A conductor moving in a magnetic field generates current','A magnet attracting iron','A magnet repelling another magnet'], answer: 'A current-carrying conductor in a magnetic field experiences a force' },
  { question: 'What is Fleming\'s left-hand rule used for?', options: ['Finding the direction of force on a current-carrying conductor in a magnetic field','Finding the direction of induced current','Finding the direction of magnetic field','Finding the direction of electric field'], answer: 'Finding the direction of force on a current-carrying conductor in a magnetic field' },
  { question: 'What is Fleming\'s right-hand rule used for?', options: ['Finding the direction of induced current in a conductor moving in a magnetic field','Finding the direction of force on a conductor','Finding the direction of magnetic field','Finding the direction of electric field'], answer: 'Finding the direction of induced current in a conductor moving in a magnetic field' },
  { question: 'What is the formula for force on a current-carrying conductor?', options: ['F = BIL','F = BIL²','F = B/IL','F = BI/L'], answer: 'F = BIL' },
  { question: 'What is a DC motor?', options: ['A device that converts electrical energy to rotational kinetic energy','A device that converts kinetic energy to electrical energy','A device that stores magnetic energy','A device that converts AC to DC'], answer: 'A device that converts electrical energy to rotational kinetic energy' },
  { question: 'What is a commutator in a DC motor?', options: ['A device that reverses current direction to keep the motor spinning','A device that stores charge','A device that measures current','A device that increases voltage'], answer: 'A device that reverses current direction to keep the motor spinning' },
  { question: 'What is Faraday\'s law of electromagnetic induction?', options: ['The induced EMF is proportional to the rate of change of magnetic flux','The induced current is proportional to the magnetic field','The induced voltage is proportional to the current','The induced force is proportional to the magnetic field'], answer: 'The induced EMF is proportional to the rate of change of magnetic flux' },
  { question: 'What is Lenz\'s law?', options: ['The induced current opposes the change that caused it','The induced current aids the change that caused it','The induced current is always in the same direction','The induced current is always zero'], answer: 'The induced current opposes the change that caused it' },
  { question: 'What is magnetic flux?', options: ['The product of magnetic flux density and area (Φ = BA)','The strength of a magnetic field','The direction of a magnetic field','The speed of a magnetic field'], answer: 'The product of magnetic flux density and area (Φ = BA)' },
  { question: 'What is an AC generator?', options: ['A device that converts kinetic energy to alternating electrical energy','A device that converts DC to AC','A device that stores magnetic energy','A device that converts AC to DC'], answer: 'A device that converts kinetic energy to alternating electrical energy' },
  { question: 'What is the formula for force on a moving charge in a magnetic field?', options: ['F = BQv','F = BQ/v','F = B/Qv','F = BQv²'], answer: 'F = BQv' },
];
const L4: QuizQuestion[] = [
  { question: 'What is magnetic permeability?', options: ['A measure of how easily a material is magnetised','A measure of how strongly a material is magnetised','A measure of the magnetic field strength','A measure of the magnetic flux'], answer: 'A measure of how easily a material is magnetised' },
  { question: 'What is a ferromagnetic material?', options: ['A material that can be strongly magnetised (e.g. iron, nickel, cobalt)','A material that is weakly repelled by magnets','A material that is weakly attracted to magnets','A material that cannot be magnetised'], answer: 'A material that can be strongly magnetised (e.g. iron, nickel, cobalt)' },
  { question: 'What is a paramagnetic material?', options: ['A material weakly attracted to magnets','A material strongly attracted to magnets','A material repelled by magnets','A material that cannot be magnetised'], answer: 'A material weakly attracted to magnets' },
  { question: 'What is a diamagnetic material?', options: ['A material weakly repelled by magnets','A material weakly attracted to magnets','A material strongly attracted to magnets','A material that cannot be magnetised'], answer: 'A material weakly repelled by magnets' },
  { question: 'What is magnetic hysteresis?', options: ['The lag between magnetisation and the applied field in ferromagnetic materials','The loss of magnetism when heated','The gain of magnetism when cooled','The random change in magnetism'], answer: 'The lag between magnetisation and the applied field in ferromagnetic materials' },
  { question: 'What is the Curie temperature?', options: ['The temperature above which a ferromagnetic material loses its magnetism','The temperature at which a material becomes superconducting','The temperature at which a material becomes paramagnetic','The temperature at which a material becomes diamagnetic'], answer: 'The temperature above which a ferromagnetic material loses its magnetism' },
  { question: 'What is a magnetic domain?', options: ['A region in a ferromagnetic material where atomic magnets are aligned','A region of strong magnetic field outside a magnet','A region of weak magnetic field','A region of zero magnetic field'], answer: 'A region in a ferromagnetic material where atomic magnets are aligned' },
  { question: 'What is the formula for the EMF induced in a rotating coil?', options: ['ε = NBAω sin(ωt)','ε = NBAω cos(ωt)','ε = NBA sin(ωt)','ε = NBAω'], answer: 'ε = NBAω sin(ωt)' },
  { question: 'What is mutual inductance?', options: ['The property of two coils where a changing current in one induces EMF in the other','The property of one coil inducing EMF in itself','The property of a coil storing magnetic energy','The property of a coil resisting current change'], answer: 'The property of two coils where a changing current in one induces EMF in the other' },
  { question: 'What is self-inductance?', options: ['The property of a coil where a changing current induces an opposing EMF in itself','The property of two coils inducing EMF in each other','The property of a coil storing charge','The property of a coil resisting voltage change'], answer: 'The property of a coil where a changing current induces an opposing EMF in itself' },
  { question: 'What is the unit of inductance?', options: ['Henry (H)','Tesla (T)','Weber (Wb)','Farad (F)'], answer: 'Henry (H)' },
  { question: 'What is the formula for energy stored in an inductor?', options: ['E = ½LI²','E = LI²','E = ½LI','E = LI'], answer: 'E = ½LI²' },
];
const L5: QuizQuestion[] = [
  { question: 'What are Maxwell\'s equations?', options: ['Four equations describing all classical electromagnetic phenomena','Newton\'s laws applied to electromagnetism','Equations for magnetic force only','Equations for electric force only'], answer: 'Four equations describing all classical electromagnetic phenomena' },
  { question: 'What is the displacement current?', options: ['A term Maxwell added to Ampere\'s law to account for changing electric fields','A current in a capacitor','A current in a resistor','A current in an inductor'], answer: 'A term Maxwell added to Ampere\'s law to account for changing electric fields' },
  { question: 'What is the Lorentz force?', options: ['F = q(E + v×B) — the force on a charge in electric and magnetic fields','F = qE only','F = qvB only','F = q(E - v×B)'], answer: 'F = q(E + v×B) — the force on a charge in electric and magnetic fields' },
  { question: 'What is a cyclotron?', options: ['A particle accelerator using magnetic fields to curve charged particles in a spiral','A type of generator','A type of transformer','A type of motor'], answer: 'A particle accelerator using magnetic fields to curve charged particles in a spiral' },
  { question: 'What is the Hall voltage?', options: ['A voltage produced perpendicular to current flow in a magnetic field','A voltage produced parallel to current flow','A voltage produced by a changing magnetic field','A voltage produced by a changing electric field'], answer: 'A voltage produced perpendicular to current flow in a magnetic field' },
  { question: 'What is magnetic reconnection?', options: ['The process where magnetic field lines break and reconnect, releasing energy','The process of magnetising a material','The process of demagnetising a material','The process of creating a magnetic field'], answer: 'The process where magnetic field lines break and reconnect, releasing energy' },
  { question: 'What is a magnetohydrodynamic (MHD) generator?', options: ['A generator using conducting fluid moving through a magnetic field','A generator using rotating coils','A generator using solar energy','A generator using nuclear energy'], answer: 'A generator using conducting fluid moving through a magnetic field' },
  { question: 'What is the concept of gauge invariance in electromagnetism?', options: ['Physical observables are unchanged by certain transformations of the potentials','The magnetic field is always uniform','The electric field is always uniform','The force is always constant'], answer: 'Physical observables are unchanged by certain transformations of the potentials' },
  { question: 'What is a magnetic monopole?', options: ['A hypothetical particle with only one magnetic pole (never observed)','A magnet with only a north pole','A magnet with only a south pole','A type of electromagnet'], answer: 'A hypothetical particle with only one magnetic pole (never observed)' },
  { question: 'What is the Meissner effect?', options: ['Superconductors expel magnetic fields completely','Superconductors attract magnetic fields','Superconductors have infinite resistance','Superconductors have zero capacitance'], answer: 'Superconductors expel magnetic fields completely' },
  { question: 'What is magnetic flux quantisation?', options: ['Magnetic flux through a superconducting loop is quantised in units of h/2e','Magnetic flux is always zero in a superconductor','Magnetic flux is always maximum in a superconductor','Magnetic flux is continuous in a superconductor'], answer: 'Magnetic flux through a superconducting loop is quantised in units of h/2e' },
  { question: 'What is a SQUID (Superconducting Quantum Interference Device)?', options: ['An extremely sensitive magnetometer using quantum effects','A type of particle accelerator','A type of transformer','A type of motor'], answer: 'An extremely sensitive magnetometer using quantum effects' },
];

export default function MagnetsMagicGame() {
  return (
    <>
      <Helmet>
        <title>Magnets Magic — Sodafom</title>
        <meta name="description" content="Explore the magical world of magnets and magnetic forces!" />
        <link rel="canonical" href="https://sodafom.uk/games/magnets-magic" />
        <meta property="og:title" content="Magnets Magic — Sodafom" />
        <meta property="og:description" content="Explore the magical world of magnets and magnetic forces!" />
        <meta property="og:url" content="https://sodafom.uk/games/magnets-magic" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Magnets Magic — Science Game for Kids — Sodafom</h1>
      <GameShell title="Magnets Magic" emoji="🧲" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="magnets-magic"
            title="Magnets Magic"
            emoji="🧲"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
