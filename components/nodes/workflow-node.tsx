"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CircleCheck, CircleX, Loader } from "lucide-react";
import { memo, type CSSProperties } from "react";
import { getNodeDefinition, type PortSpec } from "@/src/lib/workflow/node-catalog";
import type { NodeStatus } from "@/src/lib/workflow/types";
import { cn } from "@/lib/utils";
import { useEditor } from "@/components/editor/editor-context";
import type { FlowNode } from "@/components/editor/flow-types";
import { NODE_STYLES } from "./nodes-style";
import { summarizeNode } from "./node-summary";

const DATA_HANDLE =
  "!h-3 !w-3 !rounded-full !border-2 !border-[var(--card)] !bg-zinc-400";
const MCP_HANDLE =
  "!h-3 !w-3 !rounded-[3px] !rotate-45 !border-2 !border-[var(--card)] !bg-sky-400";

function handleStyle(index: number, count: number): CSSProperties | undefined {
  if (count <= 1) return undefined;
  return { top: `${((index + 1) / (count + 1)) * 100}%` };
}

function StatusBadge({ status }: { status: NodeStatus }) {
  if (status === "running")
    return <Loader className="size-3.5 animate-spin text-sky-300" aria-label="Running" />;
  if (status === "success")
    return <CircleCheck className="size-3.5 text-emerald-400" aria-label="Succeeded" />;
  if (status === "error")
    return <CircleX className="size-3.5 text-red-400" aria-label="Failed" />;
  return null;
}

function WorkflowNodeComponent({ id, type, data, selected }: NodeProps<FlowNode>) {
  const { nodeStatus } = useEditor();
  const definition = getNodeDefinition(type);
  const style = NODE_STYLES[type];
  const Icon = style.icon;
  const status = nodeStatus[id] ?? "idle";

  const dataInputs = definition.inputs.filter((p) => p.type === "data");
  const mcpInputs = definition.inputs.filter((p) => p.type === "mcp");
  const dataOutputs = definition.output.filter((p) => p.type === "data");
  const mcpOutputs = definition.output.filter((p) => p.type === "mcp");
  const summary = summarizeNode({ type, data } as Parameters<typeof summarizeNode>[0]);

  return (
    <div
      className={cn(
        "group relative w-60 rounded-xl border bg-card/95 text-card-foreground shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)] backdrop-blur-sm transition-[border-color,box-shadow] duration-150",
        "border-white/8 hover:border-white/16",
        selected && "border-primary/70 hover:border-primary/70 ring-1 ring-primary/40",
        status === "running" && "node-running border-sky-400/70",
        status === "success" && "border-emerald-400/50",
        status === "error" && "border-red-400/60",
      )}
    >
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2.5">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg ring-1", style.tile)}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium leading-tight">{data.label}</div>
          <div className="truncate text-[11px] text-muted-foreground">{definition.title}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      {summary && (
        <div className="border-t border-white/6 px-3 py-2">
          <p
            className={cn(
              "line-clamp-2 text-[11.5px] leading-snug text-muted-foreground",
              summary.mono && "font-mono text-[11px]",
              summary.empty && "italic text-muted-foreground/60",
            )}
          >
            {summary.text}
          </p>
        </div>
      )}

      {type === "condition" && (
        <div className="pointer-events-none absolute inset-y-0 right-3 flex flex-col justify-around py-[18%] text-[10px] font-medium">
          <span className="text-emerald-400/80">true</span>
          <span className="text-red-400/80">false</span>
        </div>
      )}

      {dataInputs.map((port, i) => (
        <Handle
          key={port.id}
          id={port.id}
          type="target"
          position={Position.Left}
          className={DATA_HANDLE}
          style={handleStyle(i, dataInputs.length)}
        />
      ))}
      {dataOutputs.map((port, i) => (
        <Handle
          key={port.id}
          id={port.id}
          type="source"
          position={Position.Right}
          className={cn(
            DATA_HANDLE,
            type === "condition" && (port.id === "true" ? "bg-emerald-400!" : "bg-red-400!"),
          )}
          style={handleStyle(i, dataOutputs.length)}
        />
      ))}
      {mcpInputs.map((port) => (
        <McpPort key={port.id} port={port} kind="target" />
      ))}
      {mcpOutputs.map((port) => (
        <McpPort key={port.id} port={port} kind="source" />
      ))}
    </div>
  );
}

function McpPort({ port, kind }: { port: PortSpec; kind: "source" | "target" }) {
  const isTarget = kind === "target";
  return (
    <>
      <Handle
        id={port.id}
        type={kind}
        position={isTarget ? Position.Bottom : Position.Top}
        className={MCP_HANDLE}
      />
      {port.label && (
        <span
          className={cn(
            "pointer-events-none absolute left-[calc(50%+12px)] whitespace-nowrap text-[10px] font-medium text-sky-300/70",
            isTarget ? "-bottom-4.5" : "-top-4.5",
          )}
        >
          {port.label}
        </span>
      )}
    </>
  );
}

export const WorkflowNode = memo(WorkflowNodeComponent);
