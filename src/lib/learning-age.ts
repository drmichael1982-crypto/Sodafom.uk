const AGE_KEY = 'sodafom_learning_age';

export type ActiveLearningProfile = { id: string; ageGroup: '5-7' | '8-10' | '11-13' | null };

export function getActiveLearningProfile(): ActiveLearningProfile | null {
  try {
    const parsed = JSON.parse(localStorage.getItem('sodafom_active_child') || 'null') as Record<string, unknown> | null;
    const id = typeof parsed?.id === 'number' || typeof parsed?.id === 'string' ? String(parsed.id).trim() : '';
    if (!id) return null;
    const ageGroup = parsed?.ageGroup === '5-7' || parsed?.ageGroup === '8-10' || parsed?.ageGroup === '11-13'
      ? parsed.ageGroup : null;
    return { id, ageGroup };
  } catch { return null; }
}

function learningAgeKey(profile = getActiveLearningProfile()): string {
  return profile ? `${AGE_KEY}:${encodeURIComponent(profile.id)}` : AGE_KEY;
}

/** Read an exact age saved for the active child, or the legacy guest age when no child is active. */
export function readLearningAge(): number | null {
  try {
    const raw = localStorage.getItem(learningAgeKey());
    const age = Number(raw);
    return raw && Number.isInteger(age) && age >= 5 && age <= 13 ? age : null;
  } catch { return null; }
}

/** Save an exact age only for the active child; profile-less previews retain the legacy key. */
export function saveLearningAge(age: number | null): boolean {
  try {
    const key = learningAgeKey();
    if (age === null) localStorage.removeItem(key);
    else if (Number.isInteger(age) && age >= 5 && age <= 13) localStorage.setItem(key, String(age));
    else return false;
    return true;
  } catch { return false; }
}

/** Resolve a teaching age without falling through to another child's unscoped settings. */
export function resolveLearningAge(): number | null {
  const exactAge = readLearningAge();
  if (exactAge !== null) return exactAge;
  const profile = getActiveLearningProfile();
  if (profile?.ageGroup === '5-7') return 6;
  if (profile?.ageGroup === '8-10') return 9;
  if (profile?.ageGroup === '11-13') return 12;
  return null;
}
×M:ã