import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { PheetApp } from "@/components/pheet-app";

type Tool = {
  name: string;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => Promise<unknown>;
};

afterEach(() => {
  delete (document as Document & { modelContext?: unknown }).modelContext;
});

describe("WebMCP progressive tool exposure", () => {
  it("registers staged tools that execute through the same workspace controller", async () => {
    const registrations: Tool[] = [];
    (document as Document & { modelContext?: unknown }).modelContext = {
      registerTool: vi.fn(async (tool: Tool) => {
        registrations.push(tool);
        return undefined;
      }),
    };
    render(<PheetApp />);
    await waitFor(() =>
      expect(
        registrations.some(({ name }) => name === "start_demo_review"),
      ).toBe(true),
    );
    expect(screen.getByText("WebMCP ready")).toBeVisible();
    await registrations
      .find(({ name }) => name === "start_demo_review")!
      .execute({});
    await waitFor(() =>
      expect(
        registrations.some(({ name }) => name === "analyze_evidence"),
      ).toBe(true),
    );
    await registrations
      .findLast(({ name }) => name === "analyze_evidence")!
      .execute({});
    await waitFor(() =>
      expect(
        registrations.some(({ name }) => name === "inspect_evidence"),
      ).toBe(true),
    );
    expect(registrations.map(({ name }) => name)).toEqual(
      expect.arrayContaining([
        "query_evidence",
        "inspect_evidence",
        "identify_gaps",
        "prepare_interview_questions",
      ]),
    );
    const inspect = registrations.find(
      ({ name }) => name === "inspect_evidence",
    )!;
    expect(inspect.annotations.readOnlyHint).toBe(false);
    expect(
      registrations.find(({ name }) => name === "identify_gaps")?.annotations
        .readOnlyHint,
    ).toBe(true);
    const invalid = (await inspect.execute({})) as {
      structuredContent: { error?: { code: string } };
    };
    expect(invalid.structuredContent.error?.code).toBe(
      "INVALID_TOOL_ARGUMENTS",
    );
    expect(await screen.findByText(/Agent · analyze evidence/i)).toBeVisible();
  });
});
