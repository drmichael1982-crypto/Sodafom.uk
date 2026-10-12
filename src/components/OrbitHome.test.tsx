import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("@/lib/archie/storage", () => ({
  useArchieData: () => ({ settings: { year: 3 } }),
}));
vi.mock("@/contexts/ArchieContext", () => ({
  useArchieContext: () => ({ openArchie: vi.fn() }),
}));
vi.mock("@/lib/voice-context", () => ({ useVoice: () => ({ stop: vi.fn() }) }));
import OrbitHome from "./OrbitHome";
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  localStorage.clear();
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 390,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: 844,
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function show() {
  return render(
    <MemoryRouter>
      <OrbitHome autoStart />
    </MemoryRouter>,
  );
}
function solve() {
  for (let i = 1; i <= 9; i++) {
    fireEvent.click(
      screen.getByRole("button", { name: `Pick space picture piece ${i}` }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: `Place space picture piece ${i}` }),
    );
  }
}
it("cuts the whole scene into nine picture pieces and rejects a wrong join", () => {
  show();
  expect(
    screen
      .getByLabelText("Whole space picture puzzle spaces")
      .querySelectorAll("button"),
  ).toHaveLength(9);
  expect(document.querySelector(".whole-space-guide .orbit-model")).toHaveClass(
    "is-still",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Pick space picture piece 1" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Place space picture piece 2" }),
  );
  expect(screen.getByRole("status")).toHaveTextContent("do not join");
  expect(screen.getByText("0 / 9 picture pieces")).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Place space picture piece 1" }),
  );
  expect(
    screen.getByRole("button", { name: "Fitted space picture piece 1" }),
  ).toBeDisabled();
  expect(document.querySelectorAll("foreignObject")).toHaveLength(9);
});
it("animates the same complete picture without planet labels; pauses Moon and shooting stars together", () => {
  show();
  solve();
  expect(
    document.querySelector(".whole-space-reward .orbit-model"),
  ).toHaveClass("is-moving");
  expect(
    document.querySelectorAll(".whole-space-reward .home-orbit"),
  ).toHaveLength(8);
  expect(
    document.querySelectorAll(".whole-space-reward .home-moon"),
  ).toHaveLength(1);
  expect(
    document.querySelector(".whole-space-reward .home-planet-name"),
  ).toBeNull();
  expect(
    document.querySelector(".whole-space-reward .shooting-stars"),
  ).toHaveClass("stars-moving");
  fireEvent.click(screen.getByRole("button", { name: "Pause space scene" }));
  expect(
    document.querySelector(".whole-space-reward .orbit-model"),
  ).toHaveClass("is-still");
  expect(
    document.querySelector(".whole-space-reward .shooting-stars"),
  ).not.toHaveClass("stars-moving");
  fireEvent.click(screen.getByRole("button", { name: "Move space scene" }));
  expect(
    document.querySelector(".whole-space-reward .orbit-model"),
  ).toHaveClass("is-moving");
});
it("saves picture progress, keeps it when expanded, closes with Escape and restores focus", () => {
  const view = show();
  fireEvent.click(
    screen.getByRole("button", { name: "Pick space picture piece 1" }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Place space picture piece 1" }),
  );
  view.unmount();
  show();
  expect(screen.getByText("1 / 9 picture pieces")).toBeInTheDocument();
  const expand = screen.getByRole("button", { name: "Full screen" });
  expand.focus();
  fireEvent.click(expand);
  const dialog = screen.getByRole("dialog", {
    name: "Full-screen whole-picture space jigsaw",
  });
  expect(within(dialog).getByText("1 / 9 picture pieces")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Back to app" })).toHaveFocus();
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("button", { name: "Full screen" })).toHaveFocus();
});
it("honours reduced motion while retaining discovery and reset", () => {
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
  show();
  solve();
  expect(
    document.querySelector(".whole-space-reward .orbit-model"),
  ).toHaveClass("is-still");
  fireEvent.click(screen.getByText("Discover the planets"));
  fireEvent.change(screen.getByLabelText("Explore a planet"), {
    target: { value: "3" },
  });
  expect(
    screen.getByText("Mars is a rocky planet often called the Red Planet."),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Start the picture again" }),
  );
  expect(screen.getByText("0 / 9 picture pieces")).toBeInTheDocument();
  vi.restoreAllMocks();
});
