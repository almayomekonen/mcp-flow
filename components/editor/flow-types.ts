import { Node, Edge } from "@xyflow/react";
import type {
  NodeData,
  NodeKind,
  PortType,
  WorkflowDefinition,
} from "@/src/lib/workflow/types";

export type FlowNode = { [K in NodeKind]: Node<NodeData<K>, K> }[NodeKind];
export type FlowEdge = Edge<Record<string, never>, PortType>;

export function toFlowNodes(workflow: WorkflowDefinition): FlowNode[] {
  return workflow.nodes.map(
    (node) => ({ ...node, data: structuredClone(node.data) }) as FlowNode,
  );
}
export function toFlowEdges(workflow: WorkflowDefinition): FlowEdge[] {
  return workflow.edges.map((edge) => ({ ...edge }));
}
