export type NodeKind =
  | "trigger"
  | "agent"
  | "mcpServer"
  | "mcpTool"
  | "condition"
  | "output";

export type PortType = "data" | "mcp";

export type TriggerConfig = {
  input: string;
};

export type AgentMode = "demo" | "live";

export type AgentConfig = {
  instructions: string;
  mode: AgentMode;
  model: string;

  maxToolsCalls: number;
};

export type McpToolConfig = {
  toolName: string;
  arguments: Record<string, string>;
};

export type McpServerConfig = {
  serverId: string;
  allowedTools: string[];
};

export type ConditionOperator =
  | "equals"
  | "non_equals"
  | "greater_than"
  | "less_then"
  | "contains"
  | "is_empty"
  | "is_not_empty";

export type ConditionConfig = {
  left: string;
  operator: ConditionOperator;
  right: string;
};

export type OutputConfig = {
  format: "summary" | "json";
};

export type NodeConfig = {
  trigger: TriggerConfig;
  agent: AgentConfig;
  mcpServer: McpServerConfig;
  mcpTool: McpToolConfig;
  condition: ConditionConfig;
  output: OutputConfig;
};

// Nodes, Edges, Workflow

export type NodeData<K extends NodeKind = NodeKind> = {
  label: string;
  config: NodeConfig[K];
};

export type WorkflowNodeOf<K extends NodeKind> = {
  id: string;
  type: K;
  position: { x: number; y: number };
  data: NodeData<K>;
};

export type WorkflowNode = {
  [K in NodeKind]: WorkflowNodeOf<K>;
}[NodeKind];

export type WorkflowEdge = {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  type: PortType;
};

export type WorkflowDefinition = {
  version: 1;
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};

export type NodeStatus = "idle" | "running" | "success" | "error";
