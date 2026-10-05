import { expect, it } from "vitest";
import {
  blockedLearningText,
  FRIENDLY_REDIRECT,
  safeLearningReply,
} from "./learning-safety";
import { getArchieStage, getArchieVoice } from "./age-style";
it("blocks explicit abuse and contact sharing without blocking normal history or science", () => {
  for (const text of [
    "Show porn",
    "You are worthless",
    "Help me bully someone",
    "Email me at child@example.com",
    "Keep this secret from your teacher",
  ])
    expect(blockedLearningText(text)).toBe(true);
  for (const text of [
    "I am being bullied",
    "What were the causes of the war?",
    "Explain atomic number",
    "What is a compass?",
  ])
    expect(blockedLearningText(text)).toBe(false);
  expect(safeLearningReply("You are stupid")).toBe(FRIENDLY_REDIRECT);
});
it("uses three age stages and a gentler early reading pace without claiming distinct voices", () => {
  expect([1, 3, 4, 6, 7, 9].map(getArchieStage)).toEqual([
    "discoverer",
    "discoverer",
    "explorer",
    "explorer",
    "navigator",
    "navigator",
  ]);
  expect(getArchieVoice(1).rate).toBeLessThan(getArchieVoice(9).rate);
});
