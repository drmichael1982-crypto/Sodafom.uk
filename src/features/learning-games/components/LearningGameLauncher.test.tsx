import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LearningGameLauncher } from "./LearningGameLauncher";

describe("LearningGameLauncher", () => {
  it("filters by subject and launches the selected game", async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(<LearningGameLauncher onLaunch={onLaunch} learnerAge={7} />);

    expect(
      screen.getByRole("button", { name: "Play Number Bonds to 10" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Play Word Family Match" }),
    ).toBeVisible();

    await user.click(screen.getByRole("button", { name: "maths" }));
    expect(
      screen.getByRole("button", { name: "Play Number Bonds to 10" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Play Word Family Match" }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Play Number Bonds to 10" }),
    );
    expect(onLaunch).toHaveBeenCalledWith(
      expect.objectContaining({ id: "number-bonds-to-10" }),
    );
  });

  it("has large semantic controls and an untimed description", () => {
    render(<LearningGameLauncher onLaunch={() => undefined} />);
    expect(
      screen.getByRole("heading", { name: "Learning games" }),
    ).toBeVisible();
    expect(screen.getAllByText(/No timer/i)).toHaveLength(2);
    expect(
      screen.getByRole("group", { name: "Choose a subject" }),
    ).toBeVisible();
  });
});
