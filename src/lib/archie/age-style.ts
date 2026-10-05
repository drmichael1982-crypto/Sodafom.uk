export type ArchieStage = "discoverer" | "explorer" | "navigator";
export function getArchieStage(year: number): ArchieStage {
  return year >= 7 ? "navigator" : year >= 4 ? "explorer" : "discoverer";
}
export function getArchieVoice(year: number) {
  const stage = getArchieStage(year);
  return stage === "discoverer"
    ? { rate: 0.88, pitch: 1.22 }
    : stage === "explorer"
      ? { rate: 0.96, pitch: 1.1 }
      : { rate: 1, pitch: 1 };
}
