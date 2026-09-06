import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is evaporation?', options: ['Water falling from clouds','Water turning from liquid to gas','Water turning from gas to liquid','Water freezing'], answer: 'Water turning from liquid to gas' },
  { question: 'What is condensation?', options: ['Water falling from clouds','Water turning from liquid to gas','Water vapour turning back into liquid water','Water freezing'], answer: 'Water vapour turning back into liquid water' },
  { question: 'What is precipitation?', options: ['Water evaporating','Water condensing','Water falling from clouds as rain, snow, sleet or hail','Water flowing in rivers'], answer: 'Water falling from clouds as rain, snow, sleet or hail' },
  { question: 'What causes evaporation?', options: ['Cold temperatures','Heat from the Sun','Wind','Rain'], answer: 'Heat from the Sun' },
  { question: 'What is rain?', options: ['Water vapour','Water falling from clouds','Water in rivers','Water in the sea'], answer: 'Water falling from clouds' },
  { question: 'What is snow?', options: ['Frozen rain','Water vapour','Water in rivers','Hail'], answer: 'Frozen rain' },
  { question: 'Where does most water evaporate from?', options: ['Rivers','Lakes','The sea','Puddles'], answer: 'The sea' },
  { question: 'What forms when water vapour cools in the sky?', options: ['Rain','Snow','Clouds','Hail'], answer: 'Clouds' },
  { question: 'What is the water cycle?', options: ['Water flowing in rivers','The continuous movement of water through evaporation, condensation and precipitation','Water being filtered','Water being stored in lakes'], answer: 'The continuous movement of water through evaporation, condensation and precipitation' },
  { question: 'What is runoff?', options: ['Water evaporating','Water condensing','Water flowing over land into rivers and streams','Water falling as rain'], answer: 'Water flowing over land into rivers and streams' },
  { question: 'What is transpiration?', options: ['Water evaporating from the sea','Water released by plants through their leaves','Water falling as rain','Water flowing in rivers'], answer: 'Water released by plants through their leaves' },
  { question: 'What is the collection stage of the water cycle?', options: ['Water evaporating','Water condensing','Water falling as rain','Water collecting in oceans, lakes and rivers'], answer: 'Water collecting in oceans, lakes and rivers' },
];
const L2: QuizQuestion[] = [
  { question: 'What is groundwater?', options: ['Water in clouds','Water that soaks into the ground and is stored in rock','Water in rivers','Water in the sea'], answer: 'Water that soaks into the ground and is stored in rock' },
  { question: 'What is the water table?', options: ['A type of cloud','The level below which the ground is saturated with water','A type of river','A type of precipitation'], answer: 'The level below which the ground is saturated with water' },
  { question: 'What percentage of Earth\'s water is fresh water?', options: ['About 3%','About 30%','About 50%','About 70%'], answer: 'About 3%' },
  { question: 'What is a watershed?', options: ['A type of cloud','An area of land that drains into a river or lake','A type of precipitation','A type of groundwater'], answer: 'An area of land that drains into a river or lake' },
  { question: 'What is infiltration?', options: ['Water evaporating','Water soaking into the ground','Water falling as rain','Water flowing in rivers'], answer: 'Water soaking into the ground' },
  { question: 'What is sublimation in the water cycle?', options: ['Water evaporating','Ice turning directly into water vapour','Water condensing','Water freezing'], answer: 'Ice turning directly into water vapour' },
  { question: 'What is the hydrosphere?', options: ['All the water on Earth','All the air on Earth','All the land on Earth','All the living things on Earth'], answer: 'All the water on Earth' },
  { question: 'What is an aquifer?', options: ['A type of cloud','A type of river','An underground layer of rock that holds water','A type of precipitation'], answer: 'An underground layer of rock that holds water' },
  { question: 'What is the main driver of the water cycle?', options: ['Wind','Gravity','Solar energy','The Moon'], answer: 'Solar energy' },
  { question: 'What is deposition in the water cycle?', options: ['Water evaporating','Water vapour turning directly into ice','Water condensing','Water falling as rain'], answer: 'Water vapour turning directly into ice' },
  { question: 'What is surface runoff?', options: ['Water evaporating','Water soaking into the ground','Water flowing over the surface of the land','Water falling as rain'], answer: 'Water flowing over the surface of the land' },
  { question: 'What is a river basin?', options: ['A type of cloud','The area of land drained by a river and its tributaries','A type of precipitation','A type of groundwater'], answer: 'The area of land drained by a river and its tributaries' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the residence time of water in the atmosphere?', options: ['About 9 days','About 9 months','About 9 years','About 9 hours'], answer: 'About 9 days' },
  { question: 'What is the residence time of water in the ocean?', options: ['About 3,200 years','About 32 years','About 320 years','About 32,000 years'], answer: 'About 3,200 years' },
  { question: 'What is the residence time of water in glaciers?', options: ['Up to 100,000 years','About 100 years','About 1,000 years','About 10,000 years'], answer: 'Up to 100,000 years' },
  { question: 'What is evapotranspiration?', options: ['The combined evaporation from land and transpiration from plants','Evaporation from the sea only','Transpiration from plants only','Evaporation from lakes only'], answer: 'The combined evaporation from land and transpiration from plants' },
  { question: 'What is the hydrological cycle?', options: ['Another name for the water cycle','The cycle of water in the ocean only','The cycle of water in the atmosphere only','The cycle of water in rivers only'], answer: 'Another name for the water cycle' },
  { question: 'What is a drainage basin?', options: ['The area of land drained by a river and its tributaries','A type of reservoir','A type of aquifer','A type of wetland'], answer: 'The area of land drained by a river and its tributaries' },
  { question: 'What is interception in hydrology?', options: ['Precipitation caught by vegetation before reaching the ground','Water soaking into the ground','Water flowing over the surface','Water evaporating from the soil'], answer: 'Precipitation caught by vegetation before reaching the ground' },
  { question: 'What is throughflow?', options: ['Water moving through soil downslope','Water flowing over the surface','Water soaking into rock','Water evaporating from soil'], answer: 'Water moving through soil downslope' },
  { question: 'What is baseflow?', options: ['The steady flow of groundwater into a river','The peak flow after heavy rain','The flow of water over the surface','The flow of water through soil'], answer: 'The steady flow of groundwater into a river' },
  { question: 'What is a storm hydrograph?', options: ['A graph showing river discharge over time after a storm','A graph showing rainfall over time','A graph showing evaporation over time','A graph showing groundwater level over time'], answer: 'A graph showing river discharge over time after a storm' },
  { question: 'What is the lag time on a storm hydrograph?', options: ['The time between peak rainfall and peak discharge','The time between the start of rain and peak discharge','The time between peak discharge and return to baseflow','The time between the start of rain and the end of rain'], answer: 'The time between peak rainfall and peak discharge' },
  { question: 'What is urbanisation\'s effect on the water cycle?', options: ['Increases surface runoff and reduces infiltration','Increases infiltration and reduces runoff','Has no effect on the water cycle','Increases evapotranspiration'], answer: 'Increases surface runoff and reduces infiltration' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the global water budget?', options: ['The balance between precipitation, evapotranspiration and runoff globally','The amount of water in the oceans','The amount of water in the atmosphere','The amount of water in glaciers'], answer: 'The balance between precipitation, evapotranspiration and runoff globally' },
  { question: 'What is the concept of virtual water?', options: ['The water used to produce a product, embedded in it','Water that cannot be seen','Water in the atmosphere','Water in underground aquifers'], answer: 'The water used to produce a product, embedded in it' },
  { question: 'What is water stress?', options: ['When water demand exceeds available supply','When water supply exceeds demand','When water quality is poor','When water is too cold'], answer: 'When water demand exceeds available supply' },
  { question: 'What is the concept of the water footprint?', options: ['The total volume of fresh water used to produce goods and services','The amount of water a person drinks','The amount of water used in industry','The amount of water used in agriculture'], answer: 'The total volume of fresh water used to produce goods and services' },
  { question: 'What is desalination?', options: ['The removal of salt from seawater to produce fresh water','The addition of salt to fresh water','The purification of fresh water','The recycling of waste water'], answer: 'The removal of salt from seawater to produce fresh water' },
  { question: 'What is the concept of groundwater recharge?', options: ['The process by which water infiltrates and replenishes aquifers','The process by which water evaporates from aquifers','The process by which water flows from aquifers to rivers','The process by which water is extracted from aquifers'], answer: 'The process by which water infiltrates and replenishes aquifers' },
  { question: 'What is the concept of over-abstraction of groundwater?', options: ['Extracting groundwater faster than it is recharged','Extracting groundwater at the same rate as recharge','Not extracting enough groundwater','Extracting groundwater only in dry seasons'], answer: 'Extracting groundwater faster than it is recharged' },
  { question: 'What is the concept of salinisation?', options: ['The build-up of salt in soil due to irrigation, reducing fertility','The removal of salt from soil','The addition of nutrients to soil','The removal of nutrients from soil'], answer: 'The build-up of salt in soil due to irrigation, reducing fertility' },
  { question: 'What is the concept of the global water crisis?', options: ['The growing gap between water supply and demand affecting billions of people','A shortage of water in one country','A shortage of water in one region','A temporary drought'], answer: 'The growing gap between water supply and demand affecting billions of people' },
  { question: 'What is the concept of integrated water resources management (IWRM)?', options: ['A holistic approach to managing water resources sustainably','Managing water only for agriculture','Managing water only for industry','Managing water only for drinking'], answer: 'A holistic approach to managing water resources sustainably' },
  { question: 'What is the concept of the water-energy-food nexus?', options: ['The interconnected relationships between water, energy and food security','The relationship between water and energy only','The relationship between water and food only','The relationship between energy and food only'], answer: 'The interconnected relationships between water, energy and food security' },
  { question: 'What is the concept of blue water?', options: ['Fresh surface and groundwater (rivers, lakes, aquifers)','Water in the atmosphere','Water in glaciers','Water in the ocean'], answer: 'Fresh surface and groundwater (rivers, lakes, aquifers)' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of the critical zone?', options: ['The zone from bedrock to treetops where rock, soil, water, air and living organisms interact','The zone of maximum rainfall','The zone of maximum evaporation','The zone of maximum groundwater'], answer: 'The zone from bedrock to treetops where rock, soil, water, air and living organisms interact' },
  { question: 'What is the concept of ecohydrology?', options: ['The study of interactions between water and ecosystems','The study of water in the atmosphere','The study of water in the ocean','The study of water in glaciers'], answer: 'The study of interactions between water and ecosystems' },
  { question: 'What is the concept of the planetary water boundary?', options: ['The safe limit of freshwater use to maintain Earth\'s life-support systems','The amount of water on Earth','The amount of water in the ocean','The amount of water in the atmosphere'], answer: 'The safe limit of freshwater use to maintain Earth\'s life-support systems' },
  { question: 'What is the concept of teleconnections in hydrology?', options: ['Climate patterns in one region affecting precipitation in distant regions','Direct connections between rivers','Underground connections between aquifers','Connections between rivers and oceans'], answer: 'Climate patterns in one region affecting precipitation in distant regions' },
  { question: 'What is the concept of the ENSO effect on the water cycle?', options: ['El Niño/La Niña alters global precipitation patterns','ENSO only affects ocean temperatures','ENSO only affects wind patterns','ENSO has no effect on the water cycle'], answer: 'El Niño/La Niña alters global precipitation patterns' },
  { question: 'What is the concept of isotope hydrology?', options: ['Using stable isotopes of water to trace water sources and flow paths','Using radioactive isotopes to date water','Using isotopes to measure water temperature','Using isotopes to measure water pressure'], answer: 'Using stable isotopes of water to trace water sources and flow paths' },
  { question: 'What is the concept of the green water-blue water framework?', options: ['Green water: soil moisture from precipitation; blue water: surface and groundwater','Green water: water in plants; blue water: water in rivers','Green water: water in forests; blue water: water in oceans','Green water: fresh water; blue water: salt water'], answer: 'Green water: soil moisture from precipitation; blue water: surface and groundwater' },
  { question: 'What is the concept of hydrological connectivity?', options: ['The degree to which water, materials and energy move through the landscape','The physical connection between rivers','The connection between rivers and oceans','The connection between rivers and aquifers'], answer: 'The degree to which water, materials and energy move through the landscape' },
  { question: 'What is the concept of the Budyko framework?', options: ['A framework relating climate aridity to the ratio of evapotranspiration to precipitation','A framework for measuring river discharge','A framework for measuring groundwater levels','A framework for measuring ocean salinity'], answer: 'A framework relating climate aridity to the ratio of evapotranspiration to precipitation' },
  { question: 'What is the concept of the global freshwater cycle feedback with climate?', options: ['Warming intensifies the water cycle, increasing both droughts and floods','Warming slows the water cycle','Warming has no effect on the water cycle','Warming only increases evaporation'], answer: 'Warming intensifies the water cycle, increasing both droughts and floods' },
  { question: 'What is the concept of the cryosphere\'s role in the water cycle?', options: ['Ice sheets and glaciers store fresh water and regulate sea level and ocean circulation','The cryosphere has no role in the water cycle','The cryosphere only affects local water cycles','The cryosphere only affects ocean salinity'], answer: 'Ice sheets and glaciers store fresh water and regulate sea level and ocean circulation' },
  { question: 'What is the concept of the water cycle under climate change?', options: ['Wet regions get wetter, dry regions get drier, and extreme events intensify','The water cycle slows down','The water cycle speeds up uniformly','The water cycle is unaffected by climate change'], answer: 'Wet regions get wetter, dry regions get drier, and extreme events intensify' },
];

export default function WaterCycleGame() {
  return (
    <>
      <Helmet>
        <title>Water Cycle — Sodafom</title>
        <meta name="description" content="Follow the journey of water through the water cycle!" />
        <link rel="canonical" href="https://sodafom.uk/games/water-cycle" />
        <meta property="og:title" content="Water Cycle — Sodafom" />
        <meta property="og:description" content="Follow the journey of water through the water cycle!" />
        <meta property="og:url" content="https://sodafom.uk/games/water-cycle" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Water Cycle — Science Game for Kids — Sodafom</h1>
      <GameShell title="Water Cycle" emoji="🌧️" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="water-cycle"
            title="Water Cycle"
            emoji="🌧️"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
