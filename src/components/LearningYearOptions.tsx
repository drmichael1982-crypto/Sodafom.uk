import { schoolYearAgeLabel } from '@/lib/archie/game-age';

export const MAIN_LEARNING_YEARS = [1, 2, 3, 4, 5, 6, 7] as const;
export const EXTENSION_LEARNING_YEARS = [8, 9] as const;
export const ALL_LEARNING_YEARS = [...MAIN_LEARNING_YEARS, ...EXTENSION_LEARNING_YEARS] as const;

export const LEARNING_YEAR_SCOPE_NOTE =
  "Archie's main pathway is ages 5–12. Year 8 can include age 12; choose Years 8–9 with a grown-up for optional older content.";

export function learningYearLabel(year: number) {
  const label = `Year ${year} · ${schoolYearAgeLabel(year)}`;
  return year >= 8 ? `${label} · optional extension` : label;
}

export default function LearningYearOptions() {
  return <>
    <optgroup label="Main pathway · ages 5–12">
      {MAIN_LEARNING_YEARS.map(year => <option key={year} value={year}>{learningYearLabel(year)}</option>)}
    </optgroup>
    <optgroup label="Optional older extensions">
      {EXTENSION_LEARNING_YEARS.map(year => <option key={year} value={year}>{learningYearLabel(year)}</option>)}
    </optgroup>
  </>;
}
