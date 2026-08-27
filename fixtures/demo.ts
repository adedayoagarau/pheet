import rawFixture from "./demo-portfolio.json";
import {
  demoBundleSchema,
  type DemoBundle,
  type EvidenceItem,
} from "@/domain/schemas";

type LegacyEvidence = Omit<
  EvidenceItem,
  "observationSummary" | "reviewBasisSourceRefs"
> & {
  excerpt?: string;
};

const sourceDocuments = rawFixture.sourceReferences.map((source) => ({
  id: `document_${source.id.replace(/^source_/, "")}`,
  title: source.pageTitle,
  sections: [
    {
      id: `section_${source.id.replace(/^source_/, "")}`,
      label: source.locator,
      content: source.excerpt,
    },
  ],
}));

const sourceReferences = rawFixture.sourceReferences.map((source) => ({
  ...source,
  documentId: `document_${source.id.replace(/^source_/, "")}`,
  sectionId: `section_${source.id.replace(/^source_/, "")}`,
}));

const evidenceItems = (rawFixture.preparedAnalysis.evidenceItems as unknown as LegacyEvidence[]).map(
  (legacy) => {
    const project = rawFixture.projects.find(({ id }) => id === legacy.projectId);
    const { excerpt, ...evidence } = legacy;
    return {
      ...evidence,
      observationSummary: excerpt,
      reviewBasisSourceRefs:
        legacy.state === "not_observed" ? (project?.sourceRefs ?? []) : [],
    };
  },
);

export const demoBundle: DemoBundle = demoBundleSchema.parse({
  fixtureVersion: rawFixture.fixtureVersion,
  generatedFor: rawFixture.generatedFor,
  graph: {
    portfolio: rawFixture.portfolio,
    projects: rawFixture.projects,
    claims: rawFixture.claims,
    artifactReferences: rawFixture.artifactReferences,
    sourceReferences,
    sourceDocuments,
  },
  lens: rawFixture.capabilityLens,
  alignment: {
    id: rawFixture.preparedAnalysis.id,
    evidenceItems,
    gaps: rawFixture.preparedAnalysis.gaps,
    interviewQuestions: rawFixture.preparedAnalysis.interviewQuestions,
  },
});
