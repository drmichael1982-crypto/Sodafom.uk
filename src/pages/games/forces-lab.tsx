import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is a force?', options: ['A push or pull','A type of energy','A type of motion','A type of material'], answer: 'A push or pull' },
  { question: 'What is gravity?', options: ['A force that pulls objects towards each other','A force that pushes objects apart','A type of energy','A type of motion'], answer: 'A force that pulls objects towards each other' },
  { question: 'What is friction?', options: ['A force that opposes motion','A force that causes motion','A type of energy','A type of material'], answer: 'A force that opposes motion' },
  { question: 'What is the unit of force?', options: ['Newton (N)','Kilogram (kg)','Metre (m)','Joule (J)'], answer: 'Newton (N)' },
  { question: 'What is weight?', options: ['The force of gravity on an object','The amount of matter in an object','The size of an object','The speed of an object'], answer: 'The force of gravity on an object' },
  { question: 'What is mass?', options: ['The amount of matter in an object','The force of gravity on an object','The size of an object','The speed of an object'], answer: 'The amount of matter in an object' },
  { question: 'What is air resistance?', options: ['A force that opposes motion through air','A force that causes motion','A type of energy','A type of material'], answer: 'A force that opposes motion through air' },
  { question: 'What is upthrust?', options: ['An upward force on an object in a fluid','A downward force on an object','A sideways force on an object','A force that causes rotation'], answer: 'An upward force on an object in a fluid' },
  { question: 'What is a balanced force?', options: ['Forces that cancel each other out','Forces that cause motion','Forces that cause rotation','Forces that cause deformation'], answer: 'Forces that cancel each other out' },
  { question: 'What is an unbalanced force?', options: ['Forces that cause a change in motion','Forces that cancel each other out','Forces that cause rotation','Forces that cause deformation'], answer: 'Forces that cause a change in motion' },
  { question: 'What is tension?', options: ['A pulling force in a rope or string','A pushing force','A rotational force','A gravitational force'], answer: 'A pulling force in a rope or string' },
  { question: 'What is compression?', options: ['A squeezing force','A pulling force','A rotational force','A gravitational force'], answer: 'A squeezing force' },
];
const L2: QuizQuestion[] = [
  { question: "What is Newton's First Law?", options: ['An object stays at rest or in motion unless acted on by a force','Force = mass × acceleration','Every action has an equal and opposite reaction','Objects fall at the same rate regardless of mass'], answer: 'An object stays at rest or in motion unless acted on by a force' },
  { question: "What is Newton's Second Law?", options: ['F = ma','An object stays at rest or in motion unless acted on by a force','Every action has an equal and opposite reaction','Objects fall at the same rate regardless of mass'], answer: 'F = ma' },
  { question: "What is Newton's Third Law?", options: ['Every action has an equal and opposite reaction','F = ma','An object stays at rest or in motion unless acted on by a force','Objects fall at the same rate regardless of mass'], answer: 'Every action has an equal and opposite reaction' },
  { question: 'If F = 20N and m = 4kg, what is the acceleration?', options: ['5 m/s²','4 m/s²','6 m/s²','8 m/s²'], answer: '5 m/s²' },
  { question: 'If F = 30N and a = 6 m/s², what is the mass?', options: ['5 kg','4 kg','6 kg','8 kg'], answer: '5 kg' },
  { question: 'What is the weight of a 10 kg object on Earth? (g = 10 N/kg)', options: ['100 N','10 N','1000 N','1 N'], answer: '100 N' },
  { question: 'What is the mass of an object with weight 50 N? (g = 10 N/kg)', options: ['5 kg','50 kg','0.5 kg','500 kg'], answer: '5 kg' },
  { question: 'What is pressure?', options: ['Force per unit area','Force × area','Force + area','Force - area'], answer: 'Force per unit area' },
  { question: 'What is the unit of pressure?', options: ['Pascal (Pa)','Newton (N)','Kilogram (kg)','Joule (J)'], answer: 'Pascal (Pa)' },
  { question: 'If F = 100 N and A = 5 m², what is the pressure?', options: ['20 Pa','500 Pa','0.05 Pa','95 Pa'], answer: '20 Pa' },
  { question: 'What is a moment (torque)?', options: ['A turning force','A pushing force','A pulling force','A gravitational force'], answer: 'A turning force' },
  { question: 'What is the formula for a moment?', options: ['Moment = Force × distance','Moment = Force + distance','Moment = Force / distance','Moment = Force - distance'], answer: 'Moment = Force × distance' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the formula for work done?', options: ['W = Fd','W = F/d','W = F+d','W = F-d'], answer: 'W = Fd' },
  { question: 'What is the unit of work?', options: ['Joule (J)','Newton (N)','Watt (W)','Pascal (Pa)'], answer: 'Joule (J)' },
  { question: 'If F = 50N and d = 4m, what is the work done?', options: ['200 J','12.5 J','54 J','46 J'], answer: '200 J' },
  { question: 'What is the formula for kinetic energy?', options: ['KE = ½mv²','KE = mv','KE = mv²','KE = ½mv'], answer: 'KE = ½mv²' },
  { question: 'What is the formula for gravitational potential energy?', options: ['GPE = mgh','GPE = mg/h','GPE = m+g+h','GPE = mgh²'], answer: 'GPE = mgh' },
  { question: 'What is the principle of conservation of energy?', options: ['Energy cannot be created or destroyed, only transferred','Energy can be created from nothing','Energy can be destroyed','Energy always increases'], answer: 'Energy cannot be created or destroyed, only transferred' },
  { question: 'What is the formula for power?', options: ['P = W/t','P = Wt','P = W+t','P = W-t'], answer: 'P = W/t' },
  { question: 'What is the unit of power?', options: ['Watt (W)','Joule (J)','Newton (N)','Pascal (Pa)'], answer: 'Watt (W)' },
  { question: 'What is the formula for speed?', options: ['v = d/t','v = dt','v = d+t','v = d-t'], answer: 'v = d/t' },
  { question: 'What is the formula for acceleration?', options: ['a = (v-u)/t','a = (v+u)/t','a = vt','a = v/t'], answer: 'a = (v-u)/t' },
  { question: 'What is the formula for momentum?', options: ['p = mv','p = m/v','p = m+v','p = m-v'], answer: 'p = mv' },
  { question: 'What is the unit of momentum?', options: ['kg m/s','kg m/s²','N m','J/s'], answer: 'kg m/s' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the principle of conservation of momentum?', options: ['Total momentum before a collision equals total momentum after','Momentum is always lost in a collision','Momentum always increases','Momentum is always zero'], answer: 'Total momentum before a collision equals total momentum after' },
  { question: 'What is an elastic collision?', options: ['Kinetic energy is conserved','Kinetic energy is lost','Objects stick together','Momentum is not conserved'], answer: 'Kinetic energy is conserved' },
  { question: 'What is an inelastic collision?', options: ['Kinetic energy is not conserved','Kinetic energy is conserved','Objects bounce apart','Momentum is not conserved'], answer: 'Kinetic energy is not conserved' },
  { question: 'What is impulse?', options: ['Force × time = change in momentum','Force × distance','Force / time','Force + time'], answer: 'Force × time = change in momentum' },
  { question: 'What is the formula for gravitational force between two masses?', options: ['F = Gm₁m₂/r²','F = Gm₁m₂r²','F = G(m₁+m₂)/r','F = Gm₁/m₂r²'], answer: 'F = Gm₁m₂/r²' },
  { question: 'What is centripetal force?', options: ['The force directed towards the centre of a circular path','The force directed away from the centre','The force tangent to a circular path','The force opposing circular motion'], answer: 'The force directed towards the centre of a circular path' },
  { question: 'What is the formula for centripetal force?', options: ['F = mv²/r','F = mvr','F = mv/r²','F = m/v²r'], answer: 'F = mv²/r' },
  { question: 'What is Hooke\'s Law?', options: ['F = kx (force is proportional to extension)','F = k/x','F = kx²','F = k+x'], answer: 'F = kx (force is proportional to extension)' },
  { question: 'What is the elastic limit?', options: ['The point beyond which a material does not return to its original shape','The point at which a material breaks','The maximum extension of a spring','The minimum force needed to stretch a spring'], answer: 'The point beyond which a material does not return to its original shape' },
  { question: 'What is Young\'s modulus?', options: ['Stress / strain (a measure of material stiffness)','Force / area','Extension / original length','Force × extension'], answer: 'Stress / strain (a measure of material stiffness)' },
  { question: 'What is terminal velocity?', options: ['The constant velocity when driving force equals resistive force','The maximum possible speed','The speed at which an object starts moving','The speed at which an object stops'], answer: 'The constant velocity when driving force equals resistive force' },
  { question: 'What is the formula for density?', options: ['ρ = m/V','ρ = mV','ρ = m+V','ρ = m/V²'], answer: 'ρ = m/V' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the work-energy theorem?', options: ['Net work done on an object equals its change in kinetic energy','Work done equals potential energy','Work done equals total energy','Net work equals momentum change'], answer: 'Net work done on an object equals its change in kinetic energy' },
  { question: 'What is the formula for angular momentum?', options: ['L = Iω','L = mv','L = Iα','L = Fr'], answer: 'L = Iω' },
  { question: 'What is torque?', options: ['A rotational force (τ = Fr sinθ)','A linear force','A centripetal force','A gravitational force'], answer: 'A rotational force (τ = Fr sinθ)' },
  { question: 'What is the moment of inertia?', options: ['A measure of resistance to rotational acceleration','A measure of resistance to linear acceleration','A measure of gravitational force','A measure of centripetal force'], answer: 'A measure of resistance to rotational acceleration' },
  { question: 'What is the equation of motion v² = u² + 2as used for?', options: ['Finding velocity when time is unknown','Finding time when velocity is unknown','Finding distance when acceleration is unknown','Finding acceleration when distance is unknown'], answer: 'Finding velocity when time is unknown' },
  { question: 'What is the Coriolis effect?', options: ['The deflection of moving objects due to Earth\'s rotation','The effect of gravity on moving objects','The effect of air resistance on moving objects','The effect of friction on moving objects'], answer: 'The deflection of moving objects due to Earth\'s rotation' },
  { question: 'What is Bernoulli\'s principle?', options: ['Faster-moving fluid has lower pressure','Faster-moving fluid has higher pressure','Pressure is constant in a fluid','Fluid speed is constant'], answer: 'Faster-moving fluid has lower pressure' },
  { question: 'What is the formula for pressure in a fluid?', options: ['P = ρgh','P = ρg/h','P = ρ+g+h','P = ρgh²'], answer: 'P = ρgh' },
  { question: 'What is Archimedes\' principle?', options: ['Upthrust equals the weight of fluid displaced','Upthrust equals the weight of the object','Upthrust equals the density of the fluid','Upthrust equals the volume of the object'], answer: 'Upthrust equals the weight of fluid displaced' },
  { question: 'What is simple harmonic motion?', options: ['Oscillation where acceleration is proportional to and opposite to displacement','Oscillation at constant speed','Oscillation with increasing amplitude','Oscillation with decreasing frequency'], answer: 'Oscillation where acceleration is proportional to and opposite to displacement' },
  { question: 'What is the formula for the period of a simple pendulum?', options: ['T = 2π√(l/g)','T = 2π√(g/l)','T = 2πl/g','T = 2πg/l'], answer: 'T = 2π√(l/g)' },
  { question: 'What is resonance?', options: ['When a system is driven at its natural frequency and amplitude increases greatly','When a system oscillates at any frequency','When a system stops oscillating','When a system oscillates at half its natural frequency'], answer: 'When a system is driven at its natural frequency and amplitude increases greatly' },
];

export default function ForcesLabGame() {
  return (
    <>
      <Helmet>
        <title>Forces Lab — Sodafom</title>
        <meta name="description" content="Investigate forces, gravity, friction, and motion!" />
        <link rel="canonical" href="https://sodafom.uk/games/forces-lab" />
        <meta property="og:title" content="Forces Lab — Sodafom" />
        <meta property="og:description" content="Investigate forces, gravity, friction, and motion!" />
        <meta property="og:url" content="https://sodafom.uk/games/forces-lab" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Forces Lab — Science Game for Kids — Sodafom</h1>
      <GameShell title="Forces Lab" emoji="🔬" subject="science" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="forces-lab"
            title="Forces Lab"
            emoji="🔬"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
