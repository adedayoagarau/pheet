import type {
  CapabilityLens,
  DemoBundle,
  EvidenceGap,
  EvidenceItem,
  EvidenceQuery,
  InterviewQuestion,
  SourceReference,
} from "./schemas";

export type WorkspacePhase =
  | "empty"
  | "portfolio_ready"
  | "lens_ready"
  | "analyzing"
  | "evidence_ready"
  | "preparing_questions"
  | "brief_ready";

export type WorkspaceError = {
  code: string;
  message: string;
  retryable: boolean;
  diagnosticId: string;
};

export type Activity = {
  id: string;
  requestId: string;
  actor: "human" | "agent";
  command: string;
  status: "running" | "success" | "error";
  label: string;
  detail: string;
};

export type Workspace = {
  version: 1;
  id: "workspace_demo_001";
  phase: WorkspacePhase;
  fixture?: DemoBundle;
  lens?: CapabilityLens;
  evidence: EvidenceItem[];
  gaps: EvidenceGap[];
  questions: InterviewQuestion[];
  selectedEvidenceId?: string;
  activeQuery: EvidenceQuery;
  activity: Activity[];
  error?: WorkspaceError;
};

export type WorkspaceEvent =
  | { type: "replace"; workspace: Workspace }
  | { type: "start_loading" }
  | { type: "start_analysis" }
  | { type: "start_questions" }
  | { type: "set_error"; error: WorkspaceError };

export const initialWorkspace: Workspace = {
  version: 1,
  id: "workspace_demo_001",
  phase: "empty",
  evidence: [],
  gaps: [],
  questions: [],
  activeQuery: {},
  activity: [],
};

export function workspaceReducer(
  state: Workspace,
  event: WorkspaceEvent,
): Workspace {
  switch (event.type) {
    case "replace":
      return event.workspace;
    case "start_loading":
      return { ...state, error: undefined };
    case "start_analysis":
      return { ...state, phase: "analyzing", error: undefined };
    case "start_questions":
      return { ...state, phase: "preparing_questions", error: undefined };
    case "set_error":
      return { ...state, error: event.error };
  }
}

export function appendActivity(
  workspace: Workspace,
  activity: Omit<Activity, "id">,
): Workspace {
  const existing = workspace.activity.find(
    ({ requestId }) => requestId === activity.requestId,
  );
  const nextSequence =
    workspace.activity.reduce((largest, entry) => {
      const sequence = Number(entry.id.replace("activity_", ""));
      return Number.isFinite(sequence) ? Math.max(largest, sequence) : largest;
    }, 0) + 1;
  const activityLog = [
    { id: existing?.id ?? `activity_${nextSequence}`, ...activity },
    ...workspace.activity.filter(
      ({ requestId }) => requestId !== activity.requestId,
    ),
  ].slice(0, 4);
  return { ...workspace, activity: activityLog };
}

export function selectVisibleEvidence(workspace: Workspace): EvidenceItem[] {
  const query = workspace.activeQuery;
  return workspace.evidence.filter((item) => {
    if (query.capabilityId && item.capabilityId !== query.capabilityId)
      return false;
    if (query.projectId && item.projectId !== query.projectId) return false;
    if (query.states?.length && !query.states.includes(item.state))
      return false;
    if (query.relevance?.length && !query.relevance.includes(item.relevance))
      return false;
    return true;
  });
}

export function selectSource(
  workspace: Workspace,
  evidenceId = workspace.selectedEvidenceId,
): SourceReference | undefined {
  const evidence = workspace.evidence.find(({ id }) => id === evidenceId);
  return workspace.fixture?.graph.sourceReferences.find(
    ({ id }) => id === evidence?.sourceRef,
  );
}
