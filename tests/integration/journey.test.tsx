import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PheetApp } from "@/components/pheet-app";

describe("prepared portfolio journey", () => {
  it("completes discovery through grounded questions in manual mode", async () => {
    const user = userEvent.setup();
    render(<PheetApp />);
    expect(
      await screen.findByRole("heading", { name: /see where the work fits/i }),
    ).toBeVisible();
    expect(screen.getByText(/WebMCP unsupported/i)).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: /start evidence review/i }),
    );
    await user.click(
      await screen.findByRole("button", {
        name: /analyze portfolio evidence/i,
      }),
    );
    expect(
      (
        await screen.findAllByText("Context Atlas", {
          selector: ".evidence-project",
        })
      )[0],
    ).toBeVisible();
    expect(screen.getAllByText(/source linked/i).length).toBeGreaterThan(0);
    await user.click(
      screen.getByRole("button", {
        name: /Context Atlas Partially demonstrated/i,
      }),
    );
    expect(
      screen.getByText("Context object schema", {
        selector: ".source-card span",
      }),
    ).toBeVisible();
    expect(
      screen.getByText(/Prepared source · untrusted content/i),
    ).toBeVisible();
    const prepare = screen.getByRole("button", {
      name: /create 3 grounded questions/i,
    });
    await waitFor(() => expect(prepare).toBeEnabled());
    await user.click(prepare);
    await waitFor(
      () => expect(screen.getAllByText(/Grounded in gap_/i)).toHaveLength(3),
      { timeout: 3_000 },
    );
    await user.click(screen.getAllByRole("button", { name: "Accept" })[0]);
    expect(
      await screen.findByText(/accepted/, { selector: "small" }),
    ).toBeVisible();
    expect(
      screen.getByText(/does not determine ability, rank candidates/i),
    ).toBeVisible();
  });
});
