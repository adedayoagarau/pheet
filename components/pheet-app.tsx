"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useWorkspaceController } from "@/domain/use-workspace-controller";
import { useWebMcpTools, type WebMcpState } from "@/domain/use-webmcp-tools";
import type { EvidenceItem, InterviewQuestion } from "@/domain/schemas";
import {
  selectSource,
  selectVisibleEvidence,
  type Workspace,
} from "@/domain/workspace";
import { demoBundle } from "@/fixtures/demo";

const stateLabels: Record<EvidenceItem["state"], string> = {
  demonstrated: "Demonstrated",
  partially_demonstrated: "Partially demonstrated",
  claimed_unsupported: "Claimed, not yet supported",
  not_observed: "Not observed in the reviewed work",
};
const relevanceLabels: Record<EvidenceItem["relevance"], string> = {
  direct: "Direct",
  transferable: "Transferable",
  contextually_different: "Contextually different",
  insufficient_information: "Insufficient information",
};

export function PheetApp() {
  const { workspace, run } = useWorkspaceController(demoBundle);
  const webMcpState = useWebMcpTools(workspace, run);
  const running = workspace.activity.some(({ status }) => status === "running");
  if (!workspace.fixture)
    return (
      <StartScreen
        loading={running}
        error={workspace.error}
        webMcpState={webMcpState}
        onStart={() => void run("human", "start_demo_review")}
      />
    );
  return (
    <WorkspaceView
      workspace={workspace}
      running={running}
      webMcpState={webMcpState}
      run={run}
    />
  );
}

function StartScreen({
  loading,
  error,
  webMcpState,
  onStart,
}: {
  loading: boolean;
  error?: Workspace["error"];
  webMcpState: WebMcpState;
  onStart: () => void;
}) {
  return (
    <main className="start-shell">
      <header className="brand-row">
        <Brand />
        <Compatibility state={webMcpState} />
      </header>
      <section className="start-hero" aria-labelledby="start-title">
        <div className="eyebrow">Evidence before judgment</div>
        <h1 id="start-title">
          See where the work <em>fits.</em>
        </h1>
        <p className="hero-copy">
          Open a prepared portfolio, apply a capability lens, and follow every
          finding back to the work that supports it.
        </p>
        {error && <ErrorNotice error={error} onRetry={onStart} />}
        <button className="primary-action" onClick={onStart} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Preparing review…
            </>
          ) : (
            "Start evidence review"
          )}
        </button>
        <p className="fixture-note">
          3 projects · 9 findings · deterministic and offline
        </p>
      </section>
      <aside className="start-ledger" aria-label="Pheet review journey">
        <Image
          src="/journey/01-end-to-end-journey.png"
          width={1672}
          height={941}
          alt="Illustrated Pheet journey from portfolio discovery through grounded interview questions"
          priority
        />
        <span className="ledger-number">01—05</span>
        <h2>A reviewable trail, not a verdict.</h2>
        <p>
          Discover the work → map evidence → inspect sources → surface
          uncertainty → prepare questions.
        </p>
      </aside>
      <TrustFooter />
    </main>
  );
}

