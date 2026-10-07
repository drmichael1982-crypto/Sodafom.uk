/** Suggested games follow the selected practice year, without collecting a birth date. */
export function isGameForYear(year: number, ageGroups: readonly string[]): boolean {
  if (!Number.isInteger(year) || year < 1 || year > 9) return false;
  const practiceAge = year + 4;
  return ageGroups.some(group => {
    const match = group.trim().match(/^(\d+)\s*[–-]\s*(\d+)$/);
    if (!match) return false;
    return practiceAge >= Number(match[1]) && practiceAge <= Number(match[2]);
  });
}
