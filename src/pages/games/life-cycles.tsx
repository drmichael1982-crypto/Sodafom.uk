import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is the first stage of a butterfly\'s life cycle?', options: ['Egg','Larva','Pupa','Adult'], answer: 'Egg' },
  { question: 'What is the second stage of a butterfly\'s life cycle?', options: ['Larva (caterpillar)','Egg','Pupa','Adult'], answer: 'Larva (caterpillar)' },
  { question: 'What is the third stage of a butterfly\'s life cycle?', options: ['Pupa (chrysalis)','Egg','Larva','Adult'], answer: 'Pupa (chrysalis)' },
  { question: 'What is the fourth stage of a butterfly\'s life cycle?', options: ['Adult butterfly','Egg','Larva','Pupa'], answer: 'Adult butterfly' },
  { question: 'What is the first stage of a frog\'s life cycle?', options: ['Egg (frogspawn)','Tadpole','Froglet','Adult frog'], answer: 'Egg (frogspawn)' },
  { question: 'What is the second stage of a frog\'s life cycle?', options: ['Tadpole','Egg','Froglet','Adult frog'], answer: 'Tadpole' },
  { question: 'What is the third stage of a frog\'s life cycle?', options: ['Froglet','Egg','Tadpole','Adult frog'], answer: 'Froglet' },
  { question: 'What is the fourth stage of a frog\'s life cycle?', options: ['Adult frog','Egg','Tadpole','Froglet'], answer: 'Adult frog' },
  { question: 'What is metamorphosis?', options: ['A dramatic change in body form','A type of reproduction','A type of growth','A type of feeding'], answer: 'A dramatic change in body form' },
  { question: 'What is a larva?', options: ['A young insect that looks different from the adult','A young insect that looks like the adult','A type of egg','A type of pupa'], answer: 'A young insect that looks different from the adult' },
  { question: 'What is a pupa?', options: ['A resting stage where metamorphosis occurs','A young insect','A type of egg','An adult insect'], answer: 'A resting stage where metamorphosis occurs' },
  { question: 'What is a nymph?', options: ['A young insect that looks like the adult','A young insect that looks different from the adult','A type of egg','A type of pupa'], answer: 'A young insect that looks like the adult' },
];
const L2: QuizQuestion[] = [
  { question: 'What is complete metamorphosis?', options: ['Egg → larva → pupa → adult','Egg → nymph → adult','Egg → larva → adult','Egg → pupa → adult'], answer: 'Egg → larva → pupa → adult' },
  { question: 'What is incomplete metamorphosis?', options: ['Egg → nymph → adult','Egg → larva → pupa → adult','Egg → larva → adult','Egg → pupa → adult'], answer: 'Egg → nymph → adult' },
  { question: 'Which insect undergoes complete metamorphosis?', options: ['Butterfly','Grasshopper','Dragonfly','Cockroach'], answer: 'Butterfly' },
  { question: 'Which insect undergoes incomplete metamorphosis?', options: ['Grasshopper','Butterfly','Moth','Beetle'], answer: 'Grasshopper' },
  { question: 'What is the life cycle of a plant?', options: ['Seed → germination → seedling → adult plant → flower → seed','Seed → flower → seedling → adult plant','Seed → adult plant → seedling → flower','Flower → seed → seedling → adult plant'], answer: 'Seed → germination → seedling → adult plant → flower → seed' },
  { question: 'What is pollination?', options: ['Transfer of pollen from anther to stigma','Transfer of seeds from plant to plant','Transfer of water from roots to leaves','Transfer of nutrients from soil to plant'], answer: 'Transfer of pollen from anther to stigma' },
  { question: 'What is fertilisation in plants?', options: ['Pollen fuses with ovule to form a seed','Pollen is transferred to the stigma','Seeds are dispersed','Seeds germinate'], answer: 'Pollen fuses with ovule to form a seed' },
  { question: 'What is seed dispersal?', options: ['Seeds being spread away from the parent plant','Seeds germinating','Seeds being pollinated','Seeds being fertilised'], answer: 'Seeds being spread away from the parent plant' },
  { question: 'What is germination?', options: ['A seed beginning to grow','A plant producing flowers','A plant producing seeds','A plant being pollinated'], answer: 'A seed beginning to grow' },
  { question: 'What is asexual reproduction?', options: ['Reproduction without fertilisation','Reproduction with fertilisation','Reproduction involving two parents','Reproduction involving eggs'], answer: 'Reproduction without fertilisation' },
  { question: 'What is sexual reproduction?', options: ['Reproduction involving fertilisation of egg by sperm','Reproduction without fertilisation','Reproduction involving one parent','Reproduction by budding'], answer: 'Reproduction involving fertilisation of egg by sperm' },
  { question: 'What is a mammal\'s life cycle?', options: ['Birth → growth → reproduction → death','Egg → larva → pupa → adult','Egg → nymph → adult','Seed → germination → adult → seed'], answer: 'Birth → growth → reproduction → death' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the life cycle of a mosquito?', options: ['Egg → larva → pupa → adult','Egg → nymph → adult','Egg → larva → adult','Egg → pupa → adult'], answer: 'Egg → larva → pupa → adult' },
  { question: 'What is the life cycle of a dragonfly?', options: ['Egg → nymph → adult','Egg → larva → pupa → adult','Egg → larva → adult','Egg → pupa → adult'], answer: 'Egg → nymph → adult' },
  { question: 'What is vegetative reproduction?', options: ['Asexual reproduction in plants using roots, stems or leaves','Sexual reproduction in plants','Reproduction by seeds','Reproduction by spores'], answer: 'Asexual reproduction in plants using roots, stems or leaves' },
  { question: 'What is a runner (stolon) in plants?', options: ['A horizontal stem that produces new plants','A type of root','A type of leaf','A type of flower'], answer: 'A horizontal stem that produces new plants' },
  { question: 'What is a rhizome?', options: ['An underground horizontal stem that produces new plants','A type of root','A type of leaf','A type of flower'], answer: 'An underground horizontal stem that produces new plants' },
  { question: 'What is a bulb in plants?', options: ['An underground storage organ that produces new plants','A type of root','A type of leaf','A type of flower'], answer: 'An underground storage organ that produces new plants' },
  { question: 'What is the life cycle of a conifer?', options: ['Produces seeds in cones without flowers','Produces seeds in flowers','Reproduces by spores','Reproduces by budding'], answer: 'Produces seeds in cones without flowers' },
  { question: 'What is the life cycle of a fern?', options: ['Alternates between sporophyte and gametophyte generations','Produces seeds in cones','Produces seeds in flowers','Reproduces by budding'], answer: 'Alternates between sporophyte and gametophyte generations' },
  { question: 'What is a spore?', options: ['A reproductive cell that can grow into a new organism without fertilisation','A type of seed','A type of pollen','A type of egg'], answer: 'A reproductive cell that can grow into a new organism without fertilisation' },
  { question: 'What is the life cycle of a moss?', options: ['Alternates between gametophyte and sporophyte generations','Produces seeds','Produces flowers','Reproduces by budding'], answer: 'Alternates between gametophyte and sporophyte generations' },
  { question: 'What is the life cycle of a jellyfish?', options: ['Alternates between polyp and medusa stages','Egg → larva → pupa → adult','Egg → nymph → adult','Birth → growth → reproduction → death'], answer: 'Alternates between polyp and medusa stages' },
  { question: 'What is binary fission?', options: ['Asexual reproduction where a cell divides into two identical cells','Sexual reproduction','Reproduction by spores','Reproduction by budding'], answer: 'Asexual reproduction where a cell divides into two identical cells' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the alternation of generations in plants?', options: ['Alternating between diploid sporophyte and haploid gametophyte','Alternating between sexual and asexual reproduction','Alternating between annual and perennial growth','Alternating between flowering and non-flowering stages'], answer: 'Alternating between diploid sporophyte and haploid gametophyte' },
  { question: 'What is the role of the cotyledon in a seed?', options: ['Provides nutrients to the developing seedling','Becomes the first true leaf','Becomes the root','Becomes the stem'], answer: 'Provides nutrients to the developing seedling' },
  { question: 'What is a monocot?', options: ['A flowering plant with one cotyledon','A flowering plant with two cotyledons','A non-flowering plant','A plant that reproduces by spores'], answer: 'A flowering plant with one cotyledon' },
  { question: 'What is a dicot?', options: ['A flowering plant with two cotyledons','A flowering plant with one cotyledon','A non-flowering plant','A plant that reproduces by spores'], answer: 'A flowering plant with two cotyledons' },
  { question: 'What is the role of the placenta in mammals?', options: ['Exchanges nutrients and waste between mother and foetus','Produces milk','Stores food for the foetus','Produces hormones only'], answer: 'Exchanges nutrients and waste between mother and foetus' },
  { question: 'What is gestation?', options: ['The period of development from fertilisation to birth','The period of growth after birth','The period of reproduction','The period of ageing'], answer: 'The period of development from fertilisation to birth' },
  { question: 'What is metamorphosis in amphibians?', options: ['The transformation from aquatic larva to terrestrial adult','The transformation from egg to larva','The transformation from larva to pupa','The transformation from pupa to adult'], answer: 'The transformation from aquatic larva to terrestrial adult' },
  { question: 'What is the role of the yolk in an egg?', options: ['Provides nutrients to the developing embryo','Protects the embryo','Allows gas exchange','Provides water to the embryo'], answer: 'Provides nutrients to the developing embryo' },
  { question: 'What is parthenogenesis?', options: ['Development of an egg without fertilisation','Development of a sperm without fertilisation','Asexual reproduction by budding','Asexual reproduction by binary fission'], answer: 'Development of an egg without fertilisation' },
  { question: 'What is the difference between oviparous and viviparous animals?', options: ['Oviparous lay eggs; viviparous give birth to live young','Oviparous give birth to live young; viviparous lay eggs','Both lay eggs','Both give birth to live young'], answer: 'Oviparous lay eggs; viviparous give birth to live young' },
  { question: 'What is the role of meiosis in the life cycle?', options: ['Produces haploid gametes for sexual reproduction','Produces diploid cells for growth','Produces spores for asexual reproduction','Produces cells for repair'], answer: 'Produces haploid gametes for sexual reproduction' },
  { question: 'What is the role of mitosis in the life cycle?', options: ['Produces identical diploid cells for growth and repair','Produces haploid gametes','Produces spores','Produces eggs and sperm'], answer: 'Produces identical diploid cells for growth and repair' },
];
const L5: QuizQuestion[] = [
  { question: 'What is senescence in biology?', options: ['The process of ageing and deterioration of cells and organisms','The process of growth','The process of reproduction','The process of development'], answer: 'The process of ageing and deterioration of cells and organisms' },
  { question: 'What is the Hayflick limit?', options: ['The maximum number of times a normal cell can divide (~50 times)','The maximum lifespan of an organism','The maximum size of a cell','The maximum number of offspring an organism can have'], answer: 'The maximum number of times a normal cell can divide (~50 times)' },
  { question: 'What is a telomere?', options: ['A protective cap at the end of a chromosome that shortens with each division','A type of gene','A type of protein','A type of chromosome'], answer: 'A protective cap at the end of a chromosome that shortens with each division' },
  { question: 'What is apoptosis?', options: ['Programmed cell death','Uncontrolled cell division','Cell growth','Cell repair'], answer: 'Programmed cell death' },
  { question: 'What is the role of stem cells in the life cycle?', options: ['Undifferentiated cells that can develop into specialised cell types','Cells that only divide','Cells that only repair','Cells that only produce gametes'], answer: 'Undifferentiated cells that can develop into specialised cell types' },
  { question: 'What is totipotency?', options: ['The ability of a cell to develop into any cell type including extra-embryonic tissue','The ability to develop into any body cell only','The ability to divide indefinitely','The ability to repair any tissue'], answer: 'The ability of a cell to develop into any cell type including extra-embryonic tissue' },
  { question: 'What is epigenetic inheritance?', options: ['Inheritance of gene expression patterns without changes to DNA sequence','Inheritance of DNA mutations','Inheritance of chromosome number changes','Inheritance of protein structures'], answer: 'Inheritance of gene expression patterns without changes to DNA sequence' },
  { question: 'What is the concept of r and K selection strategies?', options: ['r: many offspring, little care; K: few offspring, much care','r: few offspring, much care; K: many offspring, little care','Both produce many offspring','Both produce few offspring'], answer: 'r: many offspring, little care; K: few offspring, much care' },
  { question: 'What is the role of hormones in controlling the life cycle?', options: ['Hormones regulate growth, reproduction and ageing','Hormones only regulate growth','Hormones only regulate reproduction','Hormones have no role in the life cycle'], answer: 'Hormones regulate growth, reproduction and ageing' },
  { question: 'What is the concept of biological clocks?', options: ['Internal timing mechanisms that regulate biological processes','External clocks that control behaviour','The rate of cell division','The rate of ageing'], answer: 'Internal timing mechanisms that regulate biological processes' },
  { question: 'What is the role of the hypothalamus in reproduction?', options: ['Controls the release of reproductive hormones via the pituitary gland','Produces sperm and eggs','Produces milk','Controls behaviour only'], answer: 'Controls the release of reproductive hormones via the pituitary gland' },
  { question: 'What is the concept of semelparity?', options: ['Reproducing once and then dying (e.g. Pacific salmon)','Reproducing multiple times','Reproducing continuously','Not reproducing'], answer: 'Reproducing once and then dying (e.g. Pacific salmon)' },
];

export default function LifeCyclesGame() {
  return (
    <>
      <Helmet>
        <title>Life Cycles — Sodafom</title>
        <meta name="description" content="Explore the life cycles of plants, animals, and insects!" />
        <link rel="canonical" href="https://sodafom.uk/games/life-cycles" />
        <meta property="og:title" content="Life Cycles — Sodafom" />
        <meta property="og:description" content="Explore the life cycles of plants, animals, and insects!" />
        <meta property="og:url" content="https://sodafom.uk/games/life-cycles" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Life Cycles — Science Game for Kids — Sodafom</h1>
      <GameShell title="Life Cycles" emoji="🦋" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="life-cycles"
            title="Life Cycles"
            emoji="🦋"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
