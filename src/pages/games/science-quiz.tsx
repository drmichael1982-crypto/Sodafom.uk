import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the chemical symbol for water?', options: ['H₂O','CO₂','O₂','H₂'], answer: 'H₂O' },
  { question: 'What is the chemical symbol for oxygen?', options: ['O₂','H₂O','CO₂','N₂'], answer: 'O₂' },
  { question: 'What is the chemical symbol for carbon dioxide?', options: ['CO₂','H₂O','O₂','N₂'], answer: 'CO₂' },
  { question: 'What is the chemical symbol for gold?', options: ['Au','Go','Gd','Gl'], answer: 'Au' },
  { question: 'What is the chemical symbol for iron?', options: ['Fe','Ir','In','Io'], answer: 'Fe' },
  { question: 'What is the chemical symbol for sodium?', options: ['Na','So','Sd','Sm'], answer: 'Na' },
  { question: 'What is the chemical symbol for potassium?', options: ['K','Po','Pt','Pm'], answer: 'K' },
  { question: 'What is the chemical symbol for silver?', options: ['Ag','Si','Sv','Sl'], answer: 'Ag' },
  { question: 'What is the chemical symbol for lead?', options: ['Pb','Le','Ld','Lp'], answer: 'Pb' },
  { question: 'What is the chemical symbol for copper?', options: ['Cu','Co','Cp','Cr'], answer: 'Cu' },
  { question: 'What is the chemical symbol for carbon?', options: ['C','Ca','Cb','Cr'], answer: 'C' },
  { question: 'What is the chemical symbol for hydrogen?', options: ['H','Hy','Hd','Hr'], answer: 'H' },
];
const L2: QuizQuestion[] = [
  { question: 'What is an element?', options: ['A substance made of only one type of atom','A substance made of two or more types of atoms','A mixture of substances','A type of compound'], answer: 'A substance made of only one type of atom' },
  { question: 'What is a compound?', options: ['A substance made of two or more elements chemically joined','A substance made of one type of atom','A mixture of substances','A type of element'], answer: 'A substance made of two or more elements chemically joined' },
  { question: 'What is a mixture?', options: ['Two or more substances not chemically joined','A substance made of one type of atom','A substance made of two or more elements chemically joined','A type of compound'], answer: 'Two or more substances not chemically joined' },
  { question: 'What is an atom?', options: ['The smallest particle of an element','A type of molecule','A type of compound','A type of mixture'], answer: 'The smallest particle of an element' },
  { question: 'What is a molecule?', options: ['Two or more atoms bonded together','A single atom','A type of element','A type of compound'], answer: 'Two or more atoms bonded together' },
  { question: 'What is the periodic table?', options: ['A table of all known elements','A table of all known compounds','A table of all known mixtures','A table of all known molecules'], answer: 'A table of all known elements' },
  { question: 'What is an acid?', options: ['A substance with pH less than 7','A substance with pH greater than 7','A substance with pH of 7','A type of salt'], answer: 'A substance with pH less than 7' },
  { question: 'What is an alkali?', options: ['A substance with pH greater than 7','A substance with pH less than 7','A substance with pH of 7','A type of acid'], answer: 'A substance with pH greater than 7' },
  { question: 'What is a neutral substance?', options: ['A substance with pH of 7','A substance with pH less than 7','A substance with pH greater than 7','A type of acid'], answer: 'A substance with pH of 7' },
  { question: 'What is a chemical reaction?', options: ['A process that produces new substances','A process that separates substances','A process that mixes substances','A process that heats substances'], answer: 'A process that produces new substances' },
  { question: 'What is a physical change?', options: ['A change that does not produce new substances','A change that produces new substances','A change that cannot be reversed','A change that involves a chemical reaction'], answer: 'A change that does not produce new substances' },
  { question: 'What is a reversible change?', options: ['A change that can be undone','A change that cannot be undone','A change that produces new substances','A change that involves a chemical reaction'], answer: 'A change that can be undone' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the atomic number?', options: ['The number of protons in an atom','The number of neutrons','The number of electrons','The total number of particles'], answer: 'The number of protons in an atom' },
  { question: 'What is the mass number?', options: ['The total number of protons and neutrons','The number of protons only','The number of neutrons only','The number of electrons'], answer: 'The total number of protons and neutrons' },
  { question: 'What is an isotope?', options: ['An atom with the same number of protons but different neutrons','An atom with the same number of neutrons but different protons','An atom with the same number of electrons but different protons','An atom with the same mass number but different atomic number'], answer: 'An atom with the same number of protons but different neutrons' },
  { question: 'What is an ion?', options: ['An atom that has gained or lost electrons','An atom that has gained or lost protons','An atom that has gained or lost neutrons','An atom with no electrons'], answer: 'An atom that has gained or lost electrons' },
  { question: 'What is a covalent bond?', options: ['A bond formed by sharing electrons','A bond formed by transferring electrons','A bond between metals','A bond between ions'], answer: 'A bond formed by sharing electrons' },
  { question: 'What is an ionic bond?', options: ['A bond formed by transferring electrons','A bond formed by sharing electrons','A bond between non-metals','A bond between atoms of the same element'], answer: 'A bond formed by transferring electrons' },
  { question: 'What is the formula for speed?', options: ['Speed = distance / time','Speed = distance × time','Speed = time / distance','Speed = distance + time'], answer: 'Speed = distance / time' },
  { question: 'What is the formula for density?', options: ['Density = mass / volume','Density = mass × volume','Density = volume / mass','Density = mass + volume'], answer: 'Density = mass / volume' },
  { question: 'What is the formula for pressure?', options: ['Pressure = force / area','Pressure = force × area','Pressure = area / force','Pressure = force + area'], answer: 'Pressure = force / area' },
  { question: 'What is the formula for work done?', options: ['Work = force × distance','Work = force / distance','Work = force + distance','Work = force - distance'], answer: 'Work = force × distance' },
  { question: 'What is the formula for power?', options: ['Power = work / time','Power = work × time','Power = time / work','Power = work + time'], answer: 'Power = work / time' },
  { question: 'What is the formula for kinetic energy?', options: ['KE = ½mv²','KE = mv²','KE = ½mv','KE = mv'], answer: 'KE = ½mv²' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the mole in chemistry?', options: ['6.02 × 10²³ particles (Avogadro\'s number)','The mass of one atom','The volume of one atom','The charge of one electron'], answer: '6.02 × 10²³ particles (Avogadro\'s number)' },
  { question: 'What is the formula for moles?', options: ['n = m/M (moles = mass / molar mass)','n = m × M','n = M/m','n = m + M'], answer: 'n = m/M (moles = mass / molar mass)' },
  { question: 'What is the ideal gas law?', options: ['PV = nRT','PV = nR/T','P = nRT/V','PV = RT'], answer: 'PV = nRT' },
  { question: 'What is the law of conservation of mass?', options: ['Mass is neither created nor destroyed in a chemical reaction','Mass always increases in a reaction','Mass always decreases in a reaction','Mass can be created from energy'], answer: 'Mass is neither created nor destroyed in a chemical reaction' },
  { question: 'What is an exothermic reaction?', options: ['A reaction that releases energy to the surroundings','A reaction that absorbs energy from the surroundings','A reaction that produces no energy change','A reaction that only occurs at high temperature'], answer: 'A reaction that releases energy to the surroundings' },
  { question: 'What is an endothermic reaction?', options: ['A reaction that absorbs energy from the surroundings','A reaction that releases energy','A reaction that produces no energy change','A reaction that only occurs at low temperature'], answer: 'A reaction that absorbs energy from the surroundings' },
  { question: 'What is activation energy?', options: ['The minimum energy needed for a reaction to occur','The energy released in a reaction','The energy absorbed in a reaction','The total energy of reactants'], answer: 'The minimum energy needed for a reaction to occur' },
  { question: 'What is a catalyst?', options: ['A substance that speeds up a reaction without being used up','A substance that slows down a reaction','A substance that is used up in a reaction','A substance that changes the products of a reaction'], answer: 'A substance that speeds up a reaction without being used up' },
  { question: 'What is the rate of reaction affected by?', options: ['Temperature, concentration, surface area, catalysts','Temperature only','Concentration only','Surface area only'], answer: 'Temperature, concentration, surface area, catalysts' },
  { question: 'What is the formula for wave speed?', options: ['v = fλ','v = f/λ','v = fλ²','v = f²λ'], answer: 'v = fλ' },
  { question: 'What is the formula for gravitational potential energy?', options: ['GPE = mgh','GPE = mg/h','GPE = m+g+h','GPE = mgh²'], answer: 'GPE = mgh' },
  { question: 'What is the formula for momentum?', options: ['p = mv','p = m/v','p = m+v','p = m-v'], answer: 'p = mv' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the Gibbs free energy equation?', options: ['ΔG = ΔH - TΔS','ΔG = ΔH + TΔS','ΔG = ΔH × TΔS','ΔG = ΔH / TΔS'], answer: 'ΔG = ΔH - TΔS' },
  { question: 'What does a negative ΔG indicate?', options: ['A spontaneous reaction','A non-spontaneous reaction','An endothermic reaction','An exothermic reaction'], answer: 'A spontaneous reaction' },
  { question: 'What is the Arrhenius equation?', options: ['k = Ae^(-Ea/RT)','k = Ae^(Ea/RT)','k = A/e^(Ea/RT)','k = A × Ea/RT'], answer: 'k = Ae^(-Ea/RT)' },
  { question: 'What is the Boltzmann distribution?', options: ['The distribution of molecular energies in a gas at a given temperature','The distribution of molecular speeds','The distribution of molecular masses','The distribution of molecular charges'], answer: 'The distribution of molecular energies in a gas at a given temperature' },
  { question: 'What is the concept of entropy?', options: ['A measure of disorder or randomness in a system','A measure of energy','A measure of temperature','A measure of pressure'], answer: 'A measure of disorder or randomness in a system' },
  { question: 'What is the second law of thermodynamics?', options: ['The total entropy of an isolated system always increases','Energy is conserved','Energy cannot be created or destroyed','The entropy of a perfect crystal at 0K is zero'], answer: 'The total entropy of an isolated system always increases' },
  { question: 'What is the Heisenberg uncertainty principle?', options: ['You cannot simultaneously know both position and momentum precisely','You cannot know the energy of a particle','You cannot know the speed of light','You cannot know the charge of an electron'], answer: 'You cannot simultaneously know both position and momentum precisely' },
  { question: 'What is nuclear fission?', options: ['Splitting a heavy nucleus into smaller nuclei, releasing energy','Combining light nuclei to form a heavier nucleus','The decay of a radioactive nucleus','The emission of gamma radiation'], answer: 'Splitting a heavy nucleus into smaller nuclei, releasing energy' },
  { question: 'What is nuclear fusion?', options: ['Combining light nuclei to form a heavier nucleus, releasing energy','Splitting a heavy nucleus','The decay of a radioactive nucleus','The emission of alpha radiation'], answer: 'Combining light nuclei to form a heavier nucleus, releasing energy' },
  { question: 'What is the strong nuclear force?', options: ['The force that holds protons and neutrons together in the nucleus','The force between electrons and protons','The force between atoms','The force between molecules'], answer: 'The force that holds protons and neutrons together in the nucleus' },
  { question: 'What is the concept of wave-particle duality?', options: ['All matter and radiation exhibit both wave and particle properties','Only light has wave properties','Only electrons have particle properties','Matter has only particle properties'], answer: 'All matter and radiation exhibit both wave and particle properties' },
  { question: 'What is the concept of quantum entanglement?', options: ['Two particles can be correlated such that measuring one instantly affects the other','Two particles can be in the same place','Two particles can have the same energy','Two particles can have the same momentum'], answer: 'Two particles can be correlated such that measuring one instantly affects the other' },
];

export default function ScienceQuizGame() {
  return (
    <>
      <Helmet>
        <title>Science Quiz — Sodafom</title>
        <meta name="description" content="Test your science knowledge across all topics!" />
        <link rel="canonical" href="https://sodafom.uk/games/science-quiz" />
        <meta property="og:title" content="Science Quiz — Sodafom" />
        <meta property="og:description" content="Test your science knowledge across all topics!" />
        <meta property="og:url" content="https://sodafom.uk/games/science-quiz" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Science Quiz — Science Game for Kids — Sodafom</h1>
      <GameShell title="Science Quiz" emoji="🔭" subject="science" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="science-quiz"
            title="Science Quiz"
            emoji="🔭"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
