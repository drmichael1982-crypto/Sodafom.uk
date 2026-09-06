import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What are the three types of rock?', options: ['Igneous, sedimentary, metamorphic','Hard, soft, medium','Old, new, ancient','Natural, artificial, synthetic'], answer: 'Igneous, sedimentary, metamorphic' },
  { question: 'How is igneous rock formed?', options: ['From cooled magma or lava','From layers of sediment','From existing rocks changed by heat and pressure','From fossils'], answer: 'From cooled magma or lava' },
  { question: 'How is sedimentary rock formed?', options: ['From layers of sediment compressed over time','From cooled magma','From existing rocks changed by heat and pressure','From fossils'], answer: 'From layers of sediment compressed over time' },
  { question: 'How is metamorphic rock formed?', options: ['From existing rocks changed by heat and pressure','From cooled magma','From layers of sediment','From fossils'], answer: 'From existing rocks changed by heat and pressure' },
  { question: 'Which type of rock can contain fossils?', options: ['Sedimentary','Igneous','Metamorphic','All types'], answer: 'Sedimentary' },
  { question: 'What is granite?', options: ['An igneous rock','A sedimentary rock','A metamorphic rock','A fossil'], answer: 'An igneous rock' },
  { question: 'What is limestone?', options: ['A sedimentary rock','An igneous rock','A metamorphic rock','A fossil'], answer: 'A sedimentary rock' },
  { question: 'What is marble?', options: ['A metamorphic rock','An igneous rock','A sedimentary rock','A fossil'], answer: 'A metamorphic rock' },
  { question: 'What is sandstone?', options: ['A sedimentary rock','An igneous rock','A metamorphic rock','A fossil'], answer: 'A sedimentary rock' },
  { question: 'What is basalt?', options: ['An igneous rock','A sedimentary rock','A metamorphic rock','A fossil'], answer: 'An igneous rock' },
  { question: 'What is slate?', options: ['A metamorphic rock','An igneous rock','A sedimentary rock','A fossil'], answer: 'A metamorphic rock' },
  { question: 'What is chalk?', options: ['A sedimentary rock','An igneous rock','A metamorphic rock','A fossil'], answer: 'A sedimentary rock' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the rock cycle?', options: ['The continuous process by which rocks are formed, changed and recycled','The age of rocks','The classification of rocks','The hardness of rocks'], answer: 'The continuous process by which rocks are formed, changed and recycled' },
  { question: 'What is weathering?', options: ['The breaking down of rocks by weather, plants and animals','The formation of rocks','The movement of rocks','The classification of rocks'], answer: 'The breaking down of rocks by weather, plants and animals' },
  { question: 'What is erosion?', options: ['The movement of weathered material by water, wind or ice','The breaking down of rocks','The formation of rocks','The classification of rocks'], answer: 'The movement of weathered material by water, wind or ice' },
  { question: 'What is deposition?', options: ['The laying down of sediment','The breaking down of rocks','The movement of rocks','The classification of rocks'], answer: 'The laying down of sediment' },
  { question: 'What is the Mohs scale?', options: ['A scale of mineral hardness','A scale of rock age','A scale of rock size','A scale of rock colour'], answer: 'A scale of mineral hardness' },
  { question: 'What is the hardest mineral on the Mohs scale?', options: ['Diamond','Quartz','Feldspar','Talc'], answer: 'Diamond' },
  { question: 'What is the softest mineral on the Mohs scale?', options: ['Talc','Diamond','Quartz','Feldspar'], answer: 'Talc' },
  { question: 'What is a mineral?', options: ['A naturally occurring inorganic solid with a definite chemical composition','A type of rock','A type of fossil','A type of soil'], answer: 'A naturally occurring inorganic solid with a definite chemical composition' },
  { question: 'What is a fossil?', options: ['Preserved remains or traces of ancient organisms','A type of rock','A type of mineral','A type of soil'], answer: 'Preserved remains or traces of ancient organisms' },
  { question: 'What is magma?', options: ['Molten rock beneath the Earth\'s surface','Molten rock above the Earth\'s surface','A type of sedimentary rock','A type of metamorphic rock'], answer: 'Molten rock beneath the Earth\'s surface' },
  { question: 'What is lava?', options: ['Molten rock above the Earth\'s surface','Molten rock beneath the Earth\'s surface','A type of sedimentary rock','A type of metamorphic rock'], answer: 'Molten rock above the Earth\'s surface' },
  { question: 'What is the Earth\'s crust?', options: ['The outermost layer of the Earth','The innermost layer of the Earth','The middle layer of the Earth','The layer between the mantle and core'], answer: 'The outermost layer of the Earth' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the Earth\'s mantle?', options: ['The layer of rock between the crust and core','The outermost layer','The innermost layer','The layer between the outer and inner core'], answer: 'The layer of rock between the crust and core' },
  { question: 'What is the Earth\'s core made of?', options: ['Mainly iron and nickel','Mainly silicon and oxygen','Mainly aluminium and calcium','Mainly carbon and hydrogen'], answer: 'Mainly iron and nickel' },
  { question: 'What is plate tectonics?', options: ['The theory that Earth\'s crust is divided into moving plates','The theory of rock formation','The theory of volcanic eruptions','The theory of earthquake formation'], answer: 'The theory that Earth\'s crust is divided into moving plates' },
  { question: 'What happens at a constructive plate boundary?', options: ['Plates move apart and new crust is formed','Plates collide and one subducts','Plates slide past each other','Plates collide and mountains form'], answer: 'Plates move apart and new crust is formed' },
  { question: 'What happens at a destructive plate boundary?', options: ['One plate subducts beneath another','Plates move apart','Plates slide past each other','New crust is formed'], answer: 'One plate subducts beneath another' },
  { question: 'What happens at a conservative plate boundary?', options: ['Plates slide past each other causing earthquakes','Plates move apart','One plate subducts','New crust is formed'], answer: 'Plates slide past each other causing earthquakes' },
  { question: 'What is a fault?', options: ['A fracture in rock along which movement has occurred','A type of fold','A type of rock','A type of mineral'], answer: 'A fracture in rock along which movement has occurred' },
  { question: 'What is a fold mountain?', options: ['A mountain formed by the folding of rock layers at a collision boundary','A mountain formed by volcanic activity','A mountain formed by erosion','A mountain formed by deposition'], answer: 'A mountain formed by the folding of rock layers at a collision boundary' },
  { question: 'What is the Richter scale?', options: ['A scale measuring earthquake magnitude','A scale measuring volcanic eruption size','A scale measuring rock hardness','A scale measuring rock age'], answer: 'A scale measuring earthquake magnitude' },
  { question: 'What is the epicentre of an earthquake?', options: ['The point on the surface directly above the focus','The point underground where the earthquake starts','The point where seismic waves are strongest','The point where damage is greatest'], answer: 'The point on the surface directly above the focus' },
  { question: 'What is the focus of an earthquake?', options: ['The point underground where the earthquake starts','The point on the surface directly above','The point where seismic waves are strongest','The point where damage is greatest'], answer: 'The point underground where the earthquake starts' },
  { question: 'What is a seismometer?', options: ['An instrument that measures seismic waves','An instrument that measures volcanic activity','An instrument that measures rock hardness','An instrument that measures rock age'], answer: 'An instrument that measures seismic waves' },
];
const L4: QuizQuestion[] = [
  { question: 'What is radiometric dating?', options: ['Using radioactive decay to determine the age of rocks','Using fossils to determine rock age','Using rock colour to determine age','Using rock hardness to determine age'], answer: 'Using radioactive decay to determine the age of rocks' },
  { question: 'What is half-life?', options: ['The time for half of a radioactive isotope to decay','The time for all of a radioactive isotope to decay','The age of a rock','The rate of rock formation'], answer: 'The time for half of a radioactive isotope to decay' },
  { question: 'What is carbon-14 dating used for?', options: ['Dating organic material up to ~50,000 years old','Dating rocks billions of years old','Dating minerals','Dating fossils only'], answer: 'Dating organic material up to ~50,000 years old' },
  { question: 'What is uranium-lead dating used for?', options: ['Dating very old rocks (billions of years)','Dating organic material','Dating recent sediments','Dating fossils only'], answer: 'Dating very old rocks (billions of years)' },
  { question: 'What is the principle of superposition?', options: ['In undisturbed rock layers, older rocks are at the bottom','In undisturbed rock layers, newer rocks are at the bottom','Rock layers are always horizontal','Rock layers are always vertical'], answer: 'In undisturbed rock layers, older rocks are at the bottom' },
  { question: 'What is the principle of cross-cutting relationships?', options: ['A feature that cuts across rock layers is younger than the layers it cuts','A feature that cuts across rock layers is older','Rock layers are always horizontal','Rock layers are always vertical'], answer: 'A feature that cuts across rock layers is younger than the layers it cuts' },
  { question: 'What is a geologic time scale?', options: ['A timeline of Earth\'s history divided into eons, eras, periods and epochs','A scale of rock hardness','A scale of rock age','A scale of rock colour'], answer: 'A timeline of Earth\'s history divided into eons, eras, periods and epochs' },
  { question: 'What is the Precambrian?', options: ['The eon covering ~88% of Earth\'s history before complex animal life','The era of the dinosaurs','The era of the first humans','The era of the first plants'], answer: 'The eon covering ~88% of Earth\'s history before complex animal life' },
  { question: 'What is the Mesozoic era?', options: ['The era of dinosaurs (~252–66 million years ago)','The era of the first humans','The era of the first plants','The era of the first fish'], answer: 'The era of dinosaurs (~252–66 million years ago)' },
  { question: 'What is the Cenozoic era?', options: ['The era of mammals (~66 million years ago to present)','The era of dinosaurs','The era of the first plants','The era of the first fish'], answer: 'The era of mammals (~66 million years ago to present)' },
  { question: 'What is a mass extinction?', options: ['A rapid loss of a large proportion of species','The extinction of a single species','The extinction of all life','A slow loss of species over millions of years'], answer: 'A rapid loss of a large proportion of species' },
  { question: 'What caused the end-Cretaceous mass extinction (~66 Ma)?', options: ['Asteroid impact and volcanic activity','Ice age only','Sea level rise only','Disease only'], answer: 'Asteroid impact and volcanic activity' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of isostasy?', options: ['The gravitational equilibrium between Earth\'s crust and mantle','The movement of tectonic plates','The formation of mountains','The formation of ocean trenches'], answer: 'The gravitational equilibrium between Earth\'s crust and mantle' },
  { question: 'What is the Wilson cycle?', options: ['The cycle of ocean basin opening and closing over hundreds of millions of years','The rock cycle','The water cycle','The carbon cycle'], answer: 'The cycle of ocean basin opening and closing over hundreds of millions of years' },
  { question: 'What is a subduction zone?', options: ['Where one tectonic plate descends beneath another into the mantle','Where plates move apart','Where plates slide past each other','Where new crust is formed'], answer: 'Where one tectonic plate descends beneath another into the mantle' },
  { question: 'What is an ophiolite?', options: ['A section of oceanic crust and upper mantle exposed on land','A type of igneous rock','A type of metamorphic rock','A type of sedimentary rock'], answer: 'A section of oceanic crust and upper mantle exposed on land' },
  { question: 'What is the concept of terrane accretion?', options: ['The addition of exotic crustal blocks to a continent','The erosion of a continent','The formation of ocean basins','The formation of mountain ranges by folding only'], answer: 'The addition of exotic crustal blocks to a continent' },
  { question: 'What is the concept of mantle convection?', options: ['Heat-driven circulation in the mantle that drives plate tectonics','The movement of magma in volcanoes','The movement of water in the ocean','The movement of air in the atmosphere'], answer: 'Heat-driven circulation in the mantle that drives plate tectonics' },
  { question: 'What is a P-wave (primary wave)?', options: ['A compressional seismic wave that travels through solids and liquids','A shear seismic wave that travels only through solids','A surface seismic wave','A seismic wave that travels only through liquids'], answer: 'A compressional seismic wave that travels through solids and liquids' },
  { question: 'What is an S-wave (secondary wave)?', options: ['A shear seismic wave that travels only through solids','A compressional seismic wave','A surface seismic wave','A seismic wave that travels through liquids'], answer: 'A shear seismic wave that travels only through solids' },
  { question: 'What does the behaviour of S-waves tell us about Earth\'s outer core?', options: ['The outer core is liquid (S-waves cannot pass through it)','The outer core is solid','The outer core is gaseous','The outer core is plasma'], answer: 'The outer core is liquid (S-waves cannot pass through it)' },
  { question: 'What is the concept of geochemical cycling?', options: ['The movement of elements between rocks, oceans, atmosphere and living things','The movement of rocks in the rock cycle','The movement of water in the water cycle','The movement of carbon in the carbon cycle'], answer: 'The movement of elements between rocks, oceans, atmosphere and living things' },
  { question: 'What is the concept of deep time?', options: ['The vast timescales of geological and evolutionary history','The time since humans evolved','The time since the dinosaurs','The time since the first life on Earth'], answer: 'The vast timescales of geological and evolutionary history' },
  { question: 'What is the concept of uniformitarianism?', options: ['The present is the key to the past — geological processes have always operated as today','The past was very different from the present','Geological processes are random','Geological processes are getting faster'], answer: 'The present is the key to the past — geological processes have always operated as today' },
];

export default function RockDetectiveGame() {
  return (
    <>
      <Helmet>
        <title>Rock Detective — Sodafom</title>
        <meta name="description" content="Investigate rocks, minerals, and the rock cycle!" />
        <link rel="canonical" href="https://sodafom.uk/games/rock-detective" />
        <meta property="og:title" content="Rock Detective — Sodafom" />
        <meta property="og:description" content="Investigate rocks, minerals, and the rock cycle!" />
        <meta property="og:url" content="https://sodafom.uk/games/rock-detective" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Rock Detective — Science Game for Kids — Sodafom</h1>
      <GameShell title="Rock Detective" emoji="🪨" subject="science" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="rock-detective"
            title="Rock Detective"
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
