/** Suggested games follow the selected practice year, without collecting a birth date. */
function parseAgeRange(value: string): [number, number] | null {
  const match = value.trim().match(/^(\d+)\s*[–-]\s*(\d+)$/);
  if (!match) return null;
  const minimum = Number(match[1]);
  const maximum = Number(match[2]);
  return minimum <= maximum ? [minimum, maximum] : null;
}

/** Match a displayed age band to any overlapping range supported by a game. */
export function isGameForAgeBand(ageBand: string, ageGroups: readonly string[]): boolean {
  const selected = parseAgeRange(ageBand);
  if (!selected) return false;
  return ageGroups.some(group => {
    const gameRange = parseAgeRange(group);
    return gameRange !== null && selected[0] <= gameRange[1] && gameRange[0] <= selected[1];
  });
}

export function isGameForYear(year: number, ageGroups: readonly string[]): boolean {
  if (!Number.isInteger(year) || year < 1 || year > 9) return false;
  const practiceAge = year + 4;
  return ageGroups.some(group => {
    const gameRange = parseAgeRange(group);
    return gameRange !== null && practiceAge >= gameRange[0] && practiceAge <= gameRange[1];
  });
}
