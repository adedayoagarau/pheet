"use client";

import { useCallback, useReducer, useRef } from "react";
import { executeWorkspaceCommand, type WorkspaceCommandName } from "./commands";
import type { ActionResult } from "./actions";
import type { DemoBundle } from "./schemas";
import {
  appendActivity,
  initialWorkspace,
  workspaceReducer,
  type Workspace,
} from "./workspace";

export type CommandActor = "human" | "agent";

export function useWorkspaceController(demo: DemoBundle) {
  const [workspace, dispatch] = useReducer(workspaceReducer, initialWorkspace);
  const stateRef = useRef(workspace);
  const queueRef = useRef(Promise.resolve());
  const requestSequence = useRef(0);

  const commit = useCallback((next: Workspace) => {
    stateRef.current = next;
    dispatch({ type: "replace", workspace: next });
  }, []);

  const run = useCallback(
    (actor: CommandActor, command: WorkspaceCommandName, input: unknown = {}) =>
      new Promise<ActionResult<Record<string, unknown>>>((resolve) => {
        queueRef.current = queueRef.current
          .catch(() => undefined)
          .then(async () => {
            requestSequence.current += 1;
            const requestId = `request_${requestSequence.current}`;
            const running = appendActivity(stateRef.current, {
              requestId,
              actor,
              command,
              status: "running",
              label: `${actor === "agent" ? "Agent" : "Human"} · ${command.replaceAll("_", " ")}`,
              detail: "Running shared workspace action",
            });
            commit(running);
            await new Promise((continueAction) =>
              setTimeout(continueAction, 80),
            );
            const result = executeWorkspaceCommand(
              running,
              command,
              input,
              demo,
            );
            if (!result.ok) {
              const failed = appendActivity(
                { ...running, error: result.error },
                {
                  requestId,
                  actor,
                  command,
                  status: "error",
                  label: `${actor === "agent" ? "Agent" : "Human"} action failed`,
                  detail: result.error.message,
                },
              );
              commit(failed);
              resolve(result);
              return;
            }
            const succeeded = appendActivity(
              { ...result.value.workspace, error: undefined },
              {
                requestId,
                actor,
                command,
                status: "success",
                label: `${actor === "agent" ? "Agent" : "Human"} · ${command.replaceAll("_", " ")}`,
                detail: result.value.summary,
              },
            );
            commit(succeeded);
            resolve({ ok: true, value: result.value.output });
          });
      }),
    [commit, demo],
  );

  return { workspace, run };
}
