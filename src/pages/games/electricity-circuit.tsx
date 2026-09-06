import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What does a battery do in a circuit?', options: ['Provides electrical energy','Stops electricity','Measures electricity','Converts electricity to light'], answer: 'Provides electrical energy' },
  { question: 'What does a bulb do in a circuit?', options: ['Converts electricity to light','Provides electrical energy','Stops electricity','Measures electricity'], answer: 'Converts electricity to light' },
  { question: 'What does a switch do in a circuit?', options: ['Opens or closes the circuit','Provides electrical energy','Converts electricity to light','Measures electricity'], answer: 'Opens or closes the circuit' },
  { question: 'What is a conductor?', options: ['A material that allows electricity to flow','A material that stops electricity','A type of battery','A type of switch'], answer: 'A material that allows electricity to flow' },
  { question: 'What is an insulator?', options: ['A material that stops electricity','A material that allows electricity to flow','A type of battery','A type of switch'], answer: 'A material that stops electricity' },
  { question: 'Is copper a conductor or insulator?', options: ['Conductor','Insulator'], answer: 'Conductor' },
  { question: 'Is rubber a conductor or insulator?', options: ['Insulator','Conductor'], answer: 'Insulator' },
  { question: 'What happens when a switch is open?', options: ['The circuit is broken and electricity stops','The circuit is complete and electricity flows','The battery runs out','The bulb gets brighter'], answer: 'The circuit is broken and electricity stops' },
  { question: 'What happens when a switch is closed?', options: ['The circuit is complete and electricity flows','The circuit is broken and electricity stops','The battery runs out','The bulb gets dimmer'], answer: 'The circuit is complete and electricity flows' },
  { question: 'Is wood a conductor or insulator?', options: ['Insulator','Conductor'], answer: 'Insulator' },
  { question: 'Is iron a conductor or insulator?', options: ['Conductor','Insulator'], answer: 'Conductor' },
  { question: 'Is plastic a conductor or insulator?', options: ['Insulator','Conductor'], answer: 'Insulator' },
];
const L2: QuizQuestion[] = [
  { question: 'In a series circuit, what happens if one bulb breaks?', options: ['All bulbs go out','Only that bulb goes out','The other bulbs get brighter','Nothing changes'], answer: 'All bulbs go out' },
  { question: 'In a parallel circuit, what happens if one bulb breaks?', options: ['Only that bulb goes out','All bulbs go out','The other bulbs get dimmer','Nothing changes'], answer: 'Only that bulb goes out' },
  { question: 'What is voltage measured in?', options: ['Volts (V)','Amps (A)','Ohms (Ω)','Watts (W)'], answer: 'Volts (V)' },
  { question: 'What is current measured in?', options: ['Amps (A)','Volts (V)','Ohms (Ω)','Watts (W)'], answer: 'Amps (A)' },
  { question: 'What is resistance measured in?', options: ['Ohms (Ω)','Volts (V)','Amps (A)','Watts (W)'], answer: 'Ohms (Ω)' },
  { question: 'What does a voltmeter measure?', options: ['Voltage across a component','Current through a circuit','Resistance of a component','Power of a circuit'], answer: 'Voltage across a component' },
  { question: 'What does an ammeter measure?', options: ['Current through a circuit','Voltage across a component','Resistance of a component','Power of a circuit'], answer: 'Current through a circuit' },
  { question: 'How is a voltmeter connected in a circuit?', options: ['In parallel','In series','Either way','It is not connected'], answer: 'In parallel' },
  { question: 'How is an ammeter connected in a circuit?', options: ['In series','In parallel','Either way','It is not connected'], answer: 'In series' },
  { question: 'What is Ohm\'s Law?', options: ['V = IR','V = I/R','V = I+R','V = I-R'], answer: 'V = IR' },
  { question: 'If V = 12V and R = 4Ω, what is I?', options: ['3A','4A','2A','6A'], answer: '3A' },
  { question: 'If V = 6V and I = 2A, what is R?', options: ['3Ω','2Ω','4Ω','6Ω'], answer: '3Ω' },
];
const L3: QuizQuestion[] = [
  { question: 'What is power measured in?', options: ['Watts (W)','Volts (V)','Amps (A)','Ohms (Ω)'], answer: 'Watts (W)' },
  { question: 'What is the formula for electrical power?', options: ['P = IV','P = I/V','P = I+V','P = I-V'], answer: 'P = IV' },
  { question: 'If I = 3A and V = 12V, what is the power?', options: ['36 W','4 W','15 W','9 W'], answer: '36 W' },
  { question: 'What is the formula for electrical energy?', options: ['E = Pt','E = P/t','E = P+t','E = P-t'], answer: 'E = Pt' },
  { question: 'In a series circuit, how does current compare at different points?', options: ['It is the same throughout','It is different at each point','It increases towards the battery','It decreases towards the battery'], answer: 'It is the same throughout' },
  { question: 'In a parallel circuit, how does voltage compare across each branch?', options: ['It is the same across each branch','It is different in each branch','It increases in each branch','It decreases in each branch'], answer: 'It is the same across each branch' },
  { question: 'What is a diode?', options: ['A component that allows current in one direction only','A component that stores charge','A component that resists current','A component that amplifies current'], answer: 'A component that allows current in one direction only' },
  { question: 'What is a capacitor?', options: ['A component that stores electrical charge','A component that resists current','A component that allows current one way','A component that amplifies current'], answer: 'A component that stores electrical charge' },
  { question: 'What is a thermistor?', options: ['A resistor whose resistance changes with temperature','A resistor whose resistance changes with light','A fixed resistor','A variable resistor'], answer: 'A resistor whose resistance changes with temperature' },
  { question: 'What is an LDR?', options: ['A resistor whose resistance changes with light intensity','A resistor whose resistance changes with temperature','A fixed resistor','A variable resistor'], answer: 'A resistor whose resistance changes with light intensity' },
  { question: 'What is the total resistance of two 4Ω resistors in series?', options: ['8Ω','2Ω','4Ω','16Ω'], answer: '8Ω' },
  { question: 'What is the total resistance of two 4Ω resistors in parallel?', options: ['2Ω','8Ω','4Ω','1Ω'], answer: '2Ω' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the formula for charge?', options: ['Q = It','Q = I/t','Q = Vt','Q = V/t'], answer: 'Q = It' },
  { question: 'What is charge measured in?', options: ['Coulombs (C)','Amps (A)','Volts (V)','Watts (W)'], answer: 'Coulombs (C)' },
  { question: 'If I = 2A flows for 5s, what is the charge?', options: ['10 C','2.5 C','7 C','3 C'], answer: '10 C' },
  { question: 'What is the formula for energy transferred by charge?', options: ['E = QV','E = Q/V','E = Q+V','E = QI'], answer: 'E = QV' },
  { question: 'What is the internal resistance of a battery?', options: ['Resistance inside the battery that reduces terminal voltage','Resistance of the external circuit','Resistance of the wires','Resistance of the bulb'], answer: 'Resistance inside the battery that reduces terminal voltage' },
  { question: 'What is the EMF of a battery?', options: ['The energy transferred per unit charge by the battery','The voltage across the external circuit','The current through the battery','The resistance of the battery'], answer: 'The energy transferred per unit charge by the battery' },
  { question: 'What is Kirchhoff\'s first law?', options: ['The sum of currents entering a junction equals the sum leaving','The sum of voltages in a loop equals zero','Current is the same in series','Voltage is the same in parallel'], answer: 'The sum of currents entering a junction equals the sum leaving' },
  { question: 'What is Kirchhoff\'s second law?', options: ['The sum of EMFs equals the sum of voltage drops in a loop','The sum of currents at a junction is zero','Current is the same in series','Voltage is the same in parallel'], answer: 'The sum of EMFs equals the sum of voltage drops in a loop' },
  { question: 'What is a semiconductor?', options: ['A material with conductivity between a conductor and insulator','A perfect conductor','A perfect insulator','A type of metal'], answer: 'A material with conductivity between a conductor and insulator' },
  { question: 'What is a transistor used for?', options: ['Amplifying or switching electrical signals','Storing charge','Resisting current','Generating voltage'], answer: 'Amplifying or switching electrical signals' },
  { question: 'What is AC current?', options: ['Current that changes direction periodically','Current that flows in one direction only','Current that is always zero','Current that is always maximum'], answer: 'Current that changes direction periodically' },
  { question: 'What is DC current?', options: ['Current that flows in one direction only','Current that changes direction periodically','Current that is always zero','Current that is always maximum'], answer: 'Current that flows in one direction only' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the formula for the total resistance of resistors in parallel?', options: ['1/R = 1/R₁ + 1/R₂','R = R₁ + R₂','R = R₁ × R₂','R = R₁ - R₂'], answer: '1/R = 1/R₁ + 1/R₂' },
  { question: 'What is the peak voltage of a UK mains supply (230V RMS)?', options: ['325 V','230 V','163 V','460 V'], answer: '325 V' },
  { question: 'What is the relationship between RMS and peak voltage?', options: ['V_rms = V_peak / √2','V_rms = V_peak × √2','V_rms = V_peak / 2','V_rms = V_peak × 2'], answer: 'V_rms = V_peak / √2' },
  { question: 'What is a Wheatstone bridge used for?', options: ['Measuring unknown resistance precisely','Measuring voltage','Measuring current','Measuring power'], answer: 'Measuring unknown resistance precisely' },
  { question: 'What is the time constant of an RC circuit?', options: ['τ = RC','τ = R/C','τ = R+C','τ = R-C'], answer: 'τ = RC' },
  { question: 'What is impedance?', options: ['The total opposition to AC current flow (resistance + reactance)','The resistance of a DC circuit','The voltage of an AC circuit','The power of an AC circuit'], answer: 'The total opposition to AC current flow (resistance + reactance)' },
  { question: 'What is a transformer used for?', options: ['Changing the voltage of an AC supply','Changing the voltage of a DC supply','Storing electrical energy','Converting AC to DC'], answer: 'Changing the voltage of an AC supply' },
  { question: 'What is the turns ratio formula for a transformer?', options: ['Vp/Vs = Np/Ns','Vp/Vs = Ns/Np','Vp × Np = Vs × Ns','Vp + Np = Vs + Ns'], answer: 'Vp/Vs = Np/Ns' },
  { question: 'What is a step-up transformer?', options: ['A transformer that increases voltage','A transformer that decreases voltage','A transformer that stores energy','A transformer that converts AC to DC'], answer: 'A transformer that increases voltage' },
  { question: 'What is the efficiency of a transformer?', options: ['Output power / input power × 100%','Input power / output power × 100%','Output voltage / input voltage × 100%','Input voltage / output voltage × 100%'], answer: 'Output power / input power × 100%' },
  { question: 'What is the Hall effect?', options: ['A voltage produced across a conductor carrying current in a magnetic field','A current produced by a changing magnetic field','A resistance change due to temperature','A voltage change due to light'], answer: 'A voltage produced across a conductor carrying current in a magnetic field' },
  { question: 'What is superconductivity?', options: ['Zero electrical resistance below a critical temperature','Very low resistance at room temperature','Very high resistance at low temperature','Infinite resistance at high temperature'], answer: 'Zero electrical resistance below a critical temperature' },
];

export default function ElectricityCircuitGame() {
  return (
    <>
      <Helmet>
        <title>Electricity & Circuits — Sodafom</title>
        <meta name="description" content="Learn about electricity, circuits, and electrical components!" />
        <link rel="canonical" href="https://sodafom.uk/games/electricity-circuit" />
        <meta property="og:title" content="Electricity & Circuits — Sodafom" />
        <meta property="og:description" content="Learn about electricity, circuits, and electrical components!" />
        <meta property="og:url" content="https://sodafom.uk/games/electricity-circuit" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Electricity & Circuits — Science Game for Kids — Sodafom</h1>
      <GameShell title="Electricity & Circuits" emoji="⚡" subject="science" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="electricity-circuit"
            title="Electricity & Circuits"
            emoji="⚡"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
