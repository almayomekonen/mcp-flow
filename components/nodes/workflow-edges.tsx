"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import { memo } from "react";
import { useEditor } from "@/components/editor/editor-context";
import type { FlowEdge } from "@/components/editor/flow-types";

function DataEdgeComponent(props: EdgeProps<FlowEdge>) {
  const { nodeStatus } = useEditor();
  const [path] = getBezierPath(props);
  const sourceStatus = nodeStatus[props.source];
  const targetStatus = nodeStatus[props.target];
  const flowing = sourceStatus === "success" && targetStatus === "running";
  const done = sourceStatus === "success" && targetStatus === "success";

  return (
    <BaseEdge
      id={props.id}
      path={path}
      markerEnd={props.markerEnd}
      className={flowing ? "edge-flowing" : undefined}
      style={{
        strokeWidth: props.selected ? 2.25 : 1.75,
        stroke: props.selected
          ? "var(--primary)"
          : flowing
            ? "oklch(0.75 0.13 230)"
            : done
              ? "oklch(0.72 0.14 160 / 75%)"
              : "var(--edge-data)",
      }}
    />
  );
}

function McpEdgeComponent(props: EdgeProps<FlowEdge>) {
  const [path] = getBezierPath(props);
  return (
    <BaseEdge
      id={props.id}
      path={path}
      style={{
        strokeWidth: props.selected ? 2 : 1.5,
        strokeDasharray: "5 5",
        stroke: props.selected ? "var(--primary)" : "var(--edge-mcp)",
        opacity: props.selected ? 1 : 0.7,
      }}
    />
  );
}

export const DataEdge = memo(DataEdgeComponent);
export const McpEdge = memo(McpEdgeComponent);
