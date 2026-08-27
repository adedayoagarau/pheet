import { z } from "zod";

const stableId = z
  .string()
  .min(3)
  .regex(/^[a-z][a-z0-9_]*$/);

export const sourceReferenceSchema = z.object({
  id: stableId,
  documentId: stableId,
  sectionId: stableId,
  url: z.string().min(1),
  pageTitle: z.string().min(1),
  locator: z.string().min(1),
  retrievedAt: z.string().optional(),
  trust: z.enum(["prepared", "public_unreviewed", "user_reviewed"]),
});

export const preparedSourceSectionSchema = z.object({
  id: stableId,
  label: z.string().min(1),
  content: z.string().min(1).max(1600),
});

export const preparedSourceDocumentSchema = z.object({
  id: stableId,
  title: z.string().min(1),
  sections: z.array(preparedSourceSectionSchema).min(1),
});

export const claimSchema = z.object({
  id: stableId,
  projectId: stableId,
  text: z.string().min(1).max(600),
  claimType: z.enum(["responsibility", "decision", "outcome", "collaboration"]),
  sourceRefs: z.array(stableId),
});

export const artifactReferenceSchema = z.object({
  id: stableId,
  label: z.string().min(1),
  sourceRef: stableId,
});

export const projectSchema = z.object({
  id: stableId,
  title: z.string().min(1),
  summary: z.string().min(1).max(800),
  roleClaim: z.string().max(600).optional(),
  claimIds: z.array(stableId),
  artifactRefs: z.array(stableId),
  sourceRefs: z.array(stableId),
});

export const portfolioSchema = z.object({
  id: stableId,
  ownerLabel: z.string().min(1),
  sourceUrl: z.string().optional(),
  ingestionState: z.enum([
    "prepared",
    "retrieving",
    "awaiting_review",
    "accepted",
    "failed",
  ]),
  projectIds: z.array(stableId).min(1),
});

export const capabilitySchema = z.object({
  id: stableId,
  label: z.string().min(1),
  definition: z.string().min(1),
  priority: z.enum(["primary", "supporting"]),
  observableSignals: z.array(z.string().min(1)).min(1),
});

export const capabilityLensSchema = z
  .object({
    id: stableId,
    label: z.string().min(1),
    context: z.string().min(1),
    capabilities: z.array(capabilitySchema).min(1).max(5),
  })
  .superRefine((lens, context) => {
    const labels = lens.capabilities.map((capability) =>
      capability.label.toLowerCase(),
    );
    if (new Set(labels).size !== labels.length) {
      context.addIssue({
        code: "custom",
        path: ["capabilities"],
        message: "Capability labels must be unique.",
      });
    }
  });

export const evidenceStateSchema = z.enum([
  "demonstrated",
  "partially_demonstrated",
  "claimed_unsupported",
  "not_observed",
]);
export const relevanceSchema = z.enum([
  "direct",
  "transferable",
  "contextually_different",
  "insufficient_information",
]);

export const evidenceItemSchema = z
  .object({
    id: stableId,
    capabilityId: stableId,
    projectId: stableId.optional(),
    claimId: stableId.optional(),
    sourceRef: stableId.optional(),
    observationSummary: z.string().max(600).optional(),
    reviewBasisSourceRefs: z.array(stableId).default([]),
    state: evidenceStateSchema,
    relevance: relevanceSchema,
    confidence: z.enum(["high", "medium", "low"]),
    rationale: z.string().min(1).max(800),
  })
  .superRefine((evidence, context) => {
    if (
      ["demonstrated", "partially_demonstrated"].includes(evidence.state) &&
      !evidence.sourceRef
    ) {
      context.addIssue({
        code: "custom",
        path: ["sourceRef"],
        message: "Supported evidence requires a source reference.",
      });
    }
    if (
      evidence.state === "not_observed" &&
      evidence.reviewBasisSourceRefs.length === 0
    ) {
      context.addIssue({
        code: "custom",
        path: ["reviewBasisSourceRefs"],
        message: "Not-observed evidence requires a documented review basis.",
      });
    }
  });

