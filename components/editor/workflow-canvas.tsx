"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type EdgeTypes,
  type IsValidConnection,
  type NodeTypes,
  type OnConnectEnd,
} from "@xyflow/react";
import { useCallback, type DragEvent } from "react";
import { isNodeKind } from "@/src/lib/workflow/node-catalog";
import { cn } from "@/lib/utils";
import { WorkflowNode } from "@/components/nodes/workflow-node";
import { DataEdge, McpEdge } from "@/components/nodes/workflow-edges";
import { CanvasEmptyState } from "./canvas-empty-state";
import { useEditor } from "./editor-context";
import type { FlowEdge, FlowNode } from "./flow-types";


export const NODE_DRAG_TYPE = "application/x-mcp-flow-node";

const nodeTypes: NodeTypes = {
  trigger: WorkflowNode,
  agent: WorkflowNode,
  mcpServer: WorkflowNode,
  mcpTool: WorkflowNode,
  condition: WorkflowNode,
  output: WorkflowNode,
};

const edgeTypes: EdgeTypes = {
  data: DataEdge,
  mcp: McpEdge,
};

const MINIMAP_COLORS: Record<string, string> = {
  trigger: "#fdba74",
  agent: "#c4b5fd",
  mcpServer: "#7dd3fc",
  mcpTool: "#5eead4",
  condition: "#f0abfc",
  output: "#a1a1aa",
};

export function WorkflowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    explainConnection,
    addNode,
    notice,
    showNotice,
  } = useEditor();
  const { screenToFlowPosition } = useReactFlow<FlowNode, FlowEdge>();

  const isValidConnection: IsValidConnection<FlowEdge> = useCallback(
    (connection) =>
      explainConnection({
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
      }) === null,
    [explainConnection],
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (_event, state) => {
      if (state.isValid || !state.fromHandle || !state.toHandle) return;
      const from = state.fromHandle;
      const to = state.toHandle;
      const [source, target] = from.type === "source" ? [from, to] : [to, from];
      const reason = explainConnection({
        source: source.nodeId,
        sourceHandle: source.id ?? null,
        target: target.nodeId,
        targetHandle: target.id ?? null,
      });
      if (reason) showNotice(reason, "error");
    },
    [explainConnection, showNotice],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    if (!event.dataTransfer.types.includes(NODE_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      const kind = event.dataTransfer.getData(NODE_DRAG_TYPE);
      if (!isNodeKind(kind)) return;
      event.preventDefault();
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(kind, { x: position.x - 120, y: position.y - 30 });
    },
    [addNode, screenToFlowPosition],
  );

  return (
    <div className="relative h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow<FlowNode, FlowEdge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        isValidConnection={isValidConnection}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.75}
        snapToGrid
        snapGrid={[10, 10]}
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="var(--canvas-dot)" />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeBorderRadius={6}
          nodeColor={(node) => MINIMAP_COLORS[node.type ?? ""] ?? "#71717a"}
          className="md:block!"
        />
      </ReactFlow>

      {nodes.length === 0 && <CanvasEmptyState />}

      {notice && (
        <div
          key={notice.id}
          role="status"
          className={cn(
            "pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-lg border px-3 py-2 text-xs shadow-lg",
            notice.tone === "error"
              ? "border-red-400/30 bg-red-950/80 text-red-200"
              : "border-white/10 bg-popover/95 text-popover-foreground",
          )}
        >
          {notice.message}
        </div>
      )}
    </div>
  );
}
