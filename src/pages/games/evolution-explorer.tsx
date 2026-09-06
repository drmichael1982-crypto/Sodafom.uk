import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Who proposed the theory of evolution by natural selection?', options: ['Charles Darwin','Isaac Newton','Albert Einstein','Gregor Mendel'], answer: 'Charles Darwin' },
  { question: 'What is natural selection?', options: ['Survival of the best-adapted organisms','Humans choosing which animals survive','Random changes in DNA','Animals choosing their mates'], answer: 'Survival of the best-adapted organisms' },
  { question: 'What is adaptation?', options: ['A feature that helps an organism survive','A change in behaviour','A type of reproduction','A type of food'], answer: 'A feature that helps an organism survive' },
  { question: 'What is a fossil?', options: ['Preserved remains of ancient organisms','A type of rock','A living organism','A type of mineral'], answer: 'Preserved remains of ancient organisms' },
  { question: 'What is a species?', options: ['A group of organisms that can breed together','A group of organisms that look similar','A group of organisms in the same habitat','A group of organisms that eat the same food'], answer: 'A group of organisms that can breed together' },
  { question: 'What is variation?', options: ['Differences between organisms of the same species','Similarities between organisms','Changes in the environment','Changes in behaviour'], answer: 'Differences between organisms of the same species' },
  { question: 'What is inheritance?', options: ['Passing traits from parents to offspring','Acquiring new traits during life','Changing traits due to environment','Losing traits over time'], answer: 'Passing traits from parents to offspring' },
  { question: 'What is extinction?', options: ['When all members of a species die out','When a species moves to a new area','When a species changes over time','When a species splits into two'], answer: 'When all members of a species die out' },
  { question: 'What is a mutation?', options: ['A change in DNA','A type of adaptation','A type of fossil','A type of variation'], answer: 'A change in DNA' },
  { question: 'What is selective breeding?', options: ['Humans choosing which organisms breed','Natural selection','Random breeding','Organisms choosing their mates'], answer: 'Humans choosing which organisms breed' },
  { question: 'What is a gene?', options: ['A section of DNA that codes for a trait','A type of cell','A type of protein','A type of chromosome'], answer: 'A section of DNA that codes for a trait' },
  { question: 'What is DNA?', options: ['The molecule that carries genetic information','A type of protein','A type of cell','A type of chromosome'], answer: 'The molecule that carries genetic information' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the name of Darwin\'s famous book?', options: ['On the Origin of Species','The Descent of Man','The Voyage of the Beagle','The Expression of Emotions'], answer: 'On the Origin of Species' },
  { question: 'What is the Galapagos Islands famous for?', options: ["Darwin's observations of finches","The discovery of DNA","The first fossil discovery","The first selective breeding experiment"], answer: "Darwin's observations of finches" },
  { question: 'What is convergent evolution?', options: ['Unrelated species developing similar traits','Related species developing different traits','A species splitting into two','Two species merging into one'], answer: 'Unrelated species developing similar traits' },
  { question: 'What is divergent evolution?', options: ['Related species developing different traits','Unrelated species developing similar traits','A species splitting into two','Two species merging into one'], answer: 'Related species developing different traits' },
  { question: 'What is a homologous structure?', options: ['Similar structures in different species from a common ancestor','Similar structures in unrelated species','Identical structures in different species','Different structures with the same function'], answer: 'Similar structures in different species from a common ancestor' },
  { question: 'What is an analogous structure?', options: ['Similar function but different origin','Similar origin but different function','Identical structures in different species','Different structures with different functions'], answer: 'Similar function but different origin' },
  { question: 'What is speciation?', options: ['The formation of new species','The extinction of a species','The adaptation of a species','The migration of a species'], answer: 'The formation of new species' },
  { question: 'What is genetic drift?', options: ['Random changes in allele frequency in a population','Natural selection acting on a population','Mutation in a population','Migration of a population'], answer: 'Random changes in allele frequency in a population' },
  { question: 'What is the Hardy-Weinberg principle?', options: ['Allele frequencies remain constant in the absence of evolution','Allele frequencies always change over time','Natural selection always acts on a population','Mutations always occur in a population'], answer: 'Allele frequencies remain constant in the absence of evolution' },
  { question: 'What is co-evolution?', options: ['Two species evolving together in response to each other','One species evolving in isolation','Two species evolving independently','A species evolving due to climate change'], answer: 'Two species evolving together in response to each other' },
  { question: 'What is an evolutionary bottleneck?', options: ['A drastic reduction in population size','A rapid increase in population size','A change in habitat','A change in diet'], answer: 'A drastic reduction in population size' },
  { question: 'What is the founder effect?', options: ['A small group founding a new population with limited genetic diversity','A large group founding a new population','A population losing genetic diversity over time','A population gaining genetic diversity over time'], answer: 'A small group founding a new population with limited genetic diversity' },
];
const L3: QuizQuestion[] = [
  { question: 'What is allopatric speciation?', options: ['Speciation due to geographic isolation','Speciation without geographic isolation','Speciation due to sexual selection','Speciation due to genetic drift'], answer: 'Speciation due to geographic isolation' },
  { question: 'What is sympatric speciation?', options: ['Speciation without geographic isolation','Speciation due to geographic isolation','Speciation due to climate change','Speciation due to mutation'], answer: 'Speciation without geographic isolation' },
  { question: 'What is sexual selection?', options: ['Selection based on traits that improve mating success','Selection based on survival','Selection based on food availability','Selection based on climate'], answer: 'Selection based on traits that improve mating success' },
  { question: 'What is kin selection?', options: ['Natural selection that favours traits benefiting relatives','Natural selection that favours individual survival','Natural selection based on food','Natural selection based on climate'], answer: 'Natural selection that favours traits benefiting relatives' },
  { question: 'What is altruism in evolutionary biology?', options: ['Behaviour that benefits others at a cost to oneself','Behaviour that benefits oneself','Behaviour that harms others','Behaviour that is neutral'], answer: 'Behaviour that benefits others at a cost to oneself' },
  { question: 'What is the Red Queen hypothesis?', options: ['Species must constantly evolve to keep up with co-evolving species','Species evolve only when the environment changes','Species evolve only due to mutation','Species evolve only due to genetic drift'], answer: 'Species must constantly evolve to keep up with co-evolving species' },
  { question: 'What is punctuated equilibrium?', options: ['Evolution occurs in rapid bursts separated by long stable periods','Evolution occurs at a constant rate','Evolution only occurs due to mass extinctions','Evolution only occurs in isolated populations'], answer: 'Evolution occurs in rapid bursts separated by long stable periods' },
  { question: 'What is phylogenetics?', options: ['The study of evolutionary relationships between organisms','The study of fossils','The study of genetics','The study of ecology'], answer: 'The study of evolutionary relationships between organisms' },
  { question: 'What is a cladogram?', options: ['A diagram showing evolutionary relationships based on shared characteristics','A diagram showing food chains','A diagram showing habitats','A diagram showing population sizes'], answer: 'A diagram showing evolutionary relationships based on shared characteristics' },
  { question: 'What is horizontal gene transfer?', options: ['Transfer of genes between organisms other than parent to offspring','Transfer of genes from parent to offspring','Transfer of genes between species','Transfer of genes within a species'], answer: 'Transfer of genes between organisms other than parent to offspring' },
  { question: 'What is an adaptive radiation?', options: ['Rapid evolution of many species from a common ancestor','Slow evolution of one species','Evolution due to radiation exposure','Evolution due to climate change'], answer: 'Rapid evolution of many species from a common ancestor' },
  { question: 'What is the molecular clock?', options: ['Using mutation rates to estimate when species diverged','A clock that measures evolution speed','A method to date fossils','A method to measure genetic diversity'], answer: 'Using mutation rates to estimate when species diverged' },
];
const L4: QuizQuestion[] = [
  { question: 'What is epigenetics?', options: ['Changes in gene expression without changes to DNA sequence','Changes to the DNA sequence','Changes to the chromosome number','Changes to the protein structure'], answer: 'Changes in gene expression without changes to DNA sequence' },
  { question: 'What is inclusive fitness?', options: ['An organism\'s direct fitness plus its effect on relatives\' fitness','An organism\'s direct reproductive success only','An organism\'s survival rate','An organism\'s mutation rate'], answer: 'An organism\'s direct fitness plus its effect on relatives\' fitness' },
  { question: 'What is the neutral theory of molecular evolution?', options: ['Most mutations are neutral and spread by genetic drift','Most mutations are harmful','Most mutations are beneficial','All mutations are selected for or against'], answer: 'Most mutations are neutral and spread by genetic drift' },
  { question: 'What is a selective sweep?', options: ['Rapid spread of a beneficial allele reducing nearby genetic diversity','Removal of harmful alleles','Random loss of alleles','Increase in genetic diversity'], answer: 'Rapid spread of a beneficial allele reducing nearby genetic diversity' },
  { question: 'What is balancing selection?', options: ['Selection that maintains multiple alleles in a population','Selection that removes all but one allele','Selection that increases mutation rate','Selection that decreases population size'], answer: 'Selection that maintains multiple alleles in a population' },
  { question: 'What is heterozygote advantage?', options: ['Heterozygotes have higher fitness than either homozygote','Homozygotes have higher fitness','Heterozygotes have lower fitness','All genotypes have equal fitness'], answer: 'Heterozygotes have higher fitness than either homozygote' },
  { question: 'What is sickle cell anaemia an example of?', options: ['Heterozygote advantage in malaria-endemic regions','A purely harmful mutation','A neutral mutation','A beneficial mutation in all environments'], answer: 'Heterozygote advantage in malaria-endemic regions' },
  { question: 'What is gene flow?', options: ['Movement of alleles between populations through migration','Random change in allele frequency','Selection acting on alleles','Mutation creating new alleles'], answer: 'Movement of alleles between populations through migration' },
  { question: 'What is a phylogenetic tree?', options: ['A branching diagram showing evolutionary history of species','A diagram of food chains','A diagram of habitats','A diagram of population growth'], answer: 'A branching diagram showing evolutionary history of species' },
  { question: 'What is the endosymbiotic theory?', options: ['Mitochondria and chloroplasts evolved from engulfed bacteria','Cells evolved from viruses','Eukaryotes evolved from archaea alone','Organelles formed spontaneously'], answer: 'Mitochondria and chloroplasts evolved from engulfed bacteria' },
  { question: 'What is convergent evolution an example of?', options: ['Wings of birds and bats','Forelimbs of humans and whales','Fins of fish and dolphins','All of these'], answer: 'Wings of birds and bats' },
  { question: 'What is the difference between microevolution and macroevolution?', options: ['Micro = changes within a species; macro = formation of new species','Micro = fast evolution; macro = slow evolution','Micro = genetic changes; macro = physical changes','Micro = individual changes; macro = population changes'], answer: 'Micro = changes within a species; macro = formation of new species' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the Price equation?', options: ['A mathematical description of natural selection and evolution','A formula for calculating mutation rates','A formula for calculating genetic drift','A formula for calculating gene flow'], answer: 'A mathematical description of natural selection and evolution' },
  { question: 'What is frequency-dependent selection?', options: ['Fitness of a genotype depends on its frequency in the population','Fitness depends on population size','Fitness depends on mutation rate','Fitness depends on gene flow'], answer: 'Fitness of a genotype depends on its frequency in the population' },
  { question: 'What is the concept of evolvability?', options: ['The capacity of a lineage to generate heritable variation','The rate of mutation','The rate of speciation','The rate of extinction'], answer: 'The capacity of a lineage to generate heritable variation' },
  { question: 'What is niche construction?', options: ['Organisms modifying their environment, which then affects their own evolution','Organisms occupying a new niche','Organisms competing for a niche','Organisms abandoning a niche'], answer: 'Organisms modifying their environment, which then affects their own evolution' },
  { question: 'What is the major transitions in evolution theory?', options: ['Key events where information transmission changed (e.g. origin of eukaryotes)','The main mass extinctions','The main speciation events','The main adaptive radiations'], answer: 'Key events where information transmission changed (e.g. origin of eukaryotes)' },
  { question: 'What is evo-devo?', options: ['The study of how developmental processes evolve','The study of evolution and development separately','The study of developmental genetics only','The study of embryology only'], answer: 'The study of how developmental processes evolve' },
  { question: 'What is a Hox gene?', options: ['A gene that controls body plan development along the head-to-tail axis','A gene that controls eye development','A gene that controls limb development only','A gene that controls colour'], answer: 'A gene that controls body plan development along the head-to-tail axis' },
  { question: 'What is the extended evolutionary synthesis?', options: ['An expansion of the modern synthesis including epigenetics, niche construction, etc.','The original Darwinian theory','The modern synthesis only','The neutral theory only'], answer: 'An expansion of the modern synthesis including epigenetics, niche construction, etc.' },
  { question: 'What is the concept of fitness landscape?', options: ['A metaphor mapping genotype to fitness showing peaks and valleys','A map of habitats','A map of population sizes','A map of mutation rates'], answer: 'A metaphor mapping genotype to fitness showing peaks and valleys' },
  { question: 'What is the Cambrian explosion?', options: ['A rapid diversification of animal body plans ~541 million years ago','The first appearance of life on Earth','The first mass extinction','The first appearance of plants'], answer: 'A rapid diversification of animal body plans ~541 million years ago' },
  { question: 'What is the concept of exaptation?', options: ['A trait evolved for one function being co-opted for another','A trait that has no function','A trait that reduces fitness','A trait that is neutral'], answer: 'A trait evolved for one function being co-opted for another' },
  { question: 'What is the modern synthesis?', options: ['The merging of Darwinian evolution with Mendelian genetics','Darwin\'s original theory','Mendel\'s original theory','The neutral theory'], answer: 'The merging of Darwinian evolution with Mendelian genetics' },
];

export default function EvolutionExplorerGame() {
  return (
    <>
      <Helmet>
        <title>Evolution Explorer — Sodafom</title>
        <meta name="description" content="Discover how life on Earth has evolved over millions of years!" />
        <link rel="canonical" href="https://sodafom.uk/games/evolution-explorer" />
        <meta property="og:title" content="Evolution Explorer — Sodafom" />
        <meta property="og:description" content="Discover how life on Earth has evolved over millions of years!" />
        <meta property="og:url" content="https://sodafom.uk/games/evolution-explorer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Evolution Explorer — Science Game for Kids — Sodafom</h1>
      <GameShell title="Evolution Explorer" emoji="🦕" subject="science" ageGroups={['9–11', '12–13']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="evolution-explorer"
            title="Evolution Explorer"
            emoji="🦕"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
