import type { LearningGameDefinition } from "./types";

const standardAccessibility = {
  untimed: true,
  textEquivalent: true,
  supportsReducedMotion: true,
  supportsReadAloud: true,
} as const;

export const numberBondsGame: LearningGameDefinition = {
  id: "number-bonds-to-10",
  title: "Number Bonds to 10",
  summary: "Choose the number that completes each pair to make 10.",
  subject: "maths",
  ageRange: { min: 5, max: 8 },
  estimatedMinutes: 4,
  skills: ["addition", "number bonds", "mental maths"],
  accessibility: standardAccessibility,
  questions: [
    {
      id: "bond-7",
      prompt: "7 + what number makes 10?",
      answers: [
        { id: "2", label: "2" },
        { id: "3", label: "3" },
        { id: "4", label: "4" },
      ],
      correctAnswerId: "3",
      explanation: "7 and 3 are a number bond. Together they make 10.",
      skill: "number bonds",
    },
    {
      id: "bond-4",
      prompt: "4 + what number makes 10?",
      answers: [
        { id: "5", label: "5" },
        { id: "6", label: "6" },
        { id: "7", label: "7" },
      ],
      correctAnswerId: "6",
      explanation: "4 plus 6 equals 10.",
      skill: "number bonds",
    },
    {
      id: "bond-9",
      prompt: "9 + what number makes 10?",
      answers: [
        { id: "0", label: "0" },
        { id: "1", label: "1" },
        { id: "2", label: "2" },
      ],
      correctAnswerId: "1",
      explanation: "9 needs 1 more to make 10.",
      skill: "number bonds",
    },
  ],
};

export const wordFamiliesGame: LearningGameDefinition = {
  id: "word-family-match",
  title: "Word Family Match",
  summary: "Find the word that has the same ending sound.",
  subject: "english",
  ageRange: { min: 5, max: 8 },
  estimatedMinutes: 4,
  skills: ["phonics", "rhyming", "word recognition"],
  accessibility: standardAccessibility,
  questions: [
    {
      id: "family-cat",
      prompt: "Which word belongs with cat?",
      answers: [
        { id: "hat", label: "hat" },
        { id: "dog", label: "dog" },
        { id: "sun", label: "sun" },
      ],
      correctAnswerId: "hat",
      explanation: "Cat and hat both end with the “at” sound.",
      skill: "rhyming",
    },
    {
      id: "family-log",
      prompt: "Which word belongs with log?",
      answers: [
        { id: "fish", label: "fish" },
        { id: "frog", label: "frog" },
        { id: "tree", label: "tree" },
      ],
      correctAnswerId: "frog",
      explanation: "Log and frog both end with the “og” sound.",
      skill: "rhyming",
    },
    {
      id: "family-star",
      prompt: "Which word belongs with star?",
      answers: [
        { id: "car", label: "car" },
        { id: "cup", label: "cup" },
        { id: "bed", label: "bed" },
      ],
      correctAnswerId: "car",
      explanation: "Star and car share the “ar” ending sound.",
      skill: "phonics",
    },
  ],
};

export const learningGameCatalog = [numberBondsGame, wordFamiliesGame] as const;
