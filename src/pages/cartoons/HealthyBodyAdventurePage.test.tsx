import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HealthyBodyAdventurePage from "./HealthyBodyAdventurePage";
import {
  HEALTH_BODY_EPISODE,
  HEALTH_BODY_RUNTIME_SECONDS,
  validateHealthBodyEpisode,
} from "@/features/cartoons/healthBodyEpisode";

const voice = vi.hoisted(() => ({
  stopTts: vi.fn(),
  ttsSpeak: vi.fn(),
}));

vi.mock("@/lib/voice-context", () => voice);

function renderEpisode() {
  return render(
    <MemoryRouter>
      <HealthyBodyAdventurePage />
    </MemoryRouter>,
  );
}

describe("Archie’s Healthy Body Adventure", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    voice.stopTts.mockReset();
    voice.ttsSpeak.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("has a 5–7 minute, complete, general-education episode manifest", () => {
    expect(HEALTH_BODY_RUNTIME_SECONDS).toBe(372);
    expect(HEALTH_BODY_RUNTIME_SECONDS).toBeGreaterThanOrEqual(300);
    expect(HEALTH_BODY_RUNTIME_SECONDS).toBeLessThanOrEqual(420);
    expect(validateHealthBodyEpisode()).toEqual([]);
    expect(HEALTH_BODY_EPISODE.subtitlesDefault).toBe(true);
    expect(HEALTH_BODY_EPISODE.healthEducationOnly).toBe(true);
    expect(HEALTH_BODY_EPISODE.scenes).toHaveLength(28);
  });

  it("runs the complete timed cartoon from beginning to end", async () => {
    renderEpisode();
    expect(
      screen.getByText("The golden heart key lights up"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("episode-runtime")).toHaveTextContent(
      "About 6:12",
    );

    for (const scene of HEALTH_BODY_EPISODE.scenes) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(scene.durationSeconds * 1000);
      });
    }

    expect(screen.getByRole("status")).toHaveTextContent("Adventure complete");
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(voice.ttsSpeak).toHaveBeenCalledTimes(
      HEALTH_BODY_EPISODE.scenes.length,
    );
  });

  it("keeps subtitles on by default, gives kind feedback, and supports all controls", () => {
    renderEpisode();

    expect(screen.getByTestId("subtitle")).toHaveTextContent(
      "Welcome to Archie’s Healthy Body Adventure",
    );
    fireEvent.click(screen.getByRole("button", { name: /Subtitles on/i }));
    expect(screen.queryByTestId("subtitle")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Subtitles off/i }));
    expect(screen.getByTestId("subtitle")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Next/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Previous/i }));
    expect(
      screen.getByText("The golden heart key lights up"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Pause/i }));
    act(() => vi.advanceTimersByTime(20_000));
    expect(
      screen.getByText("The golden heart key lights up"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Play$/i }));
    fireEvent.click(screen.getByRole("button", { name: /Restart/i }));
    expect(
      screen.getByText("The golden heart key lights up"),
    ).toBeInTheDocument();

    for (let i = 0; i < 8; i += 1) {
      fireEvent.click(screen.getByRole("button", { name: /^Next/i }));
    }
    fireEvent.click(
      screen.getByRole("button", {
        name: "Choose a comfortable option at your own pace",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Great thinking");
  });

  it("supports sound control, a system-independent calm-motion setting, and responsive renders", () => {
    const originalWidth = window.innerWidth;

    for (const width of [375, 768, 1440]) {
      Object.defineProperty(window, "innerWidth", {
        configurable: true,
        value: width,
      });
      const view = renderEpisode();
      expect(
        screen.getByRole("heading", {
          name: "Archie’s Healthy Body Adventure",
        }),
      ).toBeInTheDocument();
      view.unmount();
    }
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalWidth,
    });

    renderEpisode();
    fireEvent.click(screen.getByRole("button", { name: /Sound on/i }));
    expect(screen.getByRole("button", { name: /Sound off/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    fireEvent.click(screen.getByRole("button", { name: /Calm motion off/i }));
    expect(
      screen.getByRole("button", { name: /Calm motion on/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen
        .getByText("Archie’s Healthy Body Adventure")
        .closest("section")
        ?.querySelector('[data-motion-mode="reduced"]'),
    ).toBeInTheDocument();
  });

  it("keeps all join-in challenges positive and non-medical", () => {
    const captions = HEALTH_BODY_EPISODE.scenes
      .map((scene) => scene.caption)
      .join(" ")
      .toLowerCase();
    expect(captions).not.toMatch(
      /diagnos|prescrib|medicine|treat(?:ment)?|cure/,
    );
    expect(
      HEALTH_BODY_EPISODE.scenes.filter((scene) => scene.challenge),
    ).toHaveLength(4);
    expect(
      HEALTH_BODY_EPISODE.scenes.filter((scene) => scene.choices),
    ).toHaveLength(4);
  });
});
