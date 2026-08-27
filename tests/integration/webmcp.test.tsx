import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { PheetApp } from "@/components/pheet-app";

type Tool = {
  name: string;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => Promise<unknown>;
};

type Registration = {
  tool: Tool;
  signal?: AbortSignal;
};

afterEach(() => {
  delete (document as Document & { modelContext?: unknown }).modelContext;
});

describe("WebMCP progressive tool exposure", () => {
  it("registers staged tools that execute through the same workspace controller", async () => {
    const registrations: Registration[] = [];
    (document as Document & { modelContext?: unknown }).modelContext = {
      registerTool: vi.fn(
        async (tool: Tool, options?: { signal?: AbortSignal }) => {
          registrations.push({ tool, signal: options?.signal });
          return undefined;
        },
      ),
    };
    render(<PheetApp />);
    await waitFor(() =>
      expect(
        registrations.some(({ tool }) => tool.name === "start_demo_review"),
      ).toBe(true),
    );
    expect(screen.getByText("WebMCP ready")).toBeVisible();
    const startRegistration = registrations.find(
      ({ tool }) => tool.name === "start_demo_review",
    )!;
    await startRegistration.tool.execute({});
    await waitFor(() =>
      expect(
        registrations.some(({ tool }) => tool.name === "analyze_evidence"),
      ).toBe(true),
    );
    expect(startRegistration.signal?.aborted).toBe(true);
    const analyzeRegistration = registrations.findLast(
      ({ tool }) => tool.name === "analyze_evidence",
    )!;
    await analyzeRegistration.tool.execute({});
    await waitFor(() =>
      expect(
        registrations.some(({ tool }) => tool.name === "inspect_evidence"),
      ).toBe(true),
    );
    expect(analyzeRegistration.signal?.aborted).toBe(true);
    const tools = registrations.map(({ tool }) => tool);
    expect(tools.map(({ name }) => name)).toEqual(
      expect.arrayContaining([
        "query_evidence",
        "inspect_evidence",
        "identify_gaps",
        "prepare_interview_questions",
      ]),
    );
    const inspect = tools.find(({ name }) => name === "inspect_evidence")!;
    expect(inspect.annotations.readOnlyHint).toBe(false);
    expect(
      tools.find(({ name }) => name === "identify_gaps")?.annotations
        .readOnlyHint,
    ).toBe(true);
    expect(
      tools.every(({ annotations }) => annotations.untrustedContentHint),
    ).toBe(true);
    const invalid = (await inspect.execute({})) as {
      structuredContent: { error?: { code: string } };
    };
    expect(invalid.structuredContent.error?.code).toBe(
      "INVALID_TOOL_ARGUMENTS",
    );
    const inspected = (await inspect.execute({
      evidenceId: "evidence_eval_technical",
    })) as {
      content: { text: string }[];
      structuredContent: { truncated: boolean };
    };
    expect(inspected.content[0].text.length).toBeLessThanOrEqual(1800);
    expect(typeof inspected.structuredContent.truncated).toBe("boolean");
    expect(await screen.findByText(/Agent · inspect evidence/i)).toBeVisible();
  });

  it("shows the manual error state when registration throws synchronously", async () => {
    (document as Document & { modelContext?: unknown }).modelContext = {
      registerTool: vi.fn(() => {
        throw new Error("Host registration unavailable");
      }),
    };
    render(<PheetApp />);
    expect(await screen.findByText(/WebMCP error/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /start evidence review/i }),
    ).toBeEnabled();
  });
});
