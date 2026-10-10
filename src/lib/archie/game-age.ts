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

/** Ages represented by an England school year within Sodafom's 5–13 range. */
export function schoolYearAgeRange(year: number): [number, number] | null {
  if (!Number.isInteger(year) || year < 1 || year > 9) return null;
  return [year + 4, Math.min(year + 5, 13)];
}

/** Short learner-facing label that never advertises an unsupported age. */
export function schoolYearAgeLabel(year: number): string {
  const range = schoolYearAgeRange(year);
  if (!range) return '';
  return range[0] === range[1] ? `age ${range[0]}` : `ages ${range[0]}–${range[1]}`;
}

export function isGameForYear(year: number, ageGroups: readonly string[]): boolean {
  // England school years normally span two ages because birthdays fall
  // throughout the academic year. Keep the public app's upper age at 13.
  const practiceRange = schoolYearAgeRange(year);
  if (!practiceRange) return false;
  return ageGroups.some(group => {
    const gameRange = parseAgeRange(group);
    return gameRange !== null && practiceRange[0] <= gameRange[1] && gameRange[0] <= practiceRange[1];
  });
}