type Run = ReturnType<typeof useWorkspaceController>["run"];
function WorkspaceView({
  workspace,
  running,
  webMcpState,
  run,
}: {
  workspace: Workspace;
  running: boolean;
  webMcpState: WebMcpState;
  run: Run;
}) {
  const visible = useMemo(() => selectVisibleEvidence(workspace), [workspace]);
  const evidenceReady = workspace.evidence.length > 0;
  const selected = workspace.evidence.find(
    ({ id }) => id === workspace.selectedEvidenceId,
  );
  const source = selectSource(workspace);
  const sourceDocument = workspace.fixture?.graph.sourceDocuments.find(
    ({ id }) => id === source?.documentId,
  );
  const sourceSection = sourceDocument?.sections.find(
    ({ id }) => id === source?.sectionId,
  );
  const reviewBasis = selected?.reviewBasisSourceRefs.map((sourceId) =>
    workspace.fixture?.graph.sourceReferences.find(({ id }) => id === sourceId),
  );
  const prepare = () =>
    void run("human", "prepare_interview_questions", {
      gapIds: workspace
        .fixture!.alignment.interviewQuestions.slice(0, 3)
        .map(({ gapId }) => gapId),
      limit: 3,
    });
  return (
    <main className="app-shell">
      <header className="workspace-header">
        <Brand />
        <div className="workspace-meta">
          <span>{workspace.fixture?.graph.portfolio.ownerLabel}</span>
          <Compatibility state={webMcpState} />
        </div>
      </header>
      {workspace.error && (
        <ErrorNotice
          error={workspace.error}
          onRetry={() =>
            void run(
              "human",
              workspace.phase === "lens_ready"
                ? "analyze_evidence"
                : "start_demo_review",
            )
          }
        />
      )}
      <section className="workspace-grid" aria-label="Evidence workspace">
        <aside className="lens-panel panel">
          <div className="panel-kicker">01 / Capability lens</div>
          <h2>{workspace.lens?.label}</h2>
          <p className="context-copy">{workspace.lens?.context}</p>
          <div className="capability-list">
            {workspace.lens?.capabilities.map((capability, index) => (
              <div className="capability-row" key={capability.id}>
                <span className="capability-index">0{index + 1}</span>
                <div>
                  <strong>{capability.label}</strong>
                  <small>
                    {evidenceReady
                      ? `${workspace.evidence.filter(({ capabilityId }) => capabilityId === capability.id).length} findings`
                      : capability.priority}
                  </small>
                </div>
              </div>
            ))}
          </div>
          {workspace.phase === "lens_ready" && (
            <button
              className="primary-action compact"
              disabled={running}
              onClick={() => void run("human", "analyze_evidence")}
            >
              {running ? "Analyzing…" : "Analyze portfolio evidence"}
            </button>
          )}
        </aside>
        <section
          className="evidence-panel panel"
          aria-labelledby="evidence-title"
        >
          <div className="panel-heading">
            <div>
              <div className="panel-kicker">02 / Evidence map</div>
              <h2 id="evidence-title">Findings by capability</h2>
            </div>
            {evidenceReady && (
              <div className="filter-group" aria-label="Evidence filters">
                <button
                  onClick={() => void run("human", "query_evidence", {})}
                  aria-pressed={!workspace.activeQuery.states}
                >
                  All
                </button>
                <button
                  onClick={() =>
                    void run("human", "query_evidence", {
                      states: [
                        "partially_demonstrated",
                        "claimed_unsupported",
                        "not_observed",
                      ],
                    })
                  }
                  aria-pressed={Boolean(workspace.activeQuery.states)}
                >
                  Uncertainty
                </button>
              </div>
            )}
          </div>
          {!evidenceReady ? (
            <div className="empty-evidence">
              <span>↳</span>
              <h3>The evidence map is waiting.</h3>
              <p>
                Run the deterministic analysis. The prepared portfolio record
                remains unchanged.
              </p>
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-evidence">
              <h3>No findings match this view.</h3>
              <p>Clear the current filter to return to all evidence.</p>
            </div>
          ) : (
            <div className="evidence-groups">
              {workspace.lens?.capabilities.map((capability) => {
                const items = visible.filter(
                  ({ capabilityId }) => capabilityId === capability.id,
                );
                return items.length ? (
                  <EvidenceGroup
                    key={capability.id}
                    label={capability.label}
                    items={items}
                    projects={workspace.fixture!.graph.projects}
                    selectedId={workspace.selectedEvidenceId}
                    onSelect={(evidenceId) =>
                      void run("human", "inspect_evidence", { evidenceId })
                    }
                  />
                ) : null;
              })}
            </div>
          )}
        </section>
        <aside className="inspector-panel panel" aria-live="polite">
          <div className="panel-kicker">03 / Source inspection</div>
          {!selected ? (
            <div className="empty-inspector">
              <div className="magnifier" aria-hidden="true">
                ⌕
              </div>
              <h2>Select a finding</h2>
              <p>
                Compare Pheet’s observation with the exact prepared source
                section.
              </p>
            </div>
          ) : (
            <>
              <div className={`state-chip state-${selected.state}`}>
                {stateLabels[selected.state]}
              </div>
              <h2>
                {workspace.fixture?.graph.projects.find(
                  ({ id }) => id === selected.projectId,
                )?.title ?? "Reviewed portfolio"}
              </h2>
              {source && sourceSection ? (
                <div className="source-card">
                  <div className="source-label">
                    Prepared source · untrusted content
                  </div>
                  <strong>{sourceDocument?.title}</strong>
                  <span>{sourceSection.label}</span>
                  <blockquote>“{sourceSection.content}”</blockquote>
                </div>
              ) : (
                <div className="provenance-empty">
                  <strong>No claim of evidence</strong>
                  <p>This absence is based on reviewing:</p>
                  <ul>
                    {reviewBasis?.map(
                      (basis) =>
                        basis && (
                          <li key={basis.id}>
                            {basis.pageTitle} · {basis.locator}
                          </li>
                        ),
                    )}
                  </ul>
                </div>
              )}
              <div className="interpretation">
                <span>Observed in the reviewed work</span>
                <p>{selected.observationSummary ?? selected.rationale}</p>
                <span>Pheet interpretation</span>
                <p>{selected.rationale}</p>
                <dl>
                  <div>
                    <dt>Relevance</dt>
                    <dd>{relevanceLabels[selected.relevance]}</dd>
                  </div>
                  <div>
                    <dt>Classification confidence</dt>
                    <dd>{selected.confidence}</dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </aside>
      </section>
      {evidenceReady && (
        <section className="brief-panel" aria-labelledby="brief-title">
          <div className="brief-heading">
            <div>
              <div className="panel-kicker">
                04 / Ask what the work cannot answer
              </div>
              <h2 id="brief-title">
                Uncertainty becomes interview preparation.
              </h2>
            </div>
            <button
              className="primary-action compact"
              onClick={prepare}
              disabled={running}
            >
              {workspace.questions.length
                ? "Regenerate grounded questions"
                : "Create 3 grounded questions"}
            </button>
          </div>
          <div className="brief-grid">
            <div className="gap-list">
              {workspace.gaps.map((gap) => (
                <article key={gap.id} className="gap-card">
                  <span>{gap.gapType.replaceAll("_", " ")}</span>
                  <p>{gap.explanation}</p>
                  <small>Gap ID · {gap.id}</small>
                </article>
              ))}
            </div>
            <div className="question-list">
              {workspace.questions.length ? (
                workspace.questions.map((question, index) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    index={index}
                    run={run}
                  />
                ))
              ) : (
                <div className="question-empty">
                  <span>?</span>
                  <p>
                    Every generated question will reference an exact evidence
                    gap.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      <ActivityStrip workspace={workspace} />
      <TrustFooter />
    </main>
  );
}

function QuestionCard({
  question,
  index,
  run,
}: {
  question: InterviewQuestion;
  index: number;
  run: Run;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(question.question);
  const update = (status: InterviewQuestion["status"], next?: string) =>
    void run("human", "update_interview_question", {
      questionId: question.id,
      status,
      question: next,
    });
  return (
    <article className={`question-card question-${question.status}`}>
      <span className="question-number">Q{index + 1}</span>
      <div>
        {editing ? (
          <>
            <label className="sr-only" htmlFor={`edit-${question.id}`}>
              Edit question
            </label>
            <textarea
              id={`edit-${question.id}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <button
              onClick={() => {
                update("edited", text);
                setEditing(false);
              }}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <h3>{question.question}</h3>
            <p>{question.purpose}</p>
            <small>
              Grounded in {question.gapId} · {question.status}
            </small>
            <div className="question-actions">
              <button onClick={() => update("accepted")}>Accept</button>
              <button onClick={() => setEditing(true)}>Edit</button>
              <button onClick={() => update("dismissed")}>Dismiss</button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function EvidenceGroup({
  label,
  items,
  projects,
  selectedId,
  onSelect,
}: {
  label: string;
  items: EvidenceItem[];
  projects: NonNullable<Workspace["fixture"]>["graph"]["projects"];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="evidence-group">
      <header>
        <h3>{label}</h3>
        <span>{items.length.toString().padStart(2, "0")}</span>
      </header>
      <div>
        {items.map((item) => (
          <button
            key={item.id}
            className={`evidence-card state-border-${item.state}`}
            aria-pressed={selectedId === item.id}
            onClick={() => onSelect(item.id)}
          >
            <span className="evidence-project">
              {projects.find(({ id }) => id === item.projectId)?.title ??
                "Portfolio-wide"}
            </span>
            <strong>{stateLabels[item.state]}</strong>
            <p>{item.observationSummary ?? item.rationale}</p>
            <span className="evidence-meta">
              {relevanceLabels[item.relevance]} ·{" "}
              {item.sourceRef ? "source linked" : "reviewed absence"}
              <b aria-hidden="true">→</b>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
function Brand() {
  return (
    <div className="brand" aria-label="Pheet home">
      <span className="brand-mark">P</span>
      <div>
        <strong>Pheet</strong>
        <small>see where the work fits</small>
      </div>
    </div>
  );
}
function Compatibility({ state }: { state: WebMcpState }) {
  const ready = state === "ready";
  const label = ready
    ? "WebMCP ready"
    : state === "unsupported"
      ? "Manual mode · WebMCP unsupported"
      : state === "error"
        ? "Manual mode · WebMCP error"
        : "Checking WebMCP…";
  return (
    <span className="compatibility" role="status">
      <i className={ready ? "supported" : ""} />
      {label}
    </span>
  );
}
function TrustFooter() {
  return (
    <footer className="trust-footer">
      <span>Evidence, not a verdict.</span>
      <p>
        Pheet describes evidence in the reviewed portfolio. It does not
        determine ability, rank candidates, or make hiring decisions.
      </p>
    </footer>
  );
}
function ErrorNotice({
  error,
  onRetry,
}: {
  error: NonNullable<Workspace["error"]>;
  onRetry: () => void;
}) {
  return (
    <div className="error-notice" role="alert">
      <div>
        <strong>{error.message}</strong>
        <small>Diagnostic {error.diagnosticId}</small>
      </div>
      {error.retryable && <button onClick={onRetry}>Retry</button>}
    </div>
  );
}
function ActivityStrip({ workspace }: { workspace: Workspace }) {
  const activity = workspace.activity[0];
  return (
    <aside className="activity-strip" aria-live="polite">
      <span className="activity-pulse" />
      <strong>{activity?.label ?? "Workspace ready"}</strong>
      <span>{activity?.detail ?? "Waiting for the next shared action"}</span>
      <code>{activity?.requestId ?? workspace.phase}</code>
    </aside>
  );
}
