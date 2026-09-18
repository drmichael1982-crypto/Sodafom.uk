import type { LearningGameDefinition } from "./types";

export const GAME_DESTINATION_ID = "games" as const;
export const GAME_INTERACTION_IDS = [
  "open_game_picker",
  "open_assigned_game",
] as const;

export type GameInteractionId = (typeof GAME_INTERACTION_IDS)[number];
export type GameReturnDestinationId =
  "home" | "learning-hub" | "world-games-area";

/**
 * Presentation-neutral route request for the normal 2D games feature.
 * A future 3D scene may emit this object, but cannot provide a raw URL,
 * callback, role, entitlement, progress, AI tool, or admin capability.
 */
export interface GameEntryRequest {
  destinationId: typeof GAME_DESTINATION_ID;
  interactionId: GameInteractionId;
  source: "2d-menu" | "assignment" | "world-portal";
  gameId?: string;
  returnDestinationId: GameReturnDestinationId;
}

export interface ResolvedGameEntry {
  screen: "launcher" | "game";
  game: LearningGameDefinition | null;
  returnDestinationId: GameReturnDestinationId;
}

export function resolveGameEntry(
  request: GameEntryRequest,
  games: readonly LearningGameDefinition[],
): ResolvedGameEntry {
  if (request.destinationId !== GAME_DESTINATION_ID) {
    throw new Error("Unknown child-safe destination.");
  }

  if (!GAME_INTERACTION_IDS.includes(request.interactionId)) {
    throw new Error("Unknown child-safe game interaction.");
  }

  if (!request.gameId) {
    if (request.interactionId !== "open_game_picker") {
      throw new Error("An assigned game interaction requires a game ID.");
    }
    return {
      screen: "launcher",
      game: null,
      returnDestinationId: request.returnDestinationId,
    };
  }

  const game = games.find((candidate) => candidate.id === request.gameId);
  if (!game) {
    throw new Error("Requested game is not in the reviewed catalogue.");
  }

  return {
    screen: "game",
    game,
    returnDestinationId: request.returnDestinationId,
  };
}
