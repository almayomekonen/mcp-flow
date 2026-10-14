import { getNodeDefinition } from "./node-catalog";
import type { NodeKind, WorkflowNode, WorkflowEdge } from "./types";

export function nextNodeId(
  kind: NodeKind,
  exsistingIds: Iterable<string>,
): string {
  const taken = new Set(exsistingIds);
  let n = 1;
  while (taken.has(`${kind}-${n}`)) n++;
  return `${kind}-${n}`;
}

export function createNode() {}
