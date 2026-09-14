import { numberOptions } from './maths-round-data';
export interface MoneyQ {
  question: string;
  visual: string; // emoji representation of coins/notes
  choices: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const MONEY_QUESTIONS: MoneyQ[] = [
  // Easy — counting coins
  { question: 'How much money is this?', visual: '1p + 1p + 1p + 1p + 1p', choices: ['5p', '4p', '6p', '3p'], answer: '5p', explanation: 'Five 1p coins = 5p', difficulty: 'easy' },
  { question: 'How much money is this?', visual: '10p + 5p + 2p', choices: ['17p', '15p', '12p', '20p'], answer: '17p', explanation: '10p + 5p + 2p = 17p', difficulty: 'easy' },
  { question: 'How much money is this?', visual: '50p + 20p + 10p', choices: ['80p', '70p', '90p', '75p'], answer: '80p', explanation: '50p + 20p + 10p = 80p', difficulty: 'easy' },
  { question: 'How much money is this?', visual: '£1 + 50p', choices: ['£1.50', '£1.05', '£2.00', '£1.25'], answer: '£1.50', explanation: '£1 + 50p = £1.50', difficulty: 'easy' },
  { question: 'How much money is this?', visual: '20p + 20p + 5p', choices: ['45p', '40p', '50p', '35p'], answer: '45p', explanation: '20p + 20p + 5p = 45p', difficulty: 'easy' },
  // Medium — making change
  { question: 'You buy a snack for 35p. You pay with 50p. How much change do you get?', visual: '50p → 35p', choices: ['15p', '25p', '10p', '20p'], answer: '15p', explanation: '50p − 35p = 15p change', difficulty: 'medium' },
  { question: 'A book costs £1.20. You pay with £2. How much change do you get?', visual: '£2 → £1.20', choices: ['80p', '60p', '90p', '70p'], answer: '80p', explanation: '£2.00 − £1.20 = 80p change', difficulty: 'medium' },
  { question: 'You buy a toy for £3.75. You pay with £5. How much change do you get?', visual: '£5 → £3.75', choices: ['£1.25', '£1.50', '£1.00', '£2.25'], answer: '£1.25', explanation: '£5.00 − £3.75 = £1.25 change', difficulty: 'medium' },
  { question: 'A drink costs 65p. You pay with £1. How much change do you get?', visual: '£1 → 65p', choices: ['35p', '45p', '25p', '40p'], answer: '35p', explanation: '£1.00 − 65p = 35p change', difficulty: 'medium' },
  { question: 'You have 3 × 20p coins. Can you buy something costing 55p?', visual: '20p + 20p + 20p = ?', choices: ['Yes, with 5p change', 'No, not enough', 'Yes, exact money', 'Yes, with 10p change'], answer: 'Yes, with 5p change', explanation: '3 × 20p = 60p. 60p − 55p = 5p change', difficulty: 'medium' },
  // Hard — totals and comparison
  { question: 'Which combination makes exactly £2.50?', visual: '£2.50 = ?', choices: ['£1 + £1 + 50p', '£1 + 50p + 50p', '£2 + 20p + 20p', '£1 + £1 + 20p + 20p'], answer: '£1 + £1 + 50p', explanation: '£1 + £1 + 50p = £2.50', difficulty: 'hard' },
  { question: 'A pencil costs 45p and a rubber costs 30p. How much do they cost together?', visual: '✏️ 45p + 🧹 30p', choices: ['75p', '65p', '80p', '70p'], answer: '75p', explanation: '45p + 30p = 75p', difficulty: 'hard' },
  { question: 'You have £5. You spend £2.60 on lunch and 85p on a drink. How much is left?', visual: '£5 − £2.60 − 85p', choices: ['£1.55', '£1.45', '£1.65', '£2.55'], answer: '£1.55', explanation: '£2.60 + 85p = £3.45. £5.00 − £3.45 = £1.55', difficulty: 'hard' },
  { question: 'Three friends each have £1.50. How much do they have altogether?', visual: '£1.50 × 3', choices: ['£4.50', '£3.50', '£4.00', '£5.00'], answer: '£4.50', explanation: '£1.50 × 3 = £4.50', difficulty: 'hard' },
  { question: 'A bag of crisps costs 60p. How many can you buy with £3?', visual: '£3 ÷ 60p', choices: ['5', '4', '6', '3'], answer: '5', explanation: '£3.00 ÷ 60p = 5 bags', difficulty: 'hard' },
];




const money = (pence: number) => pence >= 100 ? `£${(pence / 100).toFixed(2)}` : `${pence}p`;
for (let i = 1; i <= 20; i++) {
  const coins = [10, 5, ...Array.from({length: i % 5 + 1}, () => 2), ...Array.from({length: Math.floor((i - 1) / 5) + 1}, () => 1)];
  const amount = coins.reduce((sum, coin) => sum + coin, 0);
  const visual = coins.map(money).join(' + ');
  MONEY_QUESTIONS.push({question: 'How much money is this?', visual, choices: numberOptions(amount).map(money), answer: money(amount), explanation: `${visual} = ${money(amount)}`, difficulty: 'easy'});
  const price = 25 + i * 7;
  const change = 200 - price;
  MONEY_QUESTIONS.push({question: `A notebook costs ${money(price)}. You pay £2. How much change?`, visual: `£2 − ${money(price)}`, choices: numberOptions(change).map(money), answer: money(change), explanation: `£2 minus ${money(price)} is ${money(change)}.`, difficulty: 'medium'});
  const first = 130 + i * 5, second = 40 + i * 3, left = 500 - first - second;
  MONEY_QUESTIONS.push({question: `You have £5 and spend ${money(first)} and ${money(second)}. How much is left?`, visual: `£5 − ${money(first)} − ${money(second)}`, choices: numberOptions(left).map(money), answer: money(left), explanation: `£5 minus ${money(first + second)} is ${money(left)}.`, difficulty: 'hard'});
}
