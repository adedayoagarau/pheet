import { describe, expect, it } from "vitest";
import { executeWorkspaceCommand } from "@/domain/commands";
import { demoBundleSchema, evidenceItemSchema } from "@/domain/schemas";
import { initialWorkspace, selectVisibleEvidence } from "@/domain/workspace";
import { demoBundle } from "@/fixtures/demo";

function command(
  workspace = initialWorkspace,
  name: Parameters<typeof executeWorkspaceCommand>[1] = "start_demo_review",
  input: unknown = {},
) {
  const result = executeWorkspaceCommand(workspace, name, input, demoBundle);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}
function analyzedWorkspace() {
  return command(command().workspace, "analyze_evidence").workspace;
}

describe("canonical deterministic bundle", () => {
  it("validates its source, graph, lens, and alignment layers", () => {
    expect(demoBundleSchema.safeParse(demoBundle).success).toBe(true);
  });

  it("rejects a broken provenance reference without partial mutation", () => {
    const invalid = structuredClone(demoBundle);
    invalid.alignment.evidenceItems[0].sourceRef = "source_missing";
    const result = executeWorkspaceCommand(
      initialWorkspace,
      "start_demo_review",
      {},
      invalid,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("INVALID_FIXTURE");
    expect(initialWorkspace.phase).toBe("empty");
  });

  it("requires supported evidence to have a source and absences to have a review basis", () => {
    const supported = structuredClone(demoBundle.alignment.evidenceItems[0]);
    delete supported.sourceRef;
    expect(evidenceItemSchema.safeParse(supported).success).toBe(false);
    const absent = structuredClone(
      demoBundle.alignment.evidenceItems.find(
        ({ state }) => state === "not_observed",
      )!,
    );
    absent.reviewBasisSourceRefs = [];
    expect(evidenceItemSchema.safeParse(absent).success).toBe(false);
  });

  it("exercises every qualitative evidence state", () => {
    expect(
      new Set(demoBundle.alignment.evidenceItems.map(({ state }) => state)),
    ).toEqual(
      new Set([
        "demonstrated",
        "partially_demonstrated",
        "claimed_unsupported",
        "not_observed",
      ]),
    );
    expect(
      new Set(
        demoBundle.alignment.evidenceItems.map(({ relevance }) => relevance),
      ),
    ).toEqual(
      new Set([
        "direct",
        "transferable",
        "contextually_different",
        "insufficient_information",
      ]),
    );
  });
});

describe("shared workspace commands", () => {
  it("starts the portfolio and prepared lens atomically, then analyzes nine findings", () => {
    const started = command();
    expect(started.workspace.phase).toBe("lens_ready");
    expect(started.workspace.fixture?.graph.projects).toHaveLength(3);
    const analyzed = command(started.workspace, "analyze_evidence");
    expect(analyzed.workspace.phase).toBe("evidence_ready");
    expect(analyzed.workspace.evidence).toHaveLength(9);
  });

  it("queries idempotently and keeps canonical evidence unchanged", () => {
    const workspace = analyzedWorkspace();
    const first = command(workspace, "query_evidence", {
      states: ["not_observed"],
    }).workspace;
    const second = command(first, "query_evidence", {
      states: ["not_observed"],
    }).workspace;
    expect(
      selectVisibleEvidence(second).every(
        ({ state }) => state === "not_observed",
      ),
    ).toBe(true);
    expect(second.evidence).toBe(workspace.evidence);
  });

  it("inspects a bounded finding and exact source", () => {
    const inspected = command(analyzedWorkspace(), "inspect_evidence", {
      evidenceId: "evidence_eval_technical",
    });
    expect(inspected.workspace.selectedEvidenceId).toBe(
      "evidence_eval_technical",
    );
    expect(inspected.output.sourceId).toBe("source_eval_results");
  });

  it("selects qualitative uncertainty without candidate scores", () => {
    const output = command(analyzedWorkspace(), "identify_gaps", {}).output;
    expect(output.mostUncertain).toMatchObject({
      evidenceState: "not_observed",
    });
    expect(JSON.stringify(output)).not.toMatch(/score|rank|hire|reject/i);
  });

  it("creates only questions grounded in requested valid gap IDs", () => {
    const workspace = analyzedWorkspace();
    const gapIds = demoBundle.alignment.interviewQuestions
      .slice(0, 3)
      .map(({ gapId }) => gapId);
    const prepared = command(workspace, "prepare_interview_questions", {
      gapIds,
      limit: 3,
    });
    expect(prepared.workspace.phase).toBe("brief_ready");
    expect(prepared.workspace.questions).toHaveLength(3);
    expect(
      prepared.workspace.questions.every(({ gapId }) => gapIds.includes(gapId)),
    ).toBe(true);
  });

  it("returns structured failures for stale IDs and wrong-stage actions", () => {
    const stale = executeWorkspaceCommand(
      analyzedWorkspace(),
      "inspect_evidence",
      { evidenceId: "evidence_missing" },
      demoBundle,
    );
    expect(stale.ok).toBe(false);
    const early = executeWorkspaceCommand(
      initialWorkspace,
      "analyze_evidence",
      {},
      demoBundle,
    );
    expect(early.ok).toBe(false);
  });

  it("rejects duplicate gap IDs", () => {
    const workspace = analyzedWorkspace();
    const gapId = workspace.gaps[0].id;
    const result = executeWorkspaceCommand(
      workspace,
      "prepare_interview_questions",
      { gapIds: [gapId, gapId], limit: 2 },
      demoBundle,
    );
    expect(result.ok).toBe(false);
  });
});
