import { getNodeDefinition, type PortSpec } from "./node-catalog";
import type { WorkflowNode, WorkflowEdge, PortType } from "./types";

export type ConnectionRequest = {
  source: string;
  target: string;
  sourceHandle: string | null;
  targetHandle: string | null;
};

export type ConnectionCheck =
  | { ok: true; type: PortType }
  | { ok: false; error: string };

type NodeLike = Pick<WorkflowNode, "id" | "type">;
type EdgeLike = Pick<WorkflowEdge, "source" | "target"> & {
  sourceHandle: string | null;
  targetHandle: string | null;
};

export function findPort(
  node: NodeLike,
  handle: string | null,
  direction: "input" | "output",
): PortSpec | undefined {
  const definition = getNodeDefinition(node.type);
  const ports = direction === "input" ? definition.inputs : definition.output;

  return ports.find((port) => port.id === handle);
}

export function checkConnection(
  request: ConnectionRequest,
  nodes: NodeLike[],
  edges: EdgeLike[],
): ConnectionCheck {
  if (request.source === request.target) {
    return { ok: false, error: "Source and target cannot be the same" };
  }

  const sourceNode = nodes.find((node) => node.id === request.source);
  const targetNode = nodes.find((node) => node.id === request.target);

  if (!sourceNode || !targetNode) {
    return { ok: false, error: "Source or target not found" };
  }

  const sourcePort = findPort(sourceNode, request.sourceHandle, "output");
  const targetPort = findPort(targetNode, request.targetHandle, "input");

  if (!sourcePort || !targetPort) {
    return { ok: false, error: "SourcePort and targetPort not valid" };
  }

  if (sourcePort.type !== targetPort.type) {
    return { ok: false, error: "SourcePort and targetPort not valid" };
  }

  const duplicate = edges.some(
    (edge) =>
      edge.source === request.source &&
      edge.sourceHandle === request.sourceHandle &&
      edge.target === request.target &&
      edge.targetHandle === request.targetHandle,
  );

  if (duplicate) {
    return { ok: false, error: "This ports are already connected" };
  }

  if (!targetPort?.multiple) {
    const singleConnection = edges.some(
      (edge) =>
        edge.target === request.target &&
        edge.targetHandle === request.targetHandle,
    );

    if (singleConnection) {
      return { ok: false, error: "This input already has a connection" };
    }
  }

  return { ok: true, type: sourcePort.type };
}
