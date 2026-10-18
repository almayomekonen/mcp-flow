import type { NodeData, NodeKind } from "@/src/lib/workflow/types";

type SummarizableNode = {
  [K in NodeKind]: { type: K; data: NodeData<K> };
}[NodeKind];

export type NodeSummary = { text: string; mono?: boolean; empty?: boolean };

const OPERATOR_SYMBOLS: Record<string, string> = {
  equals: "=",
  not_equals: "≠",
  greater_than: ">",
  less_than: "<",
  contains: "contains",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

export function summarizeNode(node: SummarizableNode): NodeSummary | null {
  switch (node.type) {
    case "trigger": {
      const input = node.data.config.input.trim();
      return input
        ? { text: `“${input}”` }
        : { text: "No input yet", empty: true };
    }
    case "agent": {
      const { mode, model, maxToolsCalls } = node.data.config;
      const label = mode === "demo" ? "Demo mode (simulated decisions)" : model;
      return { text: `${label} · max ${maxToolsCalls} tool calls` };
    }
    case "mcpServer": {
      const count = node.data.config.allowedTools.length;
      return count
        ? { text: `${count} allowed tool${count === 1 ? "" : "s"}` }
        : { text: "No tools allowed yet", empty: true };
    }
    case "mcpTool": {
      const name = node.data.config.toolName.trim();
      return name
        ? { text: `${name}()`, mono: true }
        : { text: "No tool selected", empty: true };
    }
    case "condition": {
      const { left, operator, right } = node.data.config;
      const unary = operator === "is_empty" || operator === "is_not_empty";
      return {
        text: `${left} ${OPERATOR_SYMBOLS[operator]}${unary ? "" : ` ${right}`}`,
        mono: true,
      };
    }
    case "output":
      return {
        text:
          node.data.config.format === "json"
            ? "Shows raw JSON"
            : "Shows a readable summary",
      };
  }
}
