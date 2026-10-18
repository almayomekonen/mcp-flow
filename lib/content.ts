import type { NodeKind } from "@/src/lib/workflow/types";

export type CodeReference = { path: string; note: string; planned?: boolean };

export type Explanation = {
  what: string;
  why: string;
  dataIn: string;
  dataOut: string;
  talksTo: string;
  status: string;
  code: CodeReference[];
};

const SHARED_CODE: CodeReference[] = [
  {
    path: "src/lib/workflow/node-catalog.ts",
    note: "Ports and default config for every node kind.",
  },
  {
    path: "src/components/nodes/workflow-node.tsx",
    note: "How the node is drawn on the canvas.",
  },
];

export const EXPLANATIONS: Record<NodeKind, Explanation> = {
  trigger: {
    what: "Starts a workflow run with the text you type in its configuration.",
    why: "Every run needs a defined starting point and starting data. The engine begins here.",
    dataIn: "Nothing. It is the first node.",
    dataOut: '{ input: "<your request>" }',
    talksTo: "The workflow engine, which hands its output to the next node.",
    status: "Visual and configurable now. Starts real runs from Milestone 3.",
    code: [
      ...SHARED_CODE,
      { path: "src/lib/engine/", note: "Execution engine.", planned: true },
    ],
  },
  agent: {
    what: "Reads the incoming request and decides which tools to call, and in what order.",
    why: "A fixed pipeline cannot interpret free-form requests. The agent turns intent into tool calls.",
    dataIn: "The output of the previous node (usually the trigger's request).",
    dataOut:
      "The agent's final answer plus the structured results of its tool calls.",
    talksTo:
      "The model provider (live mode) and the MCP client, but only for tools allowlisted on the attached MCP Server.",
    status:
      "Visual and configurable now. Demo mode in Milestone 4, real model tool calling in Milestone 5.",
    code: [
      ...SHARED_CODE,
      { path: "src/lib/agent/", note: "Bounded agent loop.", planned: true },
    ],
  },
  mcpServer: {
    what: "Represents one locally configured MCP server and the tools you allow from it.",
    why: "Tool access should be explicit. Attaching a server with an allowlist is how a node gets permission.",
    dataIn: "None. It provides tools; it does not process data.",
    dataOut: "A tool connection (dashed edge) to Agent or MCP Tool nodes.",
    talksTo:
      "The MCP client on the Next.js server, which talks to the real server over stdio.",
    status: "Visual now. Real connection and tool discovery in Milestone 4.",
    code: [
      ...SHARED_CODE,
      { path: "src/lib/mcp/", note: "MCP client manager.", planned: true },
      {
        path: "servers/demo-server/",
        note: "MCP Flow Demo Server.",
        planned: true,
      },
    ],
  },
  mcpTool: {
    what: "Calls one specific MCP tool with arguments you configure.",
    why: "Some steps should always happen exactly the same way, without a model deciding.",
    dataIn:
      "Upstream data. Arguments can reference it, e.g. {{ input.projectId }}.",
    dataOut: "The tool result returned by the MCP server.",
    talksTo: "The MCP client, through the attached MCP Server node.",
    status: "Visual and configurable now. Real tool calls in Milestone 4.",
    code: [
      ...SHARED_CODE,
      { path: "src/lib/mcp/", note: "Tool invocation.", planned: true },
    ],
  },
  condition: {
    what: "Compares one value against another and sends data down the true or false path.",
    why: "Workflows often need to branch. A fixed list of operators keeps that safe; no user code is evaluated.",
    dataIn: "Upstream data, read with a path such as input.taskCount.",
    dataOut: "The same data, sent only out of the matching port.",
    talksTo: "The workflow engine, which skips the branch that was not taken.",
    status:
      "Visual and configurable now. Evaluated by the engine in Milestone 3.",
    code: [
      ...SHARED_CODE,
      { path: "src/lib/engine/", note: "Condition evaluation.", planned: true },
    ],
  },
  output: {
    what: "Displays the final result of the workflow.",
    why: "Gives each run a clear end point and a readable result.",
    dataIn: "Whatever the previous node produced.",
    dataOut: "Nothing. Shown in the Execution Inspector.",
    talksTo: "The Execution Inspector in the UI.",
    status: "Visual and configurable now. Shows real results from Milestone 3.",
    code: [
      ...SHARED_CODE,
      {
        path: "src/components/editor/execution-inspector.tsx",
        note: "Where results appear.",
      },
    ],
  },
};
