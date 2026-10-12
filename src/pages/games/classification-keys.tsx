import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Does a fish have legs?', options: ['No','Yes'], answer: 'No' },
  { question: 'Does a bird have feathers?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Does a mammal feed its young on milk?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Does a reptile have scales?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Does an insect have 6 legs?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Does a spider have 6 legs?', options: ['No','Yes'], answer: 'No' },
  { question: 'Does a plant make its own food?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Does a fungus make its own food?', options: ['No','Yes'], answer: 'No' },
  { question: 'Does a fish breathe with lungs?', options: ['No','Yes'], answer: 'No' },
  { question: 'Does a whale breathe with lungs?', options: ['Yes','No'], answer: 'Yes' },
  { question: 'Does a frog live only in water?', options: ['No','Yes'], answer: 'No' },
  { question: 'Does a snake have a backbone?', options: ['Yes','No'], answer: 'Yes' },
];
const L2: QuizQuestion[] = [
  { question: 'Which group do bats belong to?', options: ['Mammals','Birds','Reptiles','Insects'], answer: 'Mammals' },
  { question: 'Which group do frogs belong to?', options: ['Amphibians','Reptiles','Fish','Mammals'], answer: 'Amphibians' },
  { question: 'Which group do sharks belong to?', options: ['Fish','Mammals','Reptiles','Amphibians'], answer: 'Fish' },
  { question: 'Which group do butterflies belong to?', options: ['Insects','Arachnids','Crustaceans','Worms'], answer: 'Insects' },
  { question: 'Which group do spiders belong to?', options: ['Arachnids','Insects','Crustaceans','Worms'], answer: 'Arachnids' },
  { question: 'Which group do crabs belong to?', options: ['Crustaceans','Insects','Arachnids','Worms'], answer: 'Crustaceans' },
  { question: 'Which group do snakes belong to?', options: ['Reptiles','Amphibians','Mammals','Fish'], answer: 'Reptiles' },
  { question: 'Which group do penguins belong to?', options: ['Birds','Mammals','Fish','Reptiles'], answer: 'Birds' },
  { question: 'Which group do dolphins belong to?', options: ['Mammals','Fish','Reptiles','Amphibians'], answer: 'Mammals' },
  { question: 'Which group do mushrooms belong to?', options: ['Fungi','Plants','Animals','Bacteria'], answer: 'Fungi' },
  { question: 'Which group do oak trees belong to?', options: ['Plants','Fungi','Animals','Bacteria'], answer: 'Plants' },
  { question: 'Which group do earthworms belong to?', options: ['Worms','Insects','Arachnids','Crustaceans'], answer: 'Worms' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the five-kingdom classification system?', options: ['Animals, Plants, Fungi, Protists, Bacteria','Animals, Plants, Fungi, Viruses, Bacteria','Animals, Plants, Fungi, Algae, Bacteria','Animals, Plants, Fungi, Protists, Archaea'], answer: 'Animals, Plants, Fungi, Protists, Bacteria' },
  { question: 'What is the correct order of taxonomic ranks?', options: ['Kingdom, Phylum, Class, Order, Family, Genus, Species','Kingdom, Class, Phylum, Order, Family, Genus, Species','Kingdom, Phylum, Order, Class, Family, Genus, Species','Kingdom, Phylum, Class, Family, Order, Genus, Species'], answer: 'Kingdom, Phylum, Class, Order, Family, Genus, Species' },
  { question: 'What is the scientific name for humans?', options: ['Homo sapiens','Homo erectus','Homo habilis','Homo neanderthalensis'], answer: 'Homo sapiens' },
  { question: 'Which kingdom do bacteria belong to?', options: ['Prokaryota','Fungi','Protista','Animalia'], answer: 'Prokaryota' },
  { question: 'What is a dichotomous key used for?', options: ['Identifying organisms','Measuring organisms','Counting organisms','Naming organisms'], answer: 'Identifying organisms' },
  { question: 'Which phylum do insects belong to?', options: ['Arthropoda','Chordata','Mollusca','Annelida'], answer: 'Arthropoda' },
  { question: 'Which class do mammals belong to?', options: ['Mammalia','Aves','Reptilia','Amphibia'], answer: 'Mammalia' },
  { question: 'What do all vertebrates have in common?', options: ['A backbone','Feathers','Scales','Fur'], answer: 'A backbone' },
  { question: 'Which kingdom do amoeba belong to?', options: ['Protista','Fungi','Animalia','Bacteria'], answer: 'Protista' },
  { question: 'What is binomial nomenclature?', options: ['A two-part naming system for species','A one-part naming system','A three-part naming system','A four-part naming system'], answer: 'A two-part naming system for species' },
  { question: 'Which phylum do earthworms belong to?', options: ['Annelida','Arthropoda','Mollusca','Chordata'], answer: 'Annelida' },
  { question: 'Which class do birds belong to?', options: ['Aves','Mammalia','Reptilia','Amphibia'], answer: 'Aves' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'classification-keys',
  title: 'Classification Keys',
  emoji: '🔑',
  subject: 'science',
  ageGroups: ['9–11', '12–13'],
  description: 'Use classification keys to identify and sort living things!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
