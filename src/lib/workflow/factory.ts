import { getNodeDefinition } from "./node-catalog";
import type { NodeKind, WorkflowNode, WorkflowNodeOf } from "./types";

export function nextNodeId(
  kind: NodeKind,
  exsistingIds: Iterable<string>,
): string {
  const taken = new Set(exsistingIds);
  let n = 1;
  while (taken.has(`${kind}-${n}`)) n++;
  return `${kind}-${n}`;
}

export function createNode<K extends NodeKind>(
  kind: K,
  position: { x: number; y: number },
  exsistingIds: Iterable<string>,
): WorkflowNode {
  const definition = getNodeDefinition(kind);
  const node: WorkflowNodeOf<K> = {
    id: nextNodeId(kind, exsistingIds),
    type: kind,
    position,
    data: { label: definition.title, config: definition.defaultConfig() },
  };

  return node as unknown as WorkflowNode;
}

type Box = {
  position: { x: number; y: number };
  width?: number;
  height?: number;
};

export const DEFAULT_NODE_SIZE = { width: 240, height: 100 };

export function findFreePosition(
  desired: { x: number; y: number },
  existing: Box[],
  size = DEFAULT_NODE_SIZE,
  gap = 24,
): { x: number; y: number } {
  const overlaps = (x: number, y: number) =>
    existing.some((node) => {
      const w = node.width ?? DEFAULT_NODE_SIZE.width;
      const h = node.height ?? DEFAULT_NODE_SIZE.height;
      return (
        x < node.position.x + w + gap &&
        x + size.width + gap > node.position.x &&
        y < node.position.y + h + gap &&
        y + size.height + gap > node.position.y
      );
    });

  let { x, y } = desired;
  for (let attempt = 0; attempt < 50 && overlaps(x, y); attempt++) {
    y += size.height / 2;
    if (attempt % 6 === 5) {
      y = desired.y;
      x += size.width + gap;
    }
  }
  return { x, y };
}