export const evidenceGapSchema = z.object({
  id: stableId,
  capabilityId: stableId,
  gapType: z.enum(["ownership", "support", "context", "not_observed"]),
  explanation: z.string().min(1).max(800),
  relatedEvidenceIds: z.array(stableId),
});

export const interviewQuestionSchema = z.object({
  id: stableId,
  gapId: stableId,
  question: z.string().min(1).max(500),
  purpose: z.string().min(1).max(500),
  status: z.enum(["draft", "accepted", "edited", "dismissed"]),
});

export const preparedAnalysisSchema = z.object({
  id: stableId,
  portfolioId: stableId,
  lensId: stableId,
  evidenceItems: z.array(evidenceItemSchema).min(1),
  gaps: z.array(evidenceGapSchema),
  interviewQuestions: z.array(interviewQuestionSchema),
});

export const portfolioGraphSchema = z.object({
  portfolio: portfolioSchema,
  projects: z.array(projectSchema).min(1),
  claims: z.array(claimSchema),
  artifactReferences: z.array(artifactReferenceSchema),
  sourceReferences: z.array(sourceReferenceSchema).min(1),
  sourceDocuments: z.array(preparedSourceDocumentSchema).min(1),
});

export const deterministicAlignmentSchema = preparedAnalysisSchema.omit({
  portfolioId: true,
  lensId: true,
});

export const demoBundleSchema = z
  .object({
    fixtureVersion: z.string().min(1),
    generatedFor: z.string().min(1),
    graph: portfolioGraphSchema,
    lens: capabilityLensSchema,
    alignment: deterministicAlignmentSchema,
  })
  .superRefine((bundle, context) => {
    const { graph, lens, alignment } = bundle;
    const projectIds = uniqueIds(context, "graph.projects", graph.projects);
    const claimIds = uniqueIds(context, "graph.claims", graph.claims);
    const artifactIds = uniqueIds(
      context,
      "graph.artifactReferences",
      graph.artifactReferences,
    );
    const sourceIds = uniqueIds(
      context,
      "graph.sourceReferences",
      graph.sourceReferences,
    );
    const documentIds = uniqueIds(
      context,
      "graph.sourceDocuments",
      graph.sourceDocuments,
    );
    const capabilityIds = uniqueIds(
      context,
      "lens.capabilities",
      lens.capabilities,
    );
    const evidenceIds = uniqueIds(
      context,
      "alignment.evidenceItems",
      alignment.evidenceItems,
    );
    const gapIds = uniqueIds(context, "alignment.gaps", alignment.gaps);
    uniqueIds(
      context,
      "alignment.interviewQuestions",
      alignment.interviewQuestions,
    );

    graph.portfolio.projectIds.forEach((id) =>
      requireReference(context, "graph.portfolio.projectIds", id, projectIds),
    );
    graph.projects.forEach((project) => {
      project.claimIds.forEach((id) => {
        requireReference(context, "graph.projects.claimIds", id, claimIds);
        const claim = graph.claims.find((candidate) => candidate.id === id);
        if (claim && claim.projectId !== project.id)
          addRelationshipIssue(
            context,
            `${id} does not belong to ${project.id}`,
          );
      });
      project.artifactRefs.forEach((id) =>
        requireReference(
          context,
          "graph.projects.artifactRefs",
          id,
          artifactIds,
        ),
      );
      project.sourceRefs.forEach((id) =>
        requireReference(context, "graph.projects.sourceRefs", id, sourceIds),
      );
    });
    graph.claims.forEach((claim) => {
      requireReference(
        context,
        "graph.claims.projectId",
        claim.projectId,
        projectIds,
      );
      claim.sourceRefs.forEach((id) =>
        requireReference(context, "graph.claims.sourceRefs", id, sourceIds),
      );
    });
    graph.artifactReferences.forEach((artifact) =>
      requireReference(
        context,
        "graph.artifactReferences.sourceRef",
        artifact.sourceRef,
        sourceIds,
      ),
    );
    graph.sourceReferences.forEach((source) => {
      requireReference(
        context,
        "source.documentId",
        source.documentId,
        documentIds,
      );
      const document = graph.sourceDocuments.find(
        ({ id }) => id === source.documentId,
      );
      if (!document?.sections.some(({ id }) => id === source.sectionId))
        addReferenceIssue(context, "source.sectionId", source.sectionId);
    });
    alignment.evidenceItems.forEach((evidence) => {
      requireReference(
        context,
        "evidence.capabilityId",
        evidence.capabilityId,
        capabilityIds,
      );
      if (evidence.projectId)
        requireReference(
          context,
          "evidence.projectId",
          evidence.projectId,
          projectIds,
        );
      if (evidence.claimId)
        requireReference(
          context,
          "evidence.claimId",
          evidence.claimId,
          claimIds,
        );
      if (evidence.sourceRef)
        requireReference(
          context,
          "evidence.sourceRef",
          evidence.sourceRef,
          sourceIds,
        );
      evidence.reviewBasisSourceRefs.forEach((id) =>
        requireReference(
          context,
          "evidence.reviewBasisSourceRefs",
          id,
          sourceIds,
        ),
      );
      const project = graph.projects.find(
        ({ id }) => id === evidence.projectId,
      );
      const claim = graph.claims.find(({ id }) => id === evidence.claimId);
      if (project && claim && claim.projectId !== project.id)
        addRelationshipIssue(
          context,
          `${evidence.id} links a claim from another project`,
        );
      if (
        project &&
        evidence.sourceRef &&
        !project.sourceRefs.includes(evidence.sourceRef)
      )
        addRelationshipIssue(
          context,
          `${evidence.id} links a source outside its project`,
        );
      if (
        project &&
        evidence.reviewBasisSourceRefs.some(
          (id) => !project.sourceRefs.includes(id),
        )
      )
        addRelationshipIssue(
          context,
          `${evidence.id} review basis is outside its project`,
        );
    });
    alignment.gaps.forEach((gap) => {
      requireReference(
        context,
        "gaps.capabilityId",
        gap.capabilityId,
        capabilityIds,
      );
      gap.relatedEvidenceIds.forEach((id) => {
        requireReference(context, "gaps.relatedEvidenceIds", id, evidenceIds);
        const evidence = alignment.evidenceItems.find((item) => item.id === id);
        if (evidence && evidence.capabilityId !== gap.capabilityId)
          addRelationshipIssue(
            context,
            `${gap.id} links evidence from another capability`,
          );
      });
    });
    alignment.interviewQuestions.forEach((question) =>
      requireReference(context, "questions.gapId", question.gapId, gapIds),
    );
  });

