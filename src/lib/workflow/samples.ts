import type { WorkflowDefinition } from "./types";

const DEMO_TOOLS = [
  "create_project",
  "add_task",
  "list_tasks",
  "get_project_summary",
];

export const SPACE_EXPLORER: WorkflowDefinition = {
  version: 1,
  id: "space_explorer",
  name: "Space Explorer",
  description:
    "An AI agent that creates a project and three tasks through MCP, then a tool node fetches the real summary",
  // Nodes
  nodes: [
    {
      id: "trigger",
      type: "trigger",
      position: { x: 0, y: 80 },
      data: {
        label: "Mission request",
        config: {
          input:
            "create a space exploration project, and three tasts, and summarize what created",
        },
      },
    },
    {
      id: "agent",
      type: "agent",
      position: { x: 300, y: 80 },
      data: {
        label: "Mission Planner",
        config: {
          instructions:
            "create the requested project with create_project, add each task with add_task, then report the project id.",
          mode: "demo",
          model: "claude-sonnet-5-5",
          maxToolsCalls: 6,
        },
      },
    },
    {
      id: "summary",
      type: "mcpTool",
      position: { x: 600, y: 80 },
      data: {
        label: "Fetch Summary",
        config: {
          toolName: "get_project_summary",
          arguments: { projectId: "{{ input.projectId }}" },
        },
      },
    },

    {
      id: "result",
      type: "output",
      position: { x: 900, y: 80 },
      data: { label: "Result", config: { format: "summary" } },
    },

    {
      id: "server",
      type: "mcpServer",
      position: { x: 450, y: 300 },
      data: {
        label: "MCP Flow Demo server",
        config: { serverId: "demo", allowedTools: DEMO_TOOLS },
      },
    },
  ],

  // Edges
  edges: [
    {
      id: "e-trigger-agent",
      source: "trigger",
      sourceHandle: "out",
      target: "agent",
      targetHandle: "in",
      type: "data",
    },
    {
      id: "e-agent-summary",
      source: "agent",
      sourceHandle: "out",
      target: "summary",
      targetHandle: "in",
      type: "data",
    },
    {
      id: "e-summary-result",
      source: "summary",
      sourceHandle: "out",
      target: "result",
      targetHandle: "in",
      type: "data",
    },
    {
      id: "e-agent-server",
      source: "server",
      sourceHandle: "server",
      target: "agent",
      targetHandle: "tools",
      type: "mcp",
    },
    {
      id: "m-server-summary",
      source: "server",
      sourceHandle: "server",
      target: "summary",
      targetHandle: "server",
      type: "mcp",
    },
  ],
};

export const PROJECT_HEALTH_CHECK: WorkflowDefinition = {
  version: 1,
  id: "project_health_check",
  name: "Project Health Checl",
  description:
    "Like Space Explorer, but a condirion node checks the real task count and picks a result path.",
  // Nodes
  nodes: [
    {
      id: "trigger",
      type: "trigger",
      position: { x: 0, y: 120 },
      data: {
        label: "Request",
        config: {
          input: "create a mars rover project with three tasks.",
        },
      },
    },
    {
      id: "agent",
      type: "agent",
      position: { x: 300, y: 120 },
      data: {
        label: "Planner",
        config: {
          instructions:
            "create the prooject and its tasks, then report the project id",
          mode: "demo",
          model: "claude-sonnet-5-5",
          maxToolsCalls: 6,
        },
      },
    },
    {
      id: "summary",
      type: "mcpTool",
      position: { x: 900, y: 120 },
      data: {
        label: "Fetch Summary",
        config: {
          toolName: "get_project_summary",
          arguments: { projectId: "{{ input.projectId }}" },
        },
      },
    },

    {
      id: "check",
      type: "condition",
      position: { x: 900, y: 120 },
      data: {
        label: "Enough tasks?",
        config: {
          left: "input.taskCount",
          operator: "greater_than",
          right: "2",
        },
      },
    },

    {
      id: "ready",
      type: "output",
      position: { x: 1200, y: 30 },
      data: {
        label: "Ready for launch",
        config: { format: "summary" },
      },
    },

    {
      id: "incomplete",
      type: "output",
      position: { x: 1200, y: 230 },
      data: {
        label: "Needs more tasks",
        config: { format: "json" },
      },
    },

    {
      id: "server",
      type: "mcpServer",
      position: { x: 450, y: 340 },
      data: {
        label: "MCP Flow Demo Server",
        config: { serverId: "demo", allowedTools: DEMO_TOOLS },
      },
    },
  ],

  // Edges
  edges: [
    {
      id: "e-trigger-agent",
      source: "trigger",
      sourceHandle: "out",
      target: "agent",
      targetHandle: "in",
      type: "data",
    },
    {
      id: "e-agent-summary",
      source: "agent",
      sourceHandle: "out",
      target: "summary",
      targetHandle: "in",
      type: "data",
    },
    {
      id: "e-summary-check",
      source: "summary",
      sourceHandle: "out",
      target: "check",
      targetHandle: "in",
      type: "data",
    },
    {
      id: "e-check-incomplete",
      source: "check",
      sourceHandle: "false",
      target: "incomplete",
      targetHandle: "in",
      type: "data",
    },
    {
      id: "m-server-agent",
      source: "server",
      sourceHandle: "server",
      target: "agent",
      targetHandle: "tools",
      type: "mcp",
    },
    {
      id: "m-server-summary",
      source: "server",
      sourceHandle: "server",
      target: "summary",
      targetHandle: "server",
      type: "mcp",
    },
  ],
};

export const SAMPLE_WORKFLOWS: WorkflowDefinition[] = [
  SPACE_EXPLORER,
  PROJECT_HEALTH_CHECK,
];

export function createEmptyWorkflow(): WorkflowDefinition {
  return {
    version: 1,
    id: `workflow-${Date.now().toString(36)}`,
    name: "Untitled workflow",
    description: "",
    nodes: [],
    edges: [],
  };
}
