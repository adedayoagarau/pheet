import {
  analyzeEvidence,
  createInterviewQuestions,
  identifyEvidenceGaps,
  identifyEvidenceGapsInputSchema,
  inspectEvidence,
  loadDemoPortfolio,
  queryEvidence,
  selectMostUncertainCapability,
  setCapabilityLens,
  updateInterviewQuestion,
  type ActionResult,
} from "./actions";
import type { DemoBundle } from "./schemas";
import type { Workspace } from "./workspace";

export type WorkspaceCommandName =
  | "start_demo_review"
  | "analyze_evidence"
  | "query_evidence"
  | "inspect_evidence"
  | "identify_gaps"
  | "prepare_interview_questions"
  | "update_interview_question";

export type CommandSuccess = {
  workspace: Workspace;
  output: Record<string, unknown>;
  summary: string;
};

export function executeWorkspaceCommand(
  workspace: Workspace,
  command: WorkspaceCommandName,
  input: unknown,
  demo: DemoBundle,
): ActionResult<CommandSuccess> {
  switch (command) {
    case "start_demo_review": {
      const loaded = loadDemoPortfolio(workspace, demo);
      if (!loaded.ok) return loaded;
      const lensed = setCapabilityLens(loaded.value, demo.lens);
      if (!lensed.ok) return lensed;
      return {
        ok: true,
        value: {
          workspace: lensed.value,
          output: {
            portfolioId: demo.graph.portfolio.id,
            projectIds: demo.graph.portfolio.projectIds,
            lensId: demo.lens.id,
            capabilityIds: demo.lens.capabilities.map(({ id }) => id),
          },
          summary: `${demo.graph.projects.length} projects and the prepared review focus are ready`,
        },
      };
    }
    case "analyze_evidence": {
      const analyzed = analyzeEvidence(workspace);
      if (!analyzed.ok) return analyzed;
      const uncertainty = selectMostUncertainCapability(analyzed.value);
      return {
        ok: true,
        value: {
          workspace: analyzed.value,
          output: {
            analysisId: demo.alignment.id,
            evidenceIds: analyzed.value.evidence.map(({ id }) => id),
            gapIds: analyzed.value.gaps.map(({ id }) => id),
            mostUncertain: uncertainty,
          },
          summary: `${analyzed.value.evidence.length} findings mapped to exact review evidence`,
        },
      };
    }
    case "query_evidence": {
      const queried = queryEvidence(workspace, input);
      if (!queried.ok) return queried;
      const query = queried.value.activeQuery;
      const matchingIds = queried.value.evidence
        .filter(
          (item) =>
            (!query.capabilityId || item.capabilityId === query.capabilityId) &&
            (!query.projectId || item.projectId === query.projectId) &&
            (!query.states?.length || query.states.includes(item.state)) &&
            (!query.relevance?.length ||
              query.relevance.includes(item.relevance)),
        )
        .map(({ id }) => id);
      return {
        ok: true,
        value: {
          workspace: queried.value,
          output: { query, matchingIds },
          summary: `${matchingIds.length} findings match the visible query`,
        },
      };
    }
    case "inspect_evidence": {
      const inspected = inspectEvidence(workspace, input);
      if (!inspected.ok) return inspected;
      const { evidence, source } = inspected.value.inspection;
      const document = demo.graph.sourceDocuments.find(
        ({ id }) => id === source?.documentId,
      );
      const section = document?.sections.find(
        ({ id }) => id === source?.sectionId,
      );
      const reviewBasis = evidence.reviewBasisSourceRefs.map((sourceId) => {
        const basis = demo.graph.sourceReferences.find(
          ({ id }) => id === sourceId,
        );
        return basis
          ? {
              sourceId: basis.id,
              title: basis.pageTitle,
              locator: basis.locator,
            }
          : { sourceId };
      });
      return {
        ok: true,
        value: {
          workspace: inspected.value.workspace,
          output: {
            evidenceId: evidence.id,
            sourceId: source?.id,
            sourceTitle: source?.pageTitle,
            locator: source?.locator,
            sourceExcerpt: section?.content,
            reviewBasis,
            observationSummary: evidence.observationSummary,
            state: evidence.state,
            relevance: evidence.relevance,
            rationale: evidence.rationale,
          },
          summary: source
            ? `Opened ${source.pageTitle} at ${source.locator}`
            : "Opened the documented review-basis finding",
        },
      };
    }
    case "identify_gaps": {
      const parsed = identifyEvidenceGapsInputSchema.safeParse(input);
      if (!parsed.success)
        return {
          ok: false,
          error: {
            code: "INVALID_GAP_QUERY",
            message: "Choose a valid capability before reviewing gaps.",
            retryable: false,
            diagnosticId: "PHEET-INVALID_GAP_QUERY-001",
          },
        };
      const gaps = identifyEvidenceGaps(workspace, parsed.data.capabilityId);
      if (!gaps.ok) return gaps;
      const uncertainty = selectMostUncertainCapability(workspace);
      return {
        ok: true,
        value: {
          workspace,
          output: { gaps: gaps.value, mostUncertain: uncertainty },
          summary: `${gaps.value.length} evidence gaps remain useful interview prompts`,
        },
      };
    }
    case "prepare_interview_questions": {
      const created = createInterviewQuestions(workspace, input);
      if (!created.ok) return created;
      return {
        ok: true,
        value: {
          workspace: created.value,
          output: {
            questions: created.value.questions.map(
              ({ id, gapId, question, purpose }) => ({
                id,
                gapId,
                question,
                purpose,
              }),
            ),
          },
          summary: `${created.value.questions.length} grounded questions prepared`,
        },
      };
    }
    case "update_interview_question": {
      const updated = updateInterviewQuestion(workspace, input);
      if (!updated.ok) return updated;
      return {
        ok: true,
        value: {
          workspace: updated.value,
          output: { questions: updated.value.questions },
          summary: "Interview question updated",
        },
      };
    }
  }
}
