"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  createInterviewQuestionsInputSchema,
  identifyEvidenceGapsInputSchema,
  inspectEvidenceInputSchema,
} from "./actions";
import { evidenceQuerySchema } from "./schemas";
import type {
  CommandActor,
  useWorkspaceController,
} from "./use-workspace-controller";
import type { Workspace } from "./workspace";

type RunCommand = ReturnType<typeof useWorkspaceController>["run"];
type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => Promise<unknown>;
};
type ModelContext = {
  registerTool: (
    tool: ToolDefinition,
    options?: { signal?: AbortSignal },
  ) => Promise<undefined>;
};

export type WebMcpState =
  "checking" | "unsupported" | "registering" | "ready" | "error";

export function useWebMcpTools(workspace: Workspace, run: RunCommand) {
  const [state, setState] = useState<WebMcpState>("checking");

  useEffect(() => {
    let active = true;
    const updateState = (next: WebMcpState) =>
      queueMicrotask(() => {
        if (active) setState(next);
      });
    const modelContext = (
      document as Document & { modelContext?: ModelContext }
    ).modelContext;
    if (!modelContext?.registerTool) {
      updateState("unsupported");
      return () => {
        active = false;
      };
    }
    updateState("registering");
    const controller = new AbortController();
    const shared = (
      name: string,
      description: string,
      schema: z.ZodType,
      actor: CommandActor = "agent",
    ) => ({
      name,
      description,
      inputSchema: z.toJSONSchema(schema) as Record<string, unknown>,
      annotations: {
        readOnlyHint: name === "identify_gaps",
        untrustedContentHint: true,
      },
      execute: async (input: unknown) => {
        const parsed = schema.safeParse(input);
        if (!parsed.success) {
          const error = {
            code: "INVALID_TOOL_ARGUMENTS",
            message: "The tool arguments did not match the registered schema.",
            issues: parsed.error.issues.map(({ message }) => message),
          };
          return {
            content: [{ type: "text", text: JSON.stringify({ error }) }],
            structuredContent: { error },
          };
        }
        const result = await run(
          actor,
          name as Parameters<RunCommand>[1],
          parsed.data,
        );
        const payload = result.ok ? result.value : { error: result.error };
        const serialized = JSON.stringify(payload);
        const text = serialized.slice(0, 1800);
        return {
          content: [{ type: "text", text }],
          structuredContent: {
            summary: text,
            truncated: serialized.length > text.length,
          },
        };
      },
    });
    const tools: ToolDefinition[] = [];
    if (workspace.phase === "empty")
      tools.push(
        shared(
          "start_demo_review",
          "Open the prepared Pheet portfolio and apply its demonstration capability lens.",
          z.strictObject({}),
        ),
      );
    if (workspace.phase === "lens_ready")
      tools.push(
        shared(
          "analyze_evidence",
          "Run the deterministic alignment and group evidence by capability.",
          z.strictObject({}),
        ),
      );
    if (["evidence_ready", "brief_ready"].includes(workspace.phase)) {
      tools.push(
        shared(
          "query_evidence",
          "Filter reviewed evidence by capability, project, state, or relevance.",
          evidenceQuerySchema,
        ),
        shared(
          "inspect_evidence",
          "Inspect one evidence item and its exact prepared source section.",
          inspectEvidenceInputSchema,
        ),
        shared(
          "identify_gaps",
          "Return grounded evidence gaps and the qualitatively most uncertain capability.",
          identifyEvidenceGapsInputSchema,
        ),
        shared(
          "prepare_interview_questions",
          "Prepare up to five interview questions grounded only in selected gap IDs.",
          createInterviewQuestionsInputSchema,
        ),
      );
    }
    void Promise.all(
      tools.map((tool) =>
        modelContext.registerTool(tool, { signal: controller.signal }),
      ),
    ).then(
      () => updateState("ready"),
      () => {
        if (!controller.signal.aborted) updateState("error");
      },
    );
    return () => {
      active = false;
      controller.abort();
    };
  }, [run, workspace.phase]);

  return state;
}
