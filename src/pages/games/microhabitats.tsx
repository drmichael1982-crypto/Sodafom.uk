import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is a habitat?', options: ['The place where an organism lives','The food an organism eats','The predator of an organism','The size of an organism'], answer: 'The place where an organism lives' },
  { question: 'What is a microhabitat?', options: ['A small habitat within a larger one','A very large habitat','A habitat in the sea','A habitat in the sky'], answer: 'A small habitat within a larger one' },
  { question: 'Where might you find a woodlouse?', options: ['Under a log or stone','In the open sky','In the sea','In a desert'], answer: 'Under a log or stone' },
  { question: 'Where might you find a pond snail?', options: ['In a pond','In a desert','In a forest','In the sky'], answer: 'In a pond' },
  { question: 'What is a nocturnal animal?', options: ['An animal that is active at night','An animal that is active during the day','An animal that lives underground','An animal that lives in water'], answer: 'An animal that is active at night' },
  { question: 'What is a diurnal animal?', options: ['An animal that is active during the day','An animal that is active at night','An animal that lives underground','An animal that lives in water'], answer: 'An animal that is active during the day' },
  { question: 'What is camouflage?', options: ['Blending in with the surroundings','Making a loud noise','Running very fast','Being very large'], answer: 'Blending in with the surroundings' },
  { question: 'What is hibernation?', options: ['A long sleep during winter','A long sleep during summer','A type of migration','A type of feeding'], answer: 'A long sleep during winter' },
  { question: 'What is migration?', options: ['Moving to a different place seasonally','A long sleep during winter','A type of feeding','A type of camouflage'], answer: 'Moving to a different place seasonally' },
  { question: 'What is a biotic factor?', options: ['A living factor in an ecosystem','A non-living factor in an ecosystem','A type of habitat','A type of organism'], answer: 'A living factor in an ecosystem' },
  { question: 'What is an abiotic factor?', options: ['A non-living factor in an ecosystem','A living factor in an ecosystem','A type of habitat','A type of organism'], answer: 'A non-living factor in an ecosystem' },
  { question: 'What is a population?', options: ['All organisms of the same species in an area','All organisms in an area','All plants in an area','All animals in an area'], answer: 'All organisms of the same species in an area' },
];
const L2: QuizQuestion[] = [
  { question: 'What is a community?', options: ['All organisms in an area','All organisms of the same species in an area','All plants in an area','All animals in an area'], answer: 'All organisms in an area' },
  { question: 'What is an ecosystem?', options: ['A community of organisms and their environment','A type of habitat','A type of organism','A type of food chain'], answer: 'A community of organisms and their environment' },
  { question: 'What is biodiversity?', options: ['The variety of life in an area','The number of organisms in an area','The size of an ecosystem','The age of an ecosystem'], answer: 'The variety of life in an area' },
  { question: 'What is a pooter used for?', options: ['Collecting small invertebrates','Measuring temperature','Measuring rainfall','Measuring light levels'], answer: 'Collecting small invertebrates' },
  { question: 'What is a quadrat used for?', options: ['Sampling organisms in an area','Collecting small invertebrates','Measuring temperature','Measuring rainfall'], answer: 'Sampling organisms in an area' },
  { question: 'What is a transect used for?', options: ['Sampling organisms along a line','Sampling organisms in an area','Collecting small invertebrates','Measuring temperature'], answer: 'Sampling organisms along a line' },
  { question: 'What is indicator species?', options: ['A species that indicates the health of an ecosystem','A species at the top of the food chain','A species at the bottom of the food chain','A species that is endangered'], answer: 'A species that indicates the health of an ecosystem' },
  { question: 'What is a lichen?', options: ['A symbiosis of algae and fungi','A type of plant','A type of animal','A type of bacteria'], answer: 'A symbiosis of algae and fungi' },
  { question: 'What does a lichen indicate about air quality?', options: ['Clean air','Polluted air','Humid air','Dry air'], answer: 'Clean air' },
  { question: 'What is succession?', options: ['The gradual change in an ecosystem over time','The sudden change in an ecosystem','The destruction of an ecosystem','The creation of an ecosystem'], answer: 'The gradual change in an ecosystem over time' },
  { question: 'What is a pioneer species?', options: ['The first species to colonise a new habitat','The last species in a succession','The dominant species in an ecosystem','The rarest species in an ecosystem'], answer: 'The first species to colonise a new habitat' },
  { question: 'What is a climax community?', options: ['The final stable community in a succession','The first community in a succession','The largest community in an ecosystem','The smallest community in an ecosystem'], answer: 'The final stable community in a succession' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the Lincoln-Petersen method?', options: ['A mark-recapture method to estimate population size','A method to measure biodiversity','A method to sample plants','A method to measure abiotic factors'], answer: 'A mark-recapture method to estimate population size' },
  { question: 'What is the Simpson\'s Diversity Index used for?', options: ['Measuring biodiversity in an ecosystem','Measuring population size','Measuring abiotic factors','Measuring food chain length'], answer: 'Measuring biodiversity in an ecosystem' },
  { question: 'What is a pitfall trap used for?', options: ['Catching ground-dwelling invertebrates','Catching flying insects','Catching aquatic organisms','Catching large mammals'], answer: 'Catching ground-dwelling invertebrates' },
  { question: 'What is a sweep net used for?', options: ['Catching insects in long grass','Catching aquatic organisms','Catching ground-dwelling invertebrates','Catching large mammals'], answer: 'Catching insects in long grass' },
  { question: 'What is a kick sample used for?', options: ['Sampling aquatic invertebrates in streams','Sampling ground-dwelling invertebrates','Sampling flying insects','Sampling plants'], answer: 'Sampling aquatic invertebrates in streams' },
  { question: 'What is a light trap used for?', options: ['Attracting and catching nocturnal insects','Catching ground-dwelling invertebrates','Catching aquatic organisms','Catching large mammals'], answer: 'Attracting and catching nocturnal insects' },
  { question: 'What is a belt transect?', options: ['A strip of habitat sampled at regular intervals','A line along which organisms are counted','A method to catch invertebrates','A method to measure abiotic factors'], answer: 'A strip of habitat sampled at regular intervals' },
  { question: 'What is random sampling?', options: ['Placing quadrats at random positions to avoid bias','Placing quadrats where organisms are most common','Placing quadrats at regular intervals','Placing quadrats at the edges of a habitat'], answer: 'Placing quadrats at random positions to avoid bias' },
  { question: 'What is an edaphic factor?', options: ['A soil-related abiotic factor','A water-related abiotic factor','A light-related abiotic factor','A temperature-related abiotic factor'], answer: 'A soil-related abiotic factor' },
  { question: 'What is pH of soil an example of?', options: ['An abiotic factor','A biotic factor','A population factor','A community factor'], answer: 'An abiotic factor' },
  { question: 'What is a keystone species?', options: ['A species with a disproportionately large effect on its ecosystem','A species at the top of the food chain','A species that is most abundant','A species that is rarest'], answer: 'A species with a disproportionately large effect on its ecosystem' },
  { question: 'What is habitat fragmentation?', options: ['The breaking up of a habitat into smaller isolated patches','The destruction of an entire habitat','The creation of a new habitat','The restoration of a habitat'], answer: 'The breaking up of a habitat into smaller isolated patches' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the formula for the Lincoln-Petersen estimate?', options: ['N = (M × C) / R','N = M + C + R','N = M × C × R','N = M / (C × R)'], answer: 'N = (M × C) / R' },
  { question: 'What is the formula for Simpson\'s Diversity Index (D)?', options: ['D = 1 - Σ(n/N)²','D = Σ(n/N)²','D = N/Σn²','D = Σn²/N'], answer: 'D = 1 - Σ(n/N)²' },
  { question: 'What is the concept of edge effects in ecology?', options: ['Increased biodiversity at the boundary between two habitats','Decreased biodiversity at boundaries','No change in biodiversity at boundaries','Increased predation at boundaries only'], answer: 'Increased biodiversity at the boundary between two habitats' },
  { question: 'What is a corridor in conservation biology?', options: ['A strip of habitat connecting isolated patches','A type of habitat','A type of sampling method','A type of population estimate'], answer: 'A strip of habitat connecting isolated patches' },
  { question: 'What is minimum viable population (MVP)?', options: ['The smallest population size with a high probability of long-term survival','The maximum population size','The average population size','The initial population size'], answer: 'The smallest population size with a high probability of long-term survival' },
  { question: 'What is ex situ conservation?', options: ['Conserving species outside their natural habitat (e.g. zoos, seed banks)','Conserving species in their natural habitat','Conserving habitats only','Conserving ecosystems only'], answer: 'Conserving species outside their natural habitat (e.g. zoos, seed banks)' },
  { question: 'What is in situ conservation?', options: ['Conserving species in their natural habitat (e.g. nature reserves)','Conserving species outside their natural habitat','Conserving species in zoos','Conserving species in seed banks'], answer: 'Conserving species in their natural habitat (e.g. nature reserves)' },
  { question: 'What is the IUCN Red List?', options: ['A global list of threatened species and their conservation status','A list of extinct species only','A list of invasive species','A list of protected habitats'], answer: 'A global list of threatened species and their conservation status' },
  { question: 'What is rewilding?', options: ['Restoring ecosystems by reintroducing species and reducing human management','Introducing non-native species','Removing all species from an area','Farming wild animals'], answer: 'Restoring ecosystems by reintroducing species and reducing human management' },
  { question: 'What is the concept of umbrella species?', options: ['A species whose conservation protects many other species in the same habitat','A species at the top of the food chain','A species that is most abundant','A species that is rarest'], answer: 'A species whose conservation protects many other species in the same habitat' },
  { question: 'What is the concept of flagship species?', options: ['A charismatic species used to promote conservation','A species at the top of the food chain','A species that is most abundant','A species that is rarest'], answer: 'A charismatic species used to promote conservation' },
  { question: 'What is the concept of ecosystem services?', options: ['Benefits that ecosystems provide to humans (e.g. clean water, pollination)','Services provided by conservation organisations','Services provided by governments','Services provided by farmers'], answer: 'Benefits that ecosystems provide to humans (e.g. clean water, pollination)' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the concept of metapopulation dynamics?', options: ['A network of local populations connected by dispersal','A single large population','A population with no dispersal','A population in a single habitat'], answer: 'A network of local populations connected by dispersal' },
  { question: 'What is the rescue effect in metapopulation theory?', options: ['Immigration from other patches reduces local extinction risk','Emigration reduces local population size','Isolation increases local population size','Dispersal has no effect on extinction risk'], answer: 'Immigration from other patches reduces local extinction risk' },
  { question: 'What is the concept of landscape ecology?', options: ['The study of spatial patterns and processes across landscapes','The study of individual habitats','The study of single species','The study of food webs'], answer: 'The study of spatial patterns and processes across landscapes' },
  { question: 'What is the concept of functional connectivity?', options: ['The degree to which a landscape facilitates movement of organisms','The physical connection between habitat patches','The number of corridors in a landscape','The size of habitat patches'], answer: 'The degree to which a landscape facilitates movement of organisms' },
  { question: 'What is the concept of source-sink dynamics?', options: ['Source habitats produce surplus individuals that maintain sink habitats','Sink habitats produce surplus individuals','Source and sink habitats are equal','All habitats are sources'], answer: 'Source habitats produce surplus individuals that maintain sink habitats' },
  { question: 'What is the concept of trophic downgrading?', options: ['The loss of apex predators causing cascading ecosystem changes','The loss of producers','The loss of decomposers','The loss of herbivores'], answer: 'The loss of apex predators causing cascading ecosystem changes' },
  { question: 'What is the concept of novel ecosystems?', options: ['Ecosystems with new species combinations not previously existing','Ecosystems that have never been disturbed','Ecosystems with only native species','Ecosystems with only invasive species'], answer: 'Ecosystems with new species combinations not previously existing' },
  { question: 'What is the concept of assisted migration?', options: ['Moving species to new areas to help them adapt to climate change','Moving species to zoos','Moving species to seed banks','Moving species to new continents'], answer: 'Moving species to new areas to help them adapt to climate change' },
  { question: 'What is the concept of de-extinction?', options: ['Using biotechnology to revive extinct species','Preventing species from going extinct','Conserving endangered species','Reintroducing locally extinct species'], answer: 'Using biotechnology to revive extinct species' },
  { question: 'What is the concept of planetary boundaries?', options: ['Safe operating limits for Earth\'s systems to maintain a stable environment','The physical boundaries of the Earth','The limits of human population growth','The limits of food production'], answer: 'Safe operating limits for Earth\'s systems to maintain a stable environment' },
  { question: 'What is the concept of the Anthropocene?', options: ['The current geological epoch defined by significant human impact on Earth','The epoch before humans','The epoch of the dinosaurs','The epoch of the ice ages'], answer: 'The current geological epoch defined by significant human impact on Earth' },
  { question: 'What is the concept of biophilia?', options: ['The innate human affinity for other living organisms','The study of biodiversity','The study of ecosystems','The study of evolution'], answer: 'The innate human affinity for other living organisms' },
];

export default function MicrohabitatsGame() {
  return (
    <>
      <Helmet>
        <title>Microhabitats — Sodafom</title>
        <meta name="description" content="Discover the tiny habitats where minibeasts live!" />
        <link rel="canonical" href="https://sodafom.uk/games/microhabitats" />
        <meta property="og:title" content="Microhabitats — Sodafom" />
        <meta property="og:description" content="Discover the tiny habitats where minibeasts live!" />
        <meta property="og:url" content="https://sodafom.uk/games/microhabitats" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Microhabitats — Science Game for Kids — Sodafom</h1>
      <GameShell title="Microhabitats" emoji="🐛" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="microhabitats"
            title="Microhabitats"
            emoji="🐛"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
