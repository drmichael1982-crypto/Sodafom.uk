import { fireEvent, render, screen } from "@testing-library/react";
import { HelmetProvider } from "@dr.pogodin/react-helmet";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import BirthdayPartyRoomPage from "./BirthdayPartyRoomPage";

function renderPartyRoom() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <BirthdayPartyRoomPage />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe("BirthdayPartyRoomPage", () => {
  it("keeps the room local and provides labelled party controls", () => {
    renderPartyRoom();

    expect(
      screen.getByRole("heading", { name: "Birthday Party Room" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play music" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Party music volume" }),
    ).toHaveValue("0.45");
    expect(
      screen.getByText(
        /does not request a birthday date, name, photo, microphone, camera/i,
      ),
    ).toBeInTheDocument();
  });

  it("runs Balloon Pop, Make a Wish and Freeze Dance without a backend", () => {
    renderPartyRoom();

    for (let index = 1; index <= 6; index += 1) {
      fireEvent.click(
        screen.getByRole("button", { name: `Pop balloon ${index}` }),
      );
    }
    expect(screen.getByText("You popped them all!")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    expect(screen.getByText("6 balloons left.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Blow out candles" }));
    expect(
      screen.getByRole("button", { name: "Light candles again" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Great wish! The candles are out."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start dancing" }));
    expect(screen.getByRole("button", { name: "FREEZE!" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Dance, dance, dance! 🎵")).toBeInTheDocument();
  });

  it("keeps the volume control in range", () => {
    renderPartyRoom();
    const slider = screen.getByRole("slider", { name: "Party music volume" });

    fireEvent.change(slider, { target: { value: "0.75" } });
    expect(slider).toHaveValue("0.75");
  });

  it("keeps music optional when the browser cannot play Web Audio", () => {
    const audioContextDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "AudioContext",
    );
    const webkitAudioContextDescriptor = Object.getOwnPropertyDescriptor(
      window,
      "webkitAudioContext",
    );
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "webkitAudioContext", {
      configurable: true,
      value: undefined,
    });

    try {
      renderPartyRoom();
      fireEvent.click(screen.getByRole("button", { name: "Play music" }));
      expect(
        screen.getByText(/Party music is not available in this browser/i),
      ).toBeInTheDocument();
    } finally {
      if (audioContextDescriptor)
        Object.defineProperty(window, "AudioContext", audioContextDescriptor);
      else delete (window as Window & { AudioContext?: unknown }).AudioContext;
      if (webkitAudioContextDescriptor)
        Object.defineProperty(
          window,
          "webkitAudioContext",
          webkitAudioContextDescriptor,
        );
      else
        delete (window as Window & { webkitAudioContext?: unknown })
          .webkitAudioContext;
    }
  });
});