function addReferenceIssue(
  context: z.core.$RefinementCtx,
  field: string,
  id: string,
) {
  context.addIssue({
    code: "custom",
    message: `Invalid ${field} reference: ${id}`,
  });
}

function addRelationshipIssue(context: z.core.$RefinementCtx, message: string) {
  context.addIssue({
    code: "custom",
    message: `Invalid provenance: ${message}.`,
  });
}

function uniqueIds(
  context: z.core.$RefinementCtx,
  field: string,
  values: { id: string }[],
) {
  const ids = values.map(({ id }) => id);
  if (new Set(ids).size !== ids.length)
    context.addIssue({ code: "custom", message: `Duplicate IDs in ${field}.` });
  return new Set(ids);
}

function requireReference(
  context: z.core.$RefinementCtx,
  field: string,
  id: string,
  ids: Set<string>,
) {
  if (!ids.has(id)) addReferenceIssue(context, field, id);
}

export const evidenceQuerySchema = z.object({
  capabilityId: stableId.optional(),
  projectId: stableId.optional(),
  states: z.array(evidenceStateSchema).optional(),
  relevance: z.array(relevanceSchema).optional(),
});

export type CapabilityLens = z.infer<typeof capabilityLensSchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type EvidenceGap = z.infer<typeof evidenceGapSchema>;
export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;
export type EvidenceQuery = z.infer<typeof evidenceQuerySchema>;
export type SourceReference = z.infer<typeof sourceReferenceSchema>;
export type PreparedSourceDocument = z.infer<
  typeof preparedSourceDocumentSchema
>;
export type PortfolioGraph = z.infer<typeof portfolioGraphSchema>;
export type DeterministicAlignment = z.infer<
  typeof deterministicAlignmentSchema
>;
export type DemoBundle = z.infer<typeof demoBundleSchema>;
