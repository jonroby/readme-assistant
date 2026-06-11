import { generateText, stepCountIs, type ToolSet } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Project } from '@/lib/project';
import { buildSystemPrompt } from '@/agent/system-prompt';
import {
  tools,
  resolveToolCall,
  type ProposeReadmeInput,
  type ToolInputs,
  type ToolName,
} from '@/agent/tools';

/**
 * Headless eval harness for the README agent.
 *
 * The agent is 1-to-1 with the app: the SAME tool objects (agent/tools — same
 * descriptions and input schemas), the SAME runners via the SAME resolveToolCall
 * dispatcher the browser uses, the SAME system prompt, model, and step cap. The
 * only difference is transport. In the app the tools carry no `execute` and
 * resolve in the browser (use-chat-session's onToolCall); a Node eval has no
 * browser, so we attach `execute` here — but it dispatches through the very same
 * resolveToolCall, so there is nothing to drift.
 */

/** A captured tool call: name + input, in the order the model made them. */
export type ToolCallRecord = { name: string; input: unknown };

export type AgentRun = {
  /** Every tool call across all steps, in order. */
  toolCalls: ToolCallRecord[];
  /** Names of tools whose runner threw (empty on a clean run). */
  toolErrors: string[];
  /** Number of LLM steps the loop took (≤ 6, the app cap). */
  stepCount: number;
  /** The model's final assistant text. */
  text: string;
  /** The README content from the last proposeReadme call, if any. */
  proposedReadme: string | null;
  /** Raw steps, for assertions the helpers above don't cover. */
  steps: unknown[];
};

/**
 * Run the agent against a fixture project with a single user prompt and collect
 * its trajectory. Mirrors app/api/chat/route.ts: same model, system prompt, and
 * stepCountIs(6) cap.
 */
export async function runAgent(
  project: Project,
  userPrompt: string,
): Promise<AgentRun> {
  const toolCalls: ToolCallRecord[] = [];
  let proposedReadme: string | null = null;
  // Names of tools whose runner threw. A throwing execute surfaces to the model
  // as a tool error it silently works around — the trajectory could still look
  // fine — so we record it here for an explicit happy-path assertion.
  const toolErrors: string[] = [];

  // Attach `execute` to each app tool: record the call, then dispatch through
  // the shared resolver. The tool's description + inputSchema come straight from
  // agent/tools, so the model sees exactly the app's prompt.
  const evalTools = Object.fromEntries(
    (Object.keys(tools) as ToolName[]).map((name) => [
      name,
      {
        ...tools[name],
        execute: async (input: ToolInputs[ToolName]) => {
          toolCalls.push({ name, input });
          if (name === 'proposeReadme') {
            proposedReadme = (input as ProposeReadmeInput).content;
          }
          try {
            return resolveToolCall(name, input, project);
          } catch (e) {
            toolErrors.push(name);
            throw e; // still surface to the model, as in the app
          }
        },
      },
    ]),
  ) as ToolSet;

  const result = await generateText({
    model: openai('gpt-4o'),
    // Derived, not hardcoded: matches the app's `hasProject` so a future
    // no-project eval gets the same (undefined) prompt the app would.
    system: buildSystemPrompt(project != null),
    prompt: userPrompt,
    tools: evalTools,
    stopWhen: stepCountIs(6),
  });

  return {
    toolCalls,
    toolErrors,
    stepCount: result.steps.length,
    text: result.text,
    proposedReadme,
    steps: result.steps,
  };
}

/** Names of the tools called, in order — handy for trajectory assertions. */
export function toolSequence(run: AgentRun): string[] {
  return run.toolCalls.map((c) => c.name);
}

/** How many times a given tool was called. */
export function countTool(run: AgentRun, name: string): number {
  return run.toolCalls.filter((c) => c.name === name).length;
}
