import { z } from "zod";
import {
  capabilityLensSchema,
  demoBundleSchema,
  evidenceQuerySchema,
  type CapabilityLens,
  type DemoBundle,
  type EvidenceGap,
  type EvidenceItem,
  type EvidenceQuery,
  type InterviewQuestion,
  type SourceReference,
} from "./schemas";
import type { Workspace } from "./workspace";

export type ActionError = {
  code: string;
  message: string;
  retryable: boolean;
  diagnosticId: string;
  issues?: string[];
};

export type ActionResult<T> =
  { ok: true; value: T } | { ok: false; error: ActionError };

function failure(
  code: string,
  message: string,
  retryable = false,
  issues?: string[],
): ActionResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
      retryable,
      diagnosticId: `PHEET-${code}-001`,
      issues,
    },
  };
}

export function loadDemoPortfolio(
  workspace: Workspace,
  input: unknown,
): ActionResult<Workspace> {
  const parsed = demoBundleSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      "INVALID_FIXTURE",
      "The prepared portfolio could not be validated. No workspace data was changed.",
      true,
      parsed.error.issues.map((issue) => issue.message),
    );
  }
  const loaded: Workspace = {
    ...workspace,
    phase: "portfolio_ready",
    fixture: parsed.data,
    lens: undefined,
    evidence: [],
    gaps: [],
    questions: [],
    selectedEvidenceId: undefined,
    activeQuery: {},
    error: undefined,
  };
  return { ok: true, value: loaded };
}

export function setCapabilityLens(
  workspace: Workspace,
  input: unknown,
): ActionResult<Workspace> {
  if (!workspace.fixture)
    return failure(
      "PORTFOLIO_REQUIRED",
      "Open a portfolio before applying a capability lens.",
    );
  const parsed = capabilityLensSchema.safeParse(input);
  if (!parsed.success)
    return failure(
      "INVALID_LENS",
      "Review the capability lens and try again.",
      false,
      parsed.error.issues.map(({ message }) => message),
    );
  const updated: Workspace = {
    ...workspace,
    phase: "lens_ready",
    lens: parsed.data,
    evidence: [],
    gaps: [],
    questions: [],
    selectedEvidenceId: undefined,
    activeQuery: {},
    error: undefined,
  };
  return { ok: true, value: updated };
}

export function analyzeEvidence(workspace: Workspace): ActionResult<Workspace> {
  if (!workspace.fixture || !workspace.lens)
    return failure(
      "LENS_REQUIRED",
      "Open the portfolio and apply a lens before analysis.",
    );
  if (workspace.lens.id !== workspace.fixture.lens.id) {
    return failure(
      "ANALYSIS_UNAVAILABLE",
      "This deterministic slice supports the prepared demonstration lens.",
      true,
    );
  }
  const evidence = workspace.fixture.alignment.evidenceItems;
  const selectedEvidenceId =
    evidence.find(({ state }) => state === "partially_demonstrated")?.id ??
    evidence[0]?.id;
  const updated: Workspace = {
    ...workspace,
    phase: "evidence_ready",
    evidence,
    gaps: workspace.fixture.alignment.gaps,
    questions: [],
    selectedEvidenceId,
    activeQuery: {},
    error: undefined,
  };
  return { ok: true, value: updated };
}

export function queryEvidence(
  workspace: Workspace,
  input: unknown,
): ActionResult<Workspace> {
  if (workspace.phase !== "evidence_ready" && workspace.phase !== "brief_ready")
    return failure(
      "EVIDENCE_REQUIRED",
      "Analyze the portfolio before filtering evidence.",
    );
  const parsed = evidenceQuerySchema.safeParse(input);
  if (!parsed.success)
    return failure("INVALID_QUERY", "The evidence query is not valid.");
  if (
    parsed.data.capabilityId &&
    !workspace.lens?.capabilities.some(
      ({ id }) => id === parsed.data.capabilityId,
    )
  )
    return failure(
      "CAPABILITY_NOT_FOUND",
      "That capability is not available in the prepared review focus.",
    );
  if (
    parsed.data.projectId &&
    !workspace.fixture?.graph.projects.some(
      ({ id }) => id === parsed.data.projectId,
    )
  )
    return failure(
      "PROJECT_NOT_FOUND",
      "That project is not available in the prepared portfolio.",
    );
  const updated = {
    ...workspace,
    activeQuery: parsed.data,
    selectedEvidenceId: undefined,
  };
  return { ok: true, value: updated };
}

export const inspectEvidenceInputSchema = z.object({
  evidenceId: z.string().min(1),
});
export type EvidenceInspection = {
  evidence: EvidenceItem;
  source?: SourceReference;
};

export function inspectEvidence(
  workspace: Workspace,
  input: unknown,
): ActionResult<{ workspace: Workspace; inspection: EvidenceInspection }> {
  const parsed = inspectEvidenceInputSchema.safeParse(input);
  if (!parsed.success)
    return failure("INVALID_EVIDENCE_ID", "Choose a valid evidence item.");
  const evidence = workspace.evidence.find(
    ({ id }) => id === parsed.data.evidenceId,
  );
  if (!evidence)
    return failure(
      "EVIDENCE_NOT_FOUND",
      "That finding is not available in this analysis.",
    );
  const source = workspace.fixture?.graph.sourceReferences.find(
    ({ id }) => id === evidence.sourceRef,
  );
  if (
    ["demonstrated", "partially_demonstrated"].includes(evidence.state) &&
    !source
  ) {
    return failure(
      "INVALID_PROVENANCE",
      "This finding no longer has a valid source. Review the source before using it.",
    );
  }
  const updated = { ...workspace, selectedEvidenceId: evidence.id };
  return {
    ok: true,
    value: { workspace: updated, inspection: { evidence, source } },
  };
}

