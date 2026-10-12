import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which material is hard?', options: ['Rock','Cotton','Water','Air'], answer: 'Rock' },
  { question: 'Which material is soft?', options: ['Cotton','Rock','Metal','Glass'], answer: 'Cotton' },
  { question: 'Which material is flexible?', options: ['Rubber','Glass','Rock','Metal'], answer: 'Rubber' },
  { question: 'Which material is rigid?', options: ['Metal','Rubber','Cotton','Foam'], answer: 'Metal' },
  { question: 'Which material is transparent?', options: ['Glass','Wood','Metal','Rubber'], answer: 'Glass' },
  { question: 'Which material is waterproof?', options: ['Rubber','Cotton','Paper','Wood'], answer: 'Rubber' },
  { question: 'Which material is a good conductor of heat?', options: ['Metal','Wood','Plastic','Rubber'], answer: 'Metal' },
  { question: 'Which material is a good insulator of heat?', options: ['Wood','Metal','Copper','Iron'], answer: 'Wood' },
  { question: 'Which material is magnetic?', options: ['Iron','Copper','Aluminium','Plastic'], answer: 'Iron' },
  { question: 'Which material is a good conductor of electricity?', options: ['Copper','Rubber','Plastic','Wood'], answer: 'Copper' },
  { question: 'Which material is biodegradable?', options: ['Wood','Plastic','Metal','Glass'], answer: 'Wood' },
  { question: 'Which material is recyclable?', options: ['All of these','None of these','Only metal','Only glass'], answer: 'All of these' },
];
const L2: QuizQuestion[] = [
  { question: 'What is a natural material?', options: ['A material found in nature','A material made by humans','A material made in a factory','A material made from oil'], answer: 'A material found in nature' },
  { question: 'What is a synthetic material?', options: ['A material made by humans','A material found in nature','A material found in the ground','A material found in plants'], answer: 'A material made by humans' },
  { question: 'Is cotton natural or synthetic?', options: ['Natural','Synthetic'], answer: 'Natural' },
  { question: 'Is nylon natural or synthetic?', options: ['Synthetic','Natural'], answer: 'Synthetic' },
  { question: 'What is a composite material?', options: ['A material made from two or more different materials','A material found in nature','A material made from one element','A material made from one compound'], answer: 'A material made from two or more different materials' },
  { question: 'What is concrete made from?', options: ['Cement, sand, gravel and water','Sand and water','Cement and water','Gravel and water'], answer: 'Cement, sand, gravel and water' },
  { question: 'What is glass made from?', options: ['Sand (silicon dioxide)','Rock','Metal','Plastic'], answer: 'Sand (silicon dioxide)' },
  { question: 'What is steel?', options: ['An alloy of iron and carbon','Pure iron','Pure carbon','An alloy of copper and zinc'], answer: 'An alloy of iron and carbon' },
  { question: 'What is brass?', options: ['An alloy of copper and zinc','An alloy of iron and carbon','Pure copper','Pure zinc'], answer: 'An alloy of copper and zinc' },
  { question: 'What is a polymer?', options: ['A large molecule made of repeating units','A type of metal','A type of ceramic','A type of glass'], answer: 'A large molecule made of repeating units' },
  { question: 'What is a ceramic?', options: ['A material made by heating clay or minerals','A type of metal','A type of polymer','A type of glass'], answer: 'A material made by heating clay or minerals' },
  { question: 'What is an alloy?', options: ['A mixture of two or more metals','A pure metal','A type of polymer','A type of ceramic'], answer: 'A mixture of two or more metals' },
];
const L3: QuizQuestion[] = [
  { question: 'What is a thermosetting polymer?', options: ['A polymer that hardens permanently when heated','A polymer that softens when heated','A natural polymer','A metallic polymer'], answer: 'A polymer that hardens permanently when heated' },
  { question: 'What is a thermoplastic polymer?', options: ['A polymer that softens when heated and can be reshaped','A polymer that hardens permanently when heated','A natural polymer','A metallic polymer'], answer: 'A polymer that softens when heated and can be reshaped' },
  { question: 'What is the difference between crystalline and amorphous solids?', options: ['Crystalline have ordered atomic structure; amorphous do not','Amorphous have ordered atomic structure; crystalline do not','Both have ordered atomic structure','Neither has ordered atomic structure'], answer: 'Crystalline have ordered atomic structure; amorphous do not' },
  { question: 'What is a smart material?', options: ['A material that changes properties in response to external stimuli','A material that is very strong','A material that is very light','A material that is very flexible'], answer: 'A material that changes properties in response to external stimuli' },
  { question: 'What is a shape memory alloy?', options: ['An alloy that returns to its original shape when heated','An alloy that is very strong','An alloy that is very light','An alloy that is very flexible'], answer: 'An alloy that returns to its original shape when heated' },
  { question: 'What is a piezoelectric material?', options: ['A material that generates electricity when deformed','A material that deforms when electricity is applied only','A material that is very strong','A material that is very light'], answer: 'A material that generates electricity when deformed' },
  { question: 'What is a nanomaterial?', options: ['A material with structures at the nanometre scale (1–100 nm)','A material that is very small','A material that is very light','A material that is very strong'], answer: 'A material with structures at the nanometre scale (1–100 nm)' },
  { question: 'What is graphene?', options: ['A single layer of carbon atoms in a hexagonal lattice','A type of diamond','A type of plastic','A type of metal'], answer: 'A single layer of carbon atoms in a hexagonal lattice' },
  { question: 'What is a fibre composite?', options: ['A material with fibres embedded in a matrix (e.g. carbon fibre reinforced plastic)','A material made of natural fibres only','A material made of synthetic fibres only','A material made of metal fibres'], answer: 'A material with fibres embedded in a matrix (e.g. carbon fibre reinforced plastic)' },
  { question: 'What is corrosion?', options: ['The degradation of a material by chemical reaction with its environment','The physical breaking of a material','The melting of a material','The stretching of a material'], answer: 'The degradation of a material by chemical reaction with its environment' },
  { question: 'What is rusting?', options: ['The corrosion of iron in the presence of oxygen and water','The corrosion of copper','The corrosion of aluminium','The corrosion of gold'], answer: 'The corrosion of iron in the presence of oxygen and water' },
  { question: 'What is anodising?', options: ['An electrochemical process that thickens the oxide layer on aluminium','A process that removes the oxide layer','A process that adds a metal coating','A process that adds a plastic coating'], answer: 'An electrochemical process that thickens the oxide layer on aluminium' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the Young\'s modulus of a material?', options: ['Stress / strain (a measure of stiffness)','Force / area','Extension / original length','Force × extension'], answer: 'Stress / strain (a measure of stiffness)' },
  { question: 'What is tensile strength?', options: ['The maximum stress a material can withstand before breaking','The maximum strain before breaking','The stiffness of a material','The hardness of a material'], answer: 'The maximum stress a material can withstand before breaking' },
  { question: 'What is ductility?', options: ['The ability of a material to be drawn into a wire','The ability to be hammered into sheets','The ability to return to original shape','The ability to resist deformation'], answer: 'The ability of a material to be drawn into a wire' },
  { question: 'What is malleability?', options: ['The ability of a material to be hammered into sheets','The ability to be drawn into a wire','The ability to return to original shape','The ability to resist deformation'], answer: 'The ability of a material to be hammered into sheets' },
  { question: 'What is hardness in materials science?', options: ['Resistance to scratching or indentation','Resistance to breaking','Resistance to bending','Resistance to stretching'], answer: 'Resistance to scratching or indentation' },
  { question: 'What is toughness in materials science?', options: ['The ability to absorb energy before fracturing','The ability to resist scratching','The ability to resist bending','The ability to resist stretching'], answer: 'The ability to absorb energy before fracturing' },
  { question: 'What is fatigue in materials?', options: ['Weakening of a material due to repeated stress cycles','Weakening due to high temperature','Weakening due to corrosion','Weakening due to a single large force'], answer: 'Weakening of a material due to repeated stress cycles' },
  { question: 'What is creep in materials?', options: ['Slow deformation under constant stress at high temperature','Rapid deformation under large stress','Deformation due to corrosion','Deformation due to fatigue'], answer: 'Slow deformation under constant stress at high temperature' },
  { question: 'What is the difference between brittle and ductile fracture?', options: ['Brittle: sudden fracture with little deformation; ductile: gradual with much deformation','Brittle: gradual fracture; ductile: sudden fracture','Both are sudden','Both are gradual'], answer: 'Brittle: sudden fracture with little deformation; ductile: gradual with much deformation' },
  { question: 'What is work hardening?', options: ['Increasing hardness and strength by plastic deformation','Increasing hardness by heating','Increasing hardness by cooling','Increasing hardness by adding alloy elements'], answer: 'Increasing hardness and strength by plastic deformation' },
  { question: 'What is annealing?', options: ['Heating and slowly cooling a material to reduce hardness and increase ductility','Heating and rapidly cooling to increase hardness','Adding alloy elements to increase strength','Removing alloy elements to increase ductility'], answer: 'Heating and slowly cooling a material to reduce hardness and increase ductility' },
  { question: 'What is quenching?', options: ['Rapidly cooling a heated material to increase hardness','Slowly cooling a heated material','Heating a material to increase ductility','Adding alloy elements'], answer: 'Rapidly cooling a heated material to increase hardness' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of dislocations in crystalline materials?', options: ['Line defects in the crystal lattice that allow plastic deformation','Point defects in the crystal lattice','Surface defects','Volume defects'], answer: 'Line defects in the crystal lattice that allow plastic deformation' },
  { question: 'What is precipitation hardening?', options: ['Strengthening by forming fine precipitate particles that block dislocation movement','Strengthening by adding large alloy particles','Strengthening by heating','Strengthening by cooling'], answer: 'Strengthening by forming fine precipitate particles that block dislocation movement' },
  { question: 'What is grain boundary strengthening?', options: ['Smaller grains increase strength by blocking dislocation movement','Larger grains increase strength','Grain boundaries weaken materials','Grain size has no effect on strength'], answer: 'Smaller grains increase strength by blocking dislocation movement' },
  { question: 'What is the Hall-Petch relationship?', options: ['Yield strength increases with decreasing grain size (σ = σ₀ + kd^(-½))','Yield strength increases with increasing grain size','Yield strength is independent of grain size','Yield strength decreases with decreasing grain size'], answer: 'Yield strength increases with decreasing grain size (σ = σ₀ + kd^(-½))' },
  { question: 'What is a metallic glass?', options: ['An amorphous metal with no crystalline structure','A transparent metal','A metal with glass coating','A glass with metal coating'], answer: 'An amorphous metal with no crystalline structure' },
  { question: 'What is a metamaterial?', options: ['An engineered material with properties not found in nature (e.g. negative refractive index)','A natural material with unusual properties','A composite material','A nanomaterial'], answer: 'An engineered material with properties not found in nature (e.g. negative refractive index)' },
  { question: 'What is the concept of band gap in semiconductors?', options: ['The energy gap between valence and conduction bands','The energy gap between atoms','The energy gap between molecules','The energy gap between electrons and protons'], answer: 'The energy gap between valence and conduction bands' },
  { question: 'What is doping in semiconductors?', options: ['Adding impurities to change electrical conductivity','Removing impurities to increase purity','Heating to change conductivity','Cooling to change conductivity'], answer: 'Adding impurities to change electrical conductivity' },
  { question: 'What is a p-n junction?', options: ['The interface between p-type and n-type semiconductor forming a diode','A type of transistor','A type of capacitor','A type of resistor'], answer: 'The interface between p-type and n-type semiconductor forming a diode' },
  { question: 'What is the concept of phonons?', options: ['Quantised vibrations of atoms in a crystal lattice','Quantised light particles','Quantised magnetic fields','Quantised electric fields'], answer: 'Quantised vibrations of atoms in a crystal lattice' },
  { question: 'What is the concept of entropy in materials?', options: ['A measure of disorder that drives mixing and phase transitions','A measure of energy','A measure of temperature','A measure of pressure'], answer: 'A measure of disorder that drives mixing and phase transitions' },
  { question: 'What is a high-entropy alloy?', options: ['An alloy with five or more principal elements in near-equal proportions','An alloy with high energy content','An alloy with high temperature resistance only','An alloy with high electrical conductivity'], answer: 'An alloy with five or more principal elements in near-equal proportions' },
];

export default function MaterialsSortGame() {
  return (
    <>
      <Helmet>
        <title>Materials Sort — Sodafom</title>
        <meta name="description" content="Sort and classify materials by their properties!" />
        <link rel="canonical" href="https://sodafom.uk/games/materials-sort" />
        <meta property="og:title" content="Materials Sort — Sodafom" />
        <meta property="og:description" content="Sort and classify materials by their properties!" />
        <meta property="og:url" content="https://sodafom.uk/games/materials-sort" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Materials Sort — Science Game for Kids — Sodafom</h1>
      <GameShell title="Materials Sort" emoji="🪨" subject="science" ageGroups={['5–7', '7–9']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="materials-sort"
            title="Materials Sort"
            emoji="🪨"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
