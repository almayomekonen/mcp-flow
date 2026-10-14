import type { NodeConfig, NodeKind, PortType } from "./types";

export type PortSpec = {
  id: string;
  type: PortType;
  label?: string;
  multiple?: boolean;
};

export type NodeCategory = "Triggers" | "AI" | "MCP" | "Logic" | "Output";

export type NodeDefinition<K extends NodeKind = NodeKind> = {
  kind: K;
  title: string;
  description: string;
  category: NodeCategory;
  inputs: PortSpec[];
  output: PortSpec[];
  defaultConfig: () => NodeConfig[K];
};

type Catalog = { [K in NodeKind]: NodeDefinition<K> };

export const NODE_CATALOG: Catalog = {
  trigger: {
    kind: "trigger",
    title: "Manual Trigger",
    description: "Starts the workflow with a request you type.",
    category: "Triggers",
    inputs: [],
    output: [{ id: "out", type: "data" }],
    defaultConfig: () => ({ input: "" }),
  },
  agent: {
    kind: "agent",
    title: "AI Agent",
    description: "Reads the request and decided which permitted tools to call.",
    category: "AI",
    inputs: [
      { id: "in", type: "data" },
      { id: "tools", type: "mcp", label: "tools", multiple: true },
    ],
    output: [{ id: "out", type: "data" }],
    defaultConfig: () => ({
      instructions:
        "You are a helpful assistant. Use the available tools to complete the request.",
      mode: "demo",
      model: "claude-sonnet-5-5",
      maxToolsCalls: 6,
    }),
  },
  mcpServer: {
    kind: "mcpServer",
    title: "MCP Server",
    description: "A configured MCP server. Attach it to grant tool access.",
    category: "MCP",
    inputs: [],
    output: [{ id: "server", type: "mcp", label: "Provided tools" }],
    defaultConfig: () => ({ serverId: "demo", allowedTools: [] }),
  },
  mcpTool: {
    kind: "mcpTool",
    title: "MCP Tool",
    description: "Calls one specific tool on an attached MCP server",
    category: "MCP",
    inputs: [
      { id: "in", type: "data" },
      { id: "server", type: "mcp", label: "Server" },
    ],
    output: [{ id: "server", type: "mcp", label: "Provided tools" }],
    defaultConfig: () => ({ toolName: "", arguments: {} }),
  },
  condition: {
    kind: "condition",
    title: "Condition",
    description: "Compare a value and routes data to the true or false path.",
    category: "Logic",
    inputs: [{ id: "in", type: "data" }],
    output: [
      { id: "true", type: "data", label: "true" },
      { id: "false", type: "data", label: "false" },
    ],
    defaultConfig: () => ({ left: "input.", operator: "equals", right: "" }),
  },
  output: {
    kind: "output",
    title: "Output",
    description: "Shows the final result of the workflow.",
    category: "Output",
    inputs: [{ id: "in", type: "data" }],
    output: [],
    defaultConfig: () => ({ format: "summary" }),
  },
};

export const NODE_CATEGORIES: NodeCategory[] = [
  "Triggers",
  "AI",
  "MCP",
  "Logic",
  "Output",
];

export const NODE_KINDS = Object.keys(NODE_CATALOG) as NodeKind[];

export function getNodeDefinition<K extends NodeKind>(
  kind: K,
): NodeDefinition<K> {
  return NODE_CATALOG[kind];
}

export function isNodeKind(value: unknown): value is NodeKind {
  return typeof value === "string" && value in NODE_CATALOG;
}
