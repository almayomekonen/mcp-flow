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
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { checkConnection } from "@/src/lib/workflow/connection";
import { createNode, findFreePosition } from "@/src/lib/workflow/factory";
import { SPACE_EXPLORER } from "@/src/lib/workflow/samples";
import {
  NodeConfig,
  NodeKind,
  NodeStatus,
  WorkflowDefinition,
} from "@/src/lib/workflow/types";

import {
  toFlowNodes,
  toFlowEdges,
  type FlowEdge,
  type FlowNode,
} from "@/components/editor/flow-types";

