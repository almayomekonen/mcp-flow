"use client";

import {
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { checkConnection } from "@/src/lib/workflow/connection";
import { createNode, findFreePosition } from "@/src/lib/workflow/factory";
import { SPACE_EXPLORER } from "@/src/lib/workflow/samples";
import type {
  NodeConfig,
  NodeKind,
  NodeStatus,
  WorkflowDefinition,
} from "@/src/lib/workflow/types";
import { toFlowEdges, toFlowNodes, type FlowEdge, type FlowNode } from "./flow-types";

export type Notice = { id: number; message: string; tone: "info" | "error" };

type EditorContextValue = {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  workflowDescription: string;

  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange<FlowEdge>;
  onConnect: (connection: Connection) => void;
  explainConnection: (connection: Connection) => string | null;

  selectedNode: FlowNode | undefined;
  selectNode: (id: string | null) => void;
  addNode: (kind: NodeKind, position?: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  updateLabel: (id: string, label: string) => void;
  updateConfig: <K extends NodeKind>(id: string, patch: Partial<NodeConfig[K]>) => void;
  loadWorkflow: (workflow: WorkflowDefinition) => void;

  explainMode: boolean;
  setExplainMode: (on: boolean) => void;

  nodeStatus: Record<string, NodeStatus>;
  previewRunning: boolean;
  previewFinished: boolean;
  startStatePreview: () => void;
  resetStatePreview: () => void;

  notice: Notice | null;
  showNotice: (message: string, tone?: Notice["tone"]) => void;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const value = useContext(EditorContext);
  if (!value) throw new Error("useEditor must be used inside <EditorProvider>");
  return value;
}

const PREVIEW_STEP_MS = 650;

export function EditorProvider({ children }: { children: ReactNode }) {
  const reactFlow = useReactFlow<FlowNode, FlowEdge>();

  const [workflowName, setWorkflowName] = useState(SPACE_EXPLORER.name);
  const [workflowDescription, setWorkflowDescription] = useState(SPACE_EXPLORER.description);
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(toFlowNodes(SPACE_EXPLORER));
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdge>(toFlowEdges(SPACE_EXPLORER));
  const [explainMode, setExplainMode] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  // --- Notices -------------------------------------------------------------
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showNotice = useCallback((message: string, tone: Notice["tone"] = "info") => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice({ id: Date.now(), message, tone });
    noticeTimer.current = setTimeout(() => setNotice(null), 3200);
  }, []);

  // --- Connections ---------------------------------------------------------
  const explainConnection = useCallback(
    (connection: Connection) => {
      const result = checkConnection(connection, nodes, edges);
      return result.ok ? null : result.reason;
    },
    [nodes, edges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const result = checkConnection(connection, nodes, edges);
      if (!result.ok) {
        showNotice(result.reason, "error");
        return;
      }
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            id: `${result.type === "mcp" ? "m" : "e"}-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
            type: result.type,
          },
          current,
        ),
      );
    },
    [nodes, edges, setEdges, showNotice],
  );

  // --- Node editing --------------------------------------------------------
  const selectedNode = useMemo(() => nodes.find((n) => n.selected), [nodes]);

  const selectNode = useCallback(
    (id: string | null) => {
      setNodes((current) => current.map((n) => ({ ...n, selected: n.id === id })));
      setEdges((current) => current.map((e) => ({ ...e, selected: false })));
    },
    [setNodes, setEdges],
  );

  const addNode = useCallback(
    (kind: NodeKind, position?: { x: number; y: number }) => {
      setNodes((current) => {
        let at = position;
        if (!at) {
          const center = reactFlow.screenToFlowPosition({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2.4,
          });
          at = findFreePosition(
            { x: Math.round(center.x - 120), y: Math.round(center.y - 50) },
            current.map((n) => ({
              position: n.position,
              width: n.measured?.width,
              height: n.measured?.height,
            })),
          );
        }
        const node = createNode(kind, at, current.map((n) => n.id)) as FlowNode;
        return [...current.map((n) => ({ ...n, selected: false })), { ...node, selected: true }];
      });
    },
    [reactFlow, setNodes],
  );

  const deleteNode = useCallback(
    (id: string) => {
      void reactFlow.deleteElements({ nodes: [{ id }] });
    },
    [reactFlow],
  );

  const updateLabel = useCallback(
    (id: string, label: string) => {
      setNodes((current) =>
        current.map((n) => (n.id === id ? ({ ...n, data: { ...n.data, label } } as FlowNode) : n)),
      );
    },
    [setNodes],
  );

  const updateConfig = useCallback(
    <K extends NodeKind>(id: string, patch: Partial<NodeConfig[K]>) => {
      setNodes((current) =>
        current.map((n) =>
          n.id === id
            ? ({ ...n, data: { ...n.data, config: { ...n.data.config, ...patch } } } as FlowNode)
            : n,
        ),
      );
    },
    [setNodes],
  );

  // --- Execution state preview (placeholder until Milestone 3) -------------
  const [nodeStatus, setNodeStatus] = useState<Record<string, NodeStatus>>({});
  const [previewRunning, setPreviewRunning] = useState(false);
  const [previewFinished, setPreviewFinished] = useState(false);
  const previewTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearPreviewTimers = useCallback(() => {
    previewTimers.current.forEach(clearTimeout);
    previewTimers.current = [];
  }, []);

  const resetStatePreview = useCallback(() => {
    clearPreviewTimers();
    setNodeStatus({});
    setPreviewRunning(false);
    setPreviewFinished(false);
  }, [clearPreviewTimers]);


  const startStatePreview = useCallback(() => {
    resetStatePreview();
    const order = nodes
      .filter((n) => n.type !== "mcpServer")
      .sort((a, b) => a.position.x - b.position.x || a.position.y - b.position.y);
    if (order.length === 0) return;

    setPreviewRunning(true);
    order.forEach((node, index) => {
      previewTimers.current.push(
        setTimeout(() => setNodeStatus((s) => ({ ...s, [node.id]: "running" })), index * PREVIEW_STEP_MS),
        setTimeout(
          () => setNodeStatus((s) => ({ ...s, [node.id]: "success" })),
          (index + 1) * PREVIEW_STEP_MS,
        ),
      );
    });
    previewTimers.current.push(
      setTimeout(() => {
        setPreviewRunning(false);
        setPreviewFinished(true);
      }, order.length * PREVIEW_STEP_MS),
    );
  }, [nodes, resetStatePreview]);

  useEffect(() => clearPreviewTimers, [clearPreviewTimers]);

  // --- Loading workflows ---------------------------------------------------
  const loadWorkflow = useCallback(
    (workflow: WorkflowDefinition) => {
      resetStatePreview();
      setWorkflowName(workflow.name);
      setWorkflowDescription(workflow.description);
      setNodes(toFlowNodes(workflow));
      setEdges(toFlowEdges(workflow));
      requestAnimationFrame(() => {
        void reactFlow.fitView({ padding: 0.2, duration: 300 });
      });
    },
    [reactFlow, resetStatePreview, setEdges, setNodes],
  );

  const value: EditorContextValue = {
    workflowName,
    setWorkflowName,
    workflowDescription,
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    explainConnection,
    selectedNode,
    selectNode,
    addNode,
    deleteNode,
    updateLabel,
    updateConfig,
    loadWorkflow,
    explainMode,
    setExplainMode,
    nodeStatus,
    previewRunning,
    previewFinished,
    startStatePreview,
    resetStatePreview,
    notice,
    showNotice,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}
