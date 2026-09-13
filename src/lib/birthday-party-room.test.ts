import { describe, expect, it } from "vitest";
import {
  clampPartyVolume,
  DEFAULT_PARTY_VOLUME,
  partyBalloonsRemaining,
  togglePartyBalloon,
} from "./birthday-party-room";

describe("birthday party room helpers", () => {
  it("keeps the party volume inside the accessible browser range", () => {
    expect(clampPartyVolume(-0.2)).toBe(0);
    expect(clampPartyVolume(0.75)).toBe(0.75);
    expect(clampPartyVolume(1.4)).toBe(1);
    expect(clampPartyVolume(Number.NaN)).toBe(DEFAULT_PARTY_VOLUME);
  });

  it("counts and resets only valid balloon interactions", () => {
    const first = togglePartyBalloon(new Set(), 0);
    const complete = [1, 2, 3, 4, 5].reduce(
      (popped, index) => togglePartyBalloon(popped, index),
      first,
    );

    expect(partyBalloonsRemaining(first)).toBe(5);
    expect(partyBalloonsRemaining(complete)).toBe(0);
    expect(togglePartyBalloon(complete, 6)).toEqual(complete);
    expect(togglePartyBalloon(complete, 0)).toEqual(complete);
  });
});
