import { describe, expect, it } from "vitest";
import { learningGameCatalog } from "./catalog";

describe("reviewed game manifest catalogue", () => {
  it("has valid versions, unique IDs, scoring rules, and answer keys", () => {
    const gameIds = new Set<string>();

    for (const game of learningGameCatalog) {
      expect(gameIds.has(game.id)).toBe(false);
      gameIds.add(game.id);
      expect(game.version).toBeGreaterThan(0);
      expect(game.questionSource.contentVersion).toBeGreaterThan(0);
      expect(game.ageBands.length).toBeGreaterThan(0);
      expect(game.learningObjectiveCodes.length).toBeGreaterThan(0);
      expect(game.scoringRule).toEqual({
        kind: "count-correct",
        maximumScore: game.questions.length,
      });

      const questionIds = new Set<string>();
      for (const question of game.questions) {
        expect(questionIds.has(question.id)).toBe(false);
        questionIds.add(question.id);
        expect(question.answers.length).toBeGreaterThanOrEqual(2);
        expect(
          question.answers.filter(
            (answer) => answer.id === question.correctAnswerId,
          ),
        ).toHaveLength(1);
        expect(question.prompt.trim()).not.toBe("");
        expect(question.explanation.trim()).not.toBe("");
        expect(game.skillCodes).toContain(question.skillCode);
      }
    }
  });
});
