import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What do roots do?', options: ['Absorb water and anchor the plant','Make food for the plant','Carry water up the plant','Produce seeds'], answer: 'Absorb water and anchor the plant' },
  { question: 'What do leaves do?', options: ['Make food through photosynthesis','Absorb water','Carry water up the plant','Produce seeds'], answer: 'Make food through photosynthesis' },
  { question: 'What does the stem do?', options: ['Supports the plant and carries water','Makes food','Absorbs water','Produces seeds'], answer: 'Supports the plant and carries water' },
  { question: 'What does the flower do?', options: ['Attracts pollinators and produces seeds','Makes food','Absorbs water','Carries water'], answer: 'Attracts pollinators and produces seeds' },
  { question: 'What is photosynthesis?', options: ['Making food using sunlight, water and CO₂','Absorbing water from soil','Carrying water up the stem','Producing seeds'], answer: 'Making food using sunlight, water and CO₂' },
  { question: 'What gas do plants take in during photosynthesis?', options: ['Carbon dioxide','Oxygen','Nitrogen','Hydrogen'], answer: 'Carbon dioxide' },
  { question: 'What gas do plants release during photosynthesis?', options: ['Oxygen','Carbon dioxide','Nitrogen','Hydrogen'], answer: 'Oxygen' },
  { question: 'What is the green pigment in leaves called?', options: ['Chlorophyll','Carotene','Anthocyanin','Xanthophyll'], answer: 'Chlorophyll' },
  { question: 'What is the stamen?', options: ['The male part of a flower','The female part of a flower','The petal','The sepal'], answer: 'The male part of a flower' },
  { question: 'What is the pistil?', options: ['The female part of a flower','The male part of a flower','The petal','The sepal'], answer: 'The female part of a flower' },
  { question: 'What is the anther?', options: ['The part of the stamen that produces pollen','The part of the pistil that receives pollen','The petal','The sepal'], answer: 'The part of the stamen that produces pollen' },
  { question: 'What is the stigma?', options: ['The part of the pistil that receives pollen','The part of the stamen that produces pollen','The petal','The sepal'], answer: 'The part of the pistil that receives pollen' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the equation for photosynthesis?', options: ['CO₂ + H₂O → glucose + O₂','O₂ + H₂O → glucose + CO₂','CO₂ + O₂ → glucose + H₂O','Glucose + O₂ → CO₂ + H₂O'], answer: 'CO₂ + H₂O → glucose + O₂' },
  { question: 'What is transpiration?', options: ['The loss of water vapour from leaves','The absorption of water by roots','The transport of water up the stem','The production of food in leaves'], answer: 'The loss of water vapour from leaves' },
  { question: 'What are stomata?', options: ['Tiny pores in leaves that allow gas exchange','The cells that contain chlorophyll','The tubes that carry water up the stem','The cells that produce pollen'], answer: 'Tiny pores in leaves that allow gas exchange' },
  { question: 'What is xylem?', options: ['Tissue that carries water up the plant','Tissue that carries food down the plant','Tissue that produces pollen','Tissue that absorbs light'], answer: 'Tissue that carries water up the plant' },
  { question: 'What is phloem?', options: ['Tissue that carries food (sugars) around the plant','Tissue that carries water up the plant','Tissue that produces pollen','Tissue that absorbs light'], answer: 'Tissue that carries food (sugars) around the plant' },
  { question: 'What is the ovary in a flower?', options: ['The part that contains ovules and develops into fruit','The part that produces pollen','The part that receives pollen','The part that attracts pollinators'], answer: 'The part that contains ovules and develops into fruit' },
  { question: 'What is the ovule in a flower?', options: ['The part that develops into a seed after fertilisation','The part that produces pollen','The part that receives pollen','The part that attracts pollinators'], answer: 'The part that develops into a seed after fertilisation' },
  { question: 'What is the sepal?', options: ['The leaf-like structure that protects the flower bud','The petal','The stamen','The pistil'], answer: 'The leaf-like structure that protects the flower bud' },
  { question: 'What is the style in a flower?', options: ['The stalk connecting stigma to ovary','The part that produces pollen','The part that receives pollen','The part that attracts pollinators'], answer: 'The stalk connecting stigma to ovary' },
  { question: 'What is the filament in a flower?', options: ['The stalk of the stamen that supports the anther','The part that produces pollen','The part that receives pollen','The part that attracts pollinators'], answer: 'The stalk of the stamen that supports the anther' },
  { question: 'What is the nectary?', options: ['The part of the flower that produces nectar','The part that produces pollen','The part that receives pollen','The part that develops into fruit'], answer: 'The part of the flower that produces nectar' },
  { question: 'What is the receptacle?', options: ['The part of the flower stalk that supports the flower parts','The part that produces pollen','The part that receives pollen','The part that develops into fruit'], answer: 'The part of the flower stalk that supports the flower parts' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the equation for respiration?', options: ['Glucose + O₂ → CO₂ + H₂O + energy','CO₂ + H₂O → glucose + O₂','Glucose → CO₂ + H₂O','O₂ + H₂O → glucose + CO₂'], answer: 'Glucose + O₂ → CO₂ + H₂O + energy' },
  { question: 'What is the role of guard cells?', options: ['Control the opening and closing of stomata','Produce chlorophyll','Transport water','Produce pollen'], answer: 'Control the opening and closing of stomata' },
  { question: 'What is the palisade mesophyll?', options: ['The main photosynthetic layer of cells in a leaf','The layer that allows gas exchange','The layer that transports water','The layer that produces pollen'], answer: 'The main photosynthetic layer of cells in a leaf' },
  { question: 'What is the spongy mesophyll?', options: ['The layer with air spaces for gas exchange in a leaf','The main photosynthetic layer','The layer that transports water','The layer that produces pollen'], answer: 'The layer with air spaces for gas exchange in a leaf' },
  { question: 'What is the cuticle of a leaf?', options: ['A waxy layer that reduces water loss','The layer that absorbs light','The layer that allows gas exchange','The layer that transports water'], answer: 'A waxy layer that reduces water loss' },
  { question: 'What is the vascular bundle in a leaf?', options: ['The xylem and phloem running through the leaf','The layer that absorbs light','The layer that allows gas exchange','The layer that produces pollen'], answer: 'The xylem and phloem running through the leaf' },
  { question: 'What is the role of root hair cells?', options: ['Increase surface area for water and mineral absorption','Produce food','Transport water up the stem','Produce pollen'], answer: 'Increase surface area for water and mineral absorption' },
  { question: 'What is osmosis in plants?', options: ['The movement of water from high to low water potential across a membrane','The movement of minerals up the stem','The movement of sugars down the stem','The movement of gases through stomata'], answer: 'The movement of water from high to low water potential across a membrane' },
  { question: 'What is active transport in plants?', options: ['The movement of minerals against a concentration gradient using energy','The movement of water by osmosis','The movement of sugars by diffusion','The movement of gases through stomata'], answer: 'The movement of minerals against a concentration gradient using energy' },
  { question: 'What is the cohesion-tension theory?', options: ['Water is pulled up the xylem by transpiration pull and cohesion of water molecules','Water is pushed up the xylem by root pressure','Water moves up the xylem by osmosis','Water moves up the xylem by active transport'], answer: 'Water is pulled up the xylem by transpiration pull and cohesion of water molecules' },
  { question: 'What is source-to-sink transport in phloem?', options: ['Sugars move from where they are made (source) to where they are used (sink)','Sugars move from where they are used to where they are made','Water moves from roots to leaves','Minerals move from leaves to roots'], answer: 'Sugars move from where they are made (source) to where they are used (sink)' },
  { question: 'What is the pressure-flow hypothesis?', options: ['Sugars are loaded into phloem at the source, creating high pressure that drives flow to the sink','Sugars are pulled up the phloem by transpiration','Sugars move by osmosis in the phloem','Sugars move by active transport only in the phloem'], answer: 'Sugars are loaded into phloem at the source, creating high pressure that drives flow to the sink' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the light-dependent reaction of photosynthesis?', options: ['Uses light energy to split water and produce ATP and NADPH','Uses ATP to fix CO₂ into glucose','Occurs in the stroma','Produces glucose directly'], answer: 'Uses light energy to split water and produce ATP and NADPH' },
  { question: 'What is the light-independent reaction (Calvin cycle)?', options: ['Uses ATP and NADPH to fix CO₂ into glucose in the stroma','Uses light energy to split water','Occurs in the thylakoid membrane','Produces ATP directly'], answer: 'Uses ATP and NADPH to fix CO₂ into glucose in the stroma' },
  { question: 'What is the role of chloroplasts?', options: ['The site of photosynthesis in plant cells','The site of respiration','The site of protein synthesis','The site of cell division'], answer: 'The site of photosynthesis in plant cells' },
  { question: 'What is the thylakoid membrane?', options: ['The membrane in chloroplasts where light-dependent reactions occur','The membrane where the Calvin cycle occurs','The outer membrane of the chloroplast','The membrane of the vacuole'], answer: 'The membrane in chloroplasts where light-dependent reactions occur' },
  { question: 'What is the stroma?', options: ['The fluid-filled space in chloroplasts where the Calvin cycle occurs','The membrane where light-dependent reactions occur','The outer membrane of the chloroplast','The space between the two chloroplast membranes'], answer: 'The fluid-filled space in chloroplasts where the Calvin cycle occurs' },
  { question: 'What is photorespiration?', options: ['A wasteful process where RuBisCO fixes O₂ instead of CO₂','The light-dependent reaction','The Calvin cycle','The process of respiration in light'], answer: 'A wasteful process where RuBisCO fixes O₂ instead of CO₂' },
  { question: 'What is C4 photosynthesis?', options: ['A pathway that concentrates CO₂ to reduce photorespiration in hot climates','The standard photosynthesis pathway','A pathway that uses only light energy','A pathway that produces 4 ATP per glucose'], answer: 'A pathway that concentrates CO₂ to reduce photorespiration in hot climates' },
  { question: 'What is CAM photosynthesis?', options: ['A pathway where stomata open at night to fix CO₂ (used by cacti)','A pathway that concentrates CO₂','The standard photosynthesis pathway','A pathway that uses only light energy'], answer: 'A pathway where stomata open at night to fix CO₂ (used by cacti)' },
  { question: 'What is the role of auxin in plants?', options: ['A hormone that promotes cell elongation and controls tropisms','A hormone that promotes flowering','A hormone that promotes seed germination','A hormone that promotes fruit ripening'], answer: 'A hormone that promotes cell elongation and controls tropisms' },
  { question: 'What is phototropism?', options: ['Growth of a plant towards light','Growth of a plant away from light','Growth of roots downwards','Growth of shoots upwards'], answer: 'Growth of a plant towards light' },
  { question: 'What is gravitropism?', options: ['Growth response to gravity (roots grow down, shoots grow up)','Growth response to light','Growth response to water','Growth response to touch'], answer: 'Growth response to gravity (roots grow down, shoots grow up)' },
  { question: 'What is the role of gibberellins?', options: ['Promote stem elongation and seed germination','Promote root growth','Promote leaf senescence','Promote fruit ripening'], answer: 'Promote stem elongation and seed germination' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the Z-scheme in photosynthesis?', options: ['The pathway of electrons through photosystems II and I in the light-dependent reactions','The pathway of CO₂ fixation','The pathway of ATP synthesis','The pathway of water splitting'], answer: 'The pathway of electrons through photosystems II and I in the light-dependent reactions' },
  { question: 'What is the role of RuBisCO?', options: ['The enzyme that fixes CO₂ in the Calvin cycle','The enzyme that splits water','The enzyme that produces ATP','The enzyme that produces NADPH'], answer: 'The enzyme that fixes CO₂ in the Calvin cycle' },
  { question: 'What is the concept of apoplast and symplast pathways?', options: ['Apoplast: through cell walls; symplast: through cytoplasm and plasmodesmata','Apoplast: through cytoplasm; symplast: through cell walls','Both are through cell walls','Both are through cytoplasm'], answer: 'Apoplast: through cell walls; symplast: through cytoplasm and plasmodesmata' },
  { question: 'What is the Casparian strip?', options: ['A waterproof band in root endodermis that forces water through the symplast','A band of xylem in the root','A band of phloem in the root','A band of cells in the leaf'], answer: 'A waterproof band in root endodermis that forces water through the symplast' },
  { question: 'What is the concept of turgor pressure?', options: ['Pressure exerted by water against the cell wall, keeping plant cells firm','Pressure exerted by the cell wall on water','Pressure in the xylem','Pressure in the phloem'], answer: 'Pressure exerted by water against the cell wall, keeping plant cells firm' },
  { question: 'What is the concept of water potential?', options: ['A measure of the tendency of water to move from one area to another (Ψ = Ψs + Ψp)','The amount of water in a cell','The pressure of water in a cell','The concentration of water in a cell'], answer: 'A measure of the tendency of water to move from one area to another (Ψ = Ψs + Ψp)' },
  { question: 'What is the role of abscisic acid (ABA)?', options: ['Promotes stomatal closure and seed dormancy under stress','Promotes stomatal opening','Promotes cell elongation','Promotes seed germination'], answer: 'Promotes stomatal closure and seed dormancy under stress' },
  { question: 'What is the role of cytokinins?', options: ['Promote cell division and delay senescence','Promote cell elongation','Promote root growth','Promote fruit ripening'], answer: 'Promote cell division and delay senescence' },
  { question: 'What is the role of ethylene in plants?', options: ['Promotes fruit ripening and leaf abscission','Promotes cell elongation','Promotes seed germination','Promotes root growth'], answer: 'Promotes fruit ripening and leaf abscission' },
  { question: 'What is the concept of vernalisation?', options: ['The requirement for a period of cold to trigger flowering','The requirement for a period of heat to trigger flowering','The requirement for a period of drought to trigger flowering','The requirement for a period of darkness to trigger flowering'], answer: 'The requirement for a period of cold to trigger flowering' },
  { question: 'What is photoperiodism?', options: ['The response of plants to the relative lengths of day and night','The response to light intensity','The response to light wavelength','The response to light direction'], answer: 'The response of plants to the relative lengths of day and night' },
  { question: 'What is the concept of phytochrome?', options: ['A photoreceptor that detects red and far-red light to control flowering and germination','A pigment that absorbs blue light','A pigment that absorbs green light','A pigment that absorbs UV light'], answer: 'A photoreceptor that detects red and far-red light to control flowering and germination' },
];

export default function PlantPartsGame() {
  return (
    <>
      <Helmet>
        <title>Plant Parts — Sodafom</title>
        <meta name="description" content="Learn about the different parts of plants and their functions!" />
        <link rel="canonical" href="https://sodafom.uk/games/plant-parts" />
        <meta property="og:title" content="Plant Parts — Sodafom" />
        <meta property="og:description" content="Learn about the different parts of plants and their functions!" />
        <meta property="og:url" content="https://sodafom.uk/games/plant-parts" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Plant Parts — Science Game for Kids — Sodafom</h1>
      <GameShell title="Plant Parts" emoji="🌱" subject="science" ageGroups={['5–7', '7–9']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="plant-parts"
            title="Plant Parts"
            emoji="🌱"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
