import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What is a producer in a food chain?', options: ['A plant that makes its own food','An animal that eats plants','An animal that eats other animals','A decomposer'], answer: 'A plant that makes its own food' },
  { question: 'What is a consumer in a food chain?', options: ['An animal that eats other organisms','A plant that makes its own food','A decomposer','A bacterium'], answer: 'An animal that eats other organisms' },
  { question: 'What is a herbivore?', options: ['An animal that eats only plants','An animal that eats only meat','An animal that eats both plants and meat','A plant'], answer: 'An animal that eats only plants' },
  { question: 'What is a carnivore?', options: ['An animal that eats only meat','An animal that eats only plants','An animal that eats both plants and meat','A plant'], answer: 'An animal that eats only meat' },
  { question: 'What is an omnivore?', options: ['An animal that eats both plants and meat','An animal that eats only plants','An animal that eats only meat','A plant'], answer: 'An animal that eats both plants and meat' },
  { question: 'In the food chain: grass → rabbit → fox, what is the grass?', options: ['Producer','Primary consumer','Secondary consumer','Decomposer'], answer: 'Producer' },
  { question: 'In the food chain: grass → rabbit → fox, what is the rabbit?', options: ['Primary consumer','Producer','Secondary consumer','Decomposer'], answer: 'Primary consumer' },
  { question: 'In the food chain: grass → rabbit → fox, what is the fox?', options: ['Secondary consumer','Producer','Primary consumer','Decomposer'], answer: 'Secondary consumer' },
  { question: 'What is a predator?', options: ['An animal that hunts other animals','An animal that is hunted','A plant','A decomposer'], answer: 'An animal that hunts other animals' },
  { question: 'What is prey?', options: ['An animal that is hunted','An animal that hunts other animals','A plant','A decomposer'], answer: 'An animal that is hunted' },
  { question: 'What is a decomposer?', options: ['An organism that breaks down dead matter','A plant that makes its own food','An animal that eats plants','An animal that eats other animals'], answer: 'An organism that breaks down dead matter' },
  { question: 'Where does energy in a food chain originally come from?', options: ['The Sun','The soil','The water','The air'], answer: 'The Sun' },
];
const L2: QuizQuestion[] = [
  { question: 'What is a food web?', options: ['Multiple interconnected food chains','A single food chain','A type of habitat','A type of ecosystem'], answer: 'Multiple interconnected food chains' },
  { question: 'What happens to energy as it moves up a food chain?', options: ['It decreases','It increases','It stays the same','It doubles'], answer: 'It decreases' },
  { question: 'What percentage of energy is typically passed from one trophic level to the next?', options: ['10%','50%','25%','90%'], answer: '10%' },
  { question: 'What is a trophic level?', options: ['A position in a food chain','A type of organism','A type of habitat','A type of ecosystem'], answer: 'A position in a food chain' },
  { question: 'What is biomass?', options: ['The total mass of living organisms in an area','The total energy in an ecosystem','The total number of organisms in an area','The total area of a habitat'], answer: 'The total mass of living organisms in an area' },
  { question: 'What is a pyramid of numbers?', options: ['A diagram showing the number of organisms at each trophic level','A diagram showing the energy at each trophic level','A diagram showing the biomass at each trophic level','A diagram showing the habitat of each organism'], answer: 'A diagram showing the number of organisms at each trophic level' },
  { question: 'What is a pyramid of biomass?', options: ['A diagram showing the biomass at each trophic level','A diagram showing the number of organisms at each trophic level','A diagram showing the energy at each trophic level','A diagram showing the habitat of each organism'], answer: 'A diagram showing the biomass at each trophic level' },
  { question: 'What is a keystone species?', options: ['A species that has a disproportionately large effect on its ecosystem','A species at the top of the food chain','A species at the bottom of the food chain','A species that is endangered'], answer: 'A species that has a disproportionately large effect on its ecosystem' },
  { question: 'What is bioaccumulation?', options: ['The build-up of toxins in organisms higher up the food chain','The build-up of nutrients in soil','The build-up of energy in organisms','The build-up of biomass in an ecosystem'], answer: 'The build-up of toxins in organisms higher up the food chain' },
  { question: 'What is a niche?', options: ["An organism's role in its ecosystem","An organism's habitat","An organism's diet","An organism's predator"], answer: "An organism's role in its ecosystem" },
  { question: 'What is competition in ecology?', options: ['Organisms competing for the same resources','Organisms helping each other','Organisms eating each other','Organisms living in the same habitat'], answer: 'Organisms competing for the same resources' },
  { question: 'What is mutualism?', options: ['A relationship where both species benefit','A relationship where one species benefits and the other is harmed','A relationship where one species benefits and the other is unaffected','A relationship where both species are harmed'], answer: 'A relationship where both species benefit' },
];
const L3: QuizQuestion[] = [
  { question: 'What is parasitism?', options: ['One species benefits, the other is harmed','Both species benefit','One species benefits, the other is unaffected','Both species are harmed'], answer: 'One species benefits, the other is harmed' },
  { question: 'What is commensalism?', options: ['One species benefits, the other is unaffected','Both species benefit','One species benefits, the other is harmed','Both species are harmed'], answer: 'One species benefits, the other is unaffected' },
  { question: 'What is an apex predator?', options: ['A predator at the top of the food chain with no natural predators','A predator that eats only plants','A predator that is also prey','A predator that is endangered'], answer: 'A predator at the top of the food chain with no natural predators' },
  { question: 'What is carrying capacity?', options: ['The maximum population size an environment can sustain','The minimum population size for survival','The average population size','The rate of population growth'], answer: 'The maximum population size an environment can sustain' },
  { question: 'What is a limiting factor?', options: ['A factor that restricts population growth','A factor that promotes population growth','A factor that has no effect on population','A factor that causes extinction'], answer: 'A factor that restricts population growth' },
  { question: 'What is interspecific competition?', options: ['Competition between different species','Competition within the same species','Competition for mates','Competition for territory'], answer: 'Competition between different species' },
  { question: 'What is intraspecific competition?', options: ['Competition within the same species','Competition between different species','Competition for food only','Competition for water only'], answer: 'Competition within the same species' },
  { question: 'What is the competitive exclusion principle?', options: ['Two species competing for the same niche cannot coexist','Two species can always coexist','Competition always leads to extinction','Competition always leads to adaptation'], answer: 'Two species competing for the same niche cannot coexist' },
  { question: 'What is resource partitioning?', options: ['Species dividing resources to reduce competition','Species sharing all resources equally','Species competing for all resources','Species ignoring each other'], answer: 'Species dividing resources to reduce competition' },
  { question: 'What is a trophic cascade?', options: ['Changes at one trophic level affecting other levels','Energy flowing up a food chain','Biomass decreasing up a food chain','Toxins accumulating up a food chain'], answer: 'Changes at one trophic level affecting other levels' },
  { question: 'What is the 10% rule in energy transfer?', options: ['Only 10% of energy passes to the next trophic level','10% of organisms survive to the next level','10% of biomass is lost at each level','10% of toxins accumulate at each level'], answer: 'Only 10% of energy passes to the next trophic level' },
  { question: 'What is an invasive species?', options: ['A non-native species that harms the ecosystem','A native species that is endangered','A species that has gone extinct','A species that is a keystone species'], answer: 'A non-native species that harms the ecosystem' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the Lotka-Volterra model?', options: ['A mathematical model of predator-prey population cycles','A model of food web complexity','A model of energy transfer','A model of nutrient cycling'], answer: 'A mathematical model of predator-prey population cycles' },
  { question: 'What is succession in ecology?', options: ['The gradual change in species composition of an ecosystem over time','The sudden change in an ecosystem','The extinction of species','The invasion of new species'], answer: 'The gradual change in species composition of an ecosystem over time' },
  { question: 'What is primary succession?', options: ['Succession starting on bare rock with no soil','Succession starting on existing soil','Succession after a forest fire','Succession after flooding'], answer: 'Succession starting on bare rock with no soil' },
  { question: 'What is a climax community?', options: ['The stable final community in succession','The first community in succession','A community after a disturbance','A community of only producers'], answer: 'The stable final community in succession' },
  { question: 'What is the nitrogen cycle?', options: ['The cycling of nitrogen through the ecosystem','The cycling of carbon through the ecosystem','The cycling of water through the ecosystem','The cycling of oxygen through the ecosystem'], answer: 'The cycling of nitrogen through the ecosystem' },
  { question: 'What is nitrogen fixation?', options: ['Converting atmospheric nitrogen into usable compounds','Converting nitrates into nitrogen gas','Converting ammonia into nitrates','Converting nitrites into nitrates'], answer: 'Converting atmospheric nitrogen into usable compounds' },
  { question: 'What is denitrification?', options: ['Converting nitrates back into nitrogen gas','Converting nitrogen gas into ammonia','Converting ammonia into nitrates','Converting nitrites into nitrates'], answer: 'Converting nitrates back into nitrogen gas' },
  { question: 'What is the carbon cycle?', options: ['The cycling of carbon through living and non-living systems','The cycling of nitrogen','The cycling of water','The cycling of oxygen'], answer: 'The cycling of carbon through living and non-living systems' },
  { question: 'What is eutrophication?', options: ['Excess nutrients causing algal blooms and oxygen depletion','Excess predators reducing prey','Excess decomposers in soil','Excess producers in an ecosystem'], answer: 'Excess nutrients causing algal blooms and oxygen depletion' },
  { question: 'What is biomagnification?', options: ['Increasing concentration of toxins at higher trophic levels','Increasing biomass at higher trophic levels','Increasing energy at higher trophic levels','Increasing number of species at higher trophic levels'], answer: 'Increasing concentration of toxins at higher trophic levels' },
  { question: 'What is island biogeography theory?', options: ['Species richness on islands depends on area and distance from mainland','Species richness depends only on island size','Species richness depends only on distance from mainland','Species richness is random'], answer: 'Species richness on islands depends on area and distance from mainland' },
  { question: 'What is a biome?', options: ['A large region with a characteristic climate and community of organisms','A small habitat','A type of ecosystem','A type of food web'], answer: 'A large region with a characteristic climate and community of organisms' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the intermediate disturbance hypothesis?', options: ['Moderate disturbance maximises species diversity','No disturbance maximises diversity','Maximum disturbance maximises diversity','Disturbance always reduces diversity'], answer: 'Moderate disturbance maximises species diversity' },
  { question: 'What is metacommunity theory?', options: ['Communities linked by dispersal of multiple species','A single isolated community','A community with no dispersal','A community with maximum diversity'], answer: 'Communities linked by dispersal of multiple species' },
  { question: 'What is the species-area relationship?', options: ['Larger areas support more species (S = cA^z)','Smaller areas support more species','Area has no effect on species number','Species number is constant regardless of area'], answer: 'Larger areas support more species (S = cA^z)' },
  { question: 'What is a guild in ecology?', options: ['A group of species exploiting the same resources in similar ways','A group of species in the same food chain','A group of species in the same habitat','A group of species with the same predator'], answer: 'A group of species exploiting the same resources in similar ways' },
  { question: 'What is the paradox of the plankton?', options: ['Many plankton species coexist despite competing for the same resources','Plankton have no predators','Plankton produce more oxygen than expected','Plankton are found in all ecosystems'], answer: 'Many plankton species coexist despite competing for the same resources' },
  { question: 'What is ecosystem resilience?', options: ['The ability of an ecosystem to recover after disturbance','The ability of an ecosystem to resist disturbance','The stability of an ecosystem','The diversity of an ecosystem'], answer: 'The ability of an ecosystem to recover after disturbance' },
  { question: 'What is ecosystem resistance?', options: ['The ability of an ecosystem to resist change','The ability to recover after disturbance','The stability of species populations','The diversity of food webs'], answer: 'The ability of an ecosystem to resist change' },
  { question: 'What is the concept of ecological stoichiometry?', options: ['The study of ratios of elements in organisms and ecosystems','The study of energy flow','The study of nutrient cycling','The study of population dynamics'], answer: 'The study of ratios of elements in organisms and ecosystems' },
  { question: 'What is a regime shift in ecology?', options: ['An abrupt change to a different stable state in an ecosystem','A gradual change in species composition','A seasonal change in an ecosystem','A change in a single species population'], answer: 'An abrupt change to a different stable state in an ecosystem' },
  { question: 'What is the concept of functional diversity?', options: ['The variety of functional traits in a community','The number of species in a community','The biomass of a community','The energy flow in a community'], answer: 'The variety of functional traits in a community' },
  { question: 'What is the green world hypothesis?', options: ['Carnivores keep herbivore populations in check, leaving plants abundant','Plants outcompete herbivores','Herbivores control plant populations','Decomposers control plant populations'], answer: 'Carnivores keep herbivore populations in check, leaving plants abundant' },
  { question: 'What is the concept of ecological redundancy?', options: ['Multiple species performing the same ecological function','No species performing the same function','All species being equally important','Species having no ecological role'], answer: 'Multiple species performing the same ecological function' },
];

export default function FoodChainsGame() {
  return (
    <>
      <Helmet>
        <title>Food Chains — Sodafom</title>
        <meta name="description" content="Learn about food chains, predators, and prey in nature!" />
        <link rel="canonical" href="https://sodafom.uk/games/food-chains" />
        <meta property="og:title" content="Food Chains — Sodafom" />
        <meta property="og:description" content="Learn about food chains, predators, and prey in nature!" />
        <meta property="og:url" content="https://sodafom.uk/games/food-chains" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Food Chains — Science Game for Kids — Sodafom</h1>
      <GameShell title="Food Chains" emoji="🌿" subject="science" ageGroups={['7–9', '9–11']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="food-chains"
            title="Food Chains"
            emoji="🌿"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
