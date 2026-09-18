import { describe, expect, it } from "vitest";
import { learningGameCatalog, numberBondsGame } from "./catalog";
import { resolveGameEntry, type GameEntryRequest } from "./navigation";

describe("game navigation adapter", () => {
  it("opens the 2D launcher from a future world portal", () => {
    expect(
      resolveGameEntry(
        {
          destinationId: "games",
          interactionId: "open_game_picker",
          source: "world-portal",
          returnDestinationId: "world-games-area",
        },
        learningGameCatalog,
      ),
    ).toEqual({
      screen: "launcher",
      game: null,
      returnDestinationId: "world-games-area",
    });
  });

  it("opens only a reviewed game ID and rejects arbitrary destinations", () => {
    expect(
      resolveGameEntry(
        {
          destinationId: "games",
          interactionId: "open_assigned_game",
          source: "assignment",
          gameId: numberBondsGame.id,
          returnDestinationId: "learning-hub",
        },
        learningGameCatalog,
      ).game,
    ).toBe(numberBondsGame);

    expect(() =>
      resolveGameEntry(
        {
          destinationId: "games",
          interactionId: "open_assigned_game",
          source: "world-portal",
          gameId: "/admin/brain",
          returnDestinationId: "world-games-area",
        },
        learningGameCatalog,
      ),
    ).toThrow(/reviewed catalogue/i);

    const forgedRequest = {
      destinationId: "admin",
      interactionId: "open_game_picker",
      source: "world-portal",
      returnDestinationId: "world-games-area",
    } as unknown as GameEntryRequest;
    expect(() => resolveGameEntry(forgedRequest, learningGameCatalog)).toThrow(
      /unknown child-safe destination/i,
    );
  });
});
