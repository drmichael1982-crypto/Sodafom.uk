// ── Types ─────────────────────────────────────────────────────────────────────
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Fraction {
  label: string;
  numerator: number;
  denominator: number;
  slices: number;
  fill: number;
  description?: string;
}

// ── Fraction sets by difficulty ───────────────────────────────────────────────
const FRACTIONS_EASY: Fraction[] = [
  { label: '0/2', numerator: 0, denominator: 2, slices: 2, fill: 0, description: 'zero halves' },
  { label: '2/2', numerator: 2, denominator: 2, slices: 2, fill: 2, description: 'two halves: one whole' },
  { label: '3/3', numerator: 3, denominator: 3, slices: 3, fill: 3, description: 'three thirds: one whole' },
  { label: '4/4', numerator: 4, denominator: 4, slices: 4, fill: 4, description: 'four quarters: one whole' },
  { label: '½',  numerator: 1, denominator: 2, slices: 2, fill: 1, description: 'one half' },
  { label: '¼',  numerator: 1, denominator: 4, slices: 4, fill: 1, description: 'one quarter' },
  { label: '¾',  numerator: 3, denominator: 4, slices: 4, fill: 3, description: 'three quarters' },
  { label: '⅓',  numerator: 1, denominator: 3, slices: 3, fill: 1, description: 'one third' },
  { label: '⅔',  numerator: 2, denominator: 3, slices: 3, fill: 2, description: 'two thirds' },
  { label: '2/4', numerator: 2, denominator: 4, slices: 4, fill: 2, description: 'two quarters' },
];

const FRACTIONS_MEDIUM: Fraction[] = [
  { label: '⅛',  numerator: 1, denominator: 8, slices: 8, fill: 1 },
  { label: '⅜',  numerator: 3, denominator: 8, slices: 8, fill: 3 },
  { label: '⅝',  numerator: 5, denominator: 8, slices: 8, fill: 5 },
  { label: '⅞',  numerator: 7, denominator: 8, slices: 8, fill: 7 },
  { label: '2/6', numerator: 2, denominator: 6, slices: 6, fill: 2 },
  { label: '4/6', numerator: 4, denominator: 6, slices: 6, fill: 4 },
  { label: '5/6', numerator: 5, denominator: 6, slices: 6, fill: 5 },
  { label: '3/5', numerator: 3, denominator: 5, slices: 5, fill: 3 },
  { label: '2/5', numerator: 2, denominator: 5, slices: 5, fill: 2 },
  { label: '4/5', numerator: 4, denominator: 5, slices: 5, fill: 4 },
];

const FRACTIONS_HARD: Fraction[] = [
  { label: '3/9',  numerator: 3, denominator: 9, slices: 9, fill: 3 },
  { label: '6/9',  numerator: 6, denominator: 9, slices: 9, fill: 6 },
  { label: '7/9',  numerator: 7, denominator: 9, slices: 9, fill: 7 },
  { label: '2/10', numerator: 2, denominator: 10, slices: 10, fill: 2 },
  { label: '4/10', numerator: 4, denominator: 10, slices: 10, fill: 4 },
  { label: '7/10', numerator: 7, denominator: 10, slices: 10, fill: 7 },
  { label: '9/10', numerator: 9, denominator: 10, slices: 10, fill: 9 },
  { label: '5/12', numerator: 5, denominator: 12, slices: 12, fill: 5 },
  { label: '7/12', numerator: 7, denominator: 12, slices: 12, fill: 7 },
  { label: '11/12', numerator: 11, denominator: 12, slices: 12, fill: 11 },
];

export const FRACTION_SETS: Record<Difficulty, Fraction[]> = {
  'Easy':   FRACTIONS_EASY,
  'Medium': FRACTIONS_MEDIUM,
  'Hard':   FRACTIONS_HARD,
};