export function identifyEvidenceGaps(
  workspace: Workspace,
  capabilityId?: string,
): ActionResult<EvidenceGap[]> {
  if (!workspace.evidence.length)
    return failure(
      "EVIDENCE_REQUIRED",
      "Analyze the portfolio before reviewing uncertainty.",
    );
  if (
    capabilityId &&
    !workspace.lens?.capabilities.some(({ id }) => id === capabilityId)
  ) {
    return failure(
      "CAPABILITY_NOT_FOUND",
      "That capability is not available in the prepared review focus.",
    );
  }
  return {
    ok: true,
    value: capabilityId
      ? workspace.gaps.filter((gap) => gap.capabilityId === capabilityId)
      : workspace.gaps,
  };
}

export const identifyEvidenceGapsInputSchema = z.object({
  capabilityId: z.string().min(3).optional(),
});

export const createInterviewQuestionsInputSchema = z.object({
  gapIds: z
    .array(z.string().min(1))
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Gap IDs must be unique.",
    }),
  limit: z.number().int().min(1).max(5).default(3),
});
export function createInterviewQuestions(
  workspace: Workspace,
  input: unknown,
): ActionResult<Workspace> {
  const parsed = createInterviewQuestionsInputSchema.safeParse(input);
  if (!parsed.success)
    return failure(
      "INVALID_GAP_SELECTION",
      "Select at least one evidence gap.",
    );
  const availableGapIds = new Set(workspace.gaps.map(({ id }) => id));
  if (parsed.data.gapIds.some((id) => !availableGapIds.has(id)))
    return failure(
      "GAP_NOT_FOUND",
      "One or more selected gaps are not available.",
    );
  const prepared = workspace.fixture?.alignment.interviewQuestions ?? [];
  const byGap = new Map(prepared.map((question) => [question.gapId, question]));
  const selected: InterviewQuestion[] = [];
  for (const gapId of parsed.data.gapIds) {
    const question = byGap.get(gapId);
    if (question && selected.length < parsed.data.limit)
      selected.push(question);
  }
  const updated: Workspace = {
    ...workspace,
    phase: "brief_ready",
    questions: selected,
    error: undefined,
  };
  return { ok: true, value: updated };
}

export const updateInterviewQuestionInputSchema = z
  .object({
    questionId: z.string().min(1),
    status: z.enum(["draft", "accepted", "edited", "dismissed"]),
    question: z.string().min(1).max(500).optional(),
  })
  .superRefine((input, context) => {
    if (input.status === "edited" && !input.question) {
      context.addIssue({
        code: "custom",
        path: ["question"],
        message: "Edited questions require updated question text.",
      });
    }
  });

export function updateInterviewQuestion(
  workspace: Workspace,
  input: unknown,
): ActionResult<Workspace> {
  const parsed = updateInterviewQuestionInputSchema.safeParse(input);
  if (!parsed.success)
    return failure(
      "INVALID_QUESTION_UPDATE",
      "Review the question update and try again.",
      false,
      parsed.error.issues.map(({ message }) => message),
    );
  const question = workspace.questions.find(
    ({ id }) => id === parsed.data.questionId,
  );
  if (!question)
    return failure(
      "QUESTION_NOT_FOUND",
      "That interview question is not available in this brief.",
    );
  const questions = workspace.questions.map((candidate) =>
    candidate.id === question.id
      ? {
          ...candidate,
          status: parsed.data.status,
          question: parsed.data.question ?? candidate.question,
        }
      : candidate,
  );
  return { ok: true, value: { ...workspace, questions } };
}

const uncertaintyOrder: EvidenceItem["state"][] = [
  "not_observed",
  "claimed_unsupported",
  "partially_demonstrated",
  "demonstrated",
];

export function selectMostUncertainCapability(workspace: Workspace):
  | {
      capabilityId: string;
      evidenceState: EvidenceItem["state"];
      evidenceIds: string[];
      gapIds: string[];
      explanation: string;
    }
  | undefined {
  for (const state of uncertaintyOrder) {
    for (const capability of workspace.lens?.capabilities ?? []) {
      const evidence = workspace.evidence.filter(
        (item) => item.capabilityId === capability.id && item.state === state,
      );
      if (!evidence.length) continue;
      const evidenceIds = evidence.map(({ id }) => id);
      return {
        capabilityId: capability.id,
        evidenceState: state,
        evidenceIds,
        gapIds: workspace.gaps
          .filter(
            (gap) =>
              gap.capabilityId === capability.id &&
              gap.relatedEvidenceIds.some((id) => evidenceIds.includes(id)),
          )
          .map(({ id }) => id),
        explanation:
          state === "not_observed"
            ? "This capability contains evidence not observed in the reviewed work."
            : `This capability contains ${state.replaceAll("_", " ")} evidence that should be clarified.`,
      };
    }
  }
  return undefined;
}

export function replaceLensWithoutPortfolioMutation(
  fixture: DemoBundle,
  lens: CapabilityLens,
): { fixture: DemoBundle; lens: CapabilityLens } {
  return { fixture, lens };
}

export function matchingEvidence(
  evidence: EvidenceItem[],
  query: EvidenceQuery,
): EvidenceItem[] {
  return evidence.filter(
    (item) =>
      (!query.capabilityId || item.capabilityId === query.capabilityId) &&
      (!query.projectId || item.projectId === query.projectId) &&
      (!query.states?.length || query.states.includes(item.state)) &&
      (!query.relevance?.length || query.relevance.includes(item.relevance)),
  );
}
