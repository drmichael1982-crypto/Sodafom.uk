import { expect, it } from "vitest";
import {
  listenForGameAnswer,
  normaliseVoiceAnswer,
  submitGameVoiceAnswer,
} from "./game-voice";
it("matches only the mounted active activity and retires its listener", () => {
  const stop = listenForGameAnswer("Number Planets", (text) =>
    normaliseVoiceAnswer(text) === "6" ? "Correct, six!" : undefined,
  );
  expect(submitGameVoiceAnswer("Other game", "six")).toBeUndefined();
  expect(submitGameVoiceAnswer("Number Planets", "The answer is six.")).toBe(
    "Correct, six!",
  );
  expect(
    submitGameVoiceAnswer("Number Planets", "Open a game"),
  ).toBeUndefined();
  stop();
  expect(submitGameVoiceAnswer("Number Planets", "six")).toBeUndefined();
});
