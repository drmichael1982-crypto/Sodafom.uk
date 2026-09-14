import { nextRound, shuffle } from './ten-question-round';
const ALL_COINS = [
  { label: '1p', value: 1, emoji: '🟤' },
  { label: '2p', value: 2, emoji: '🟤' },
  { label: '5p', value: 5, emoji: '⚪' },
  { label: '10p', value: 10, emoji: '⚪' },
  { label: '20p', value: 20, emoji: '🟡' },
  { label: '50p', value: 50, emoji: '🟡' },
  { label: '£1', value: 100, emoji: '🥇' },
  { label: '£2', value: 200, emoji: '🥇' },
];


export function coinRound(level: number) {
  const pool = level <= 1 ? ALL_COINS.slice(0, 3) : level <= 2 ? ALL_COINS.slice(0, 4) : level <= 3 ? ALL_COINS.slice(0, 5) : level <= 4 ? ALL_COINS.slice(0, 6) : ALL_COINS;
  const types = level <= 1 ? 2 : level <= 3 ? 3 : 4;
  const max = level <= 1 ? 3 : level <= 3 ? 4 : 5;
  const combinations: number[][] = [];
  function combine(indices: number[], next: number) {
    if (indices.length === types) { combinations.push(indices); return; }
    for (let i = next; i < pool.length; i++) combine([...indices, i], i + 1);
  }
  combine([], 0);
  const countVariants = max ** types;
  const ids = Array.from({ length: combinations.length * countVariants }, (_, i) => i);
  return nextRound(ids, String, `coins-${Math.min(5, level)}`).map(id => {
    let counts = id % countVariants;
    return combinations[Math.floor(id / countVariants)].map(index => {
      const count = counts % max + 1;
      counts = Math.floor(counts / max);
      return { coin: pool[index], count };
    });
  });
}
export function numberOptions(answer: number): number[] {
  const wrong = shuffle([...new Set([answer - 20, answer - 10, answer - 5, answer - 2, answer + 2, answer + 5, answer + 10, answer + 20])].filter(n => n >= 0 && n !== answer)).slice(0, 3);
  return shuffle([answer, ...wrong]);
}
export function numberBondRound(target: 10 | 20) {
  return nextRound(Array.from({length: target + 1}, (_, given) => ({target, given, answer: target - given, choices: numberOptions(target - given)})), q => String(q.given), `bonds-${target}`);
}
