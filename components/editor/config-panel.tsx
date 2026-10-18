"use client";

import { Trash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNodeDefinition } from "@/src/lib/workflow/node-catalog";
import { cn } from "@/lib/utils";
import { NODE_STYLES } from "@/components/nodes/nodes-style";
import { Field, NodeConfigForm } from "./config-forms";
import { useEditor } from "./editor-context";
import { ExplainCard } from "./explanation-card";

export function ConfigPanel() {
  const { selectedNode } = useEditor();
  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-sidebar-border bg-sidebar">
      {selectedNode ? <NodeSettings key={selectedNode.id} /> : <WorkflowOverview />}
    </aside>
  );
}

function NodeSettings() {
  const { selectedNode: node, updateLabel, deleteNode, selectNode, explainMode } = useEditor();
  if (!node) return null;
  const definition = getNodeDefinition(node.type);
  const style = NODE_STYLES[node.type];
  const Icon = style.icon;

  return (
    <>
      <header className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-3">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg ring-1", style.tile)}>
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium">{definition.title}</div>
          <div className="truncate font-mono text-[11px] text-muted-foreground">{node.id}</div>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="Close settings" onClick={() => selectNode(null)}>
          <X />
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin">
        <div className="space-y-5 p-4">
          {explainMode && <ExplainCard kind={node.type} />}
          <p className="text-xs leading-relaxed text-muted-foreground">{definition.description}</p>
          <Field label="Name" htmlFor={`${node.id}-label`}>
            <Input
              id={`${node.id}-label`}
              value={node.data.label}
              onChange={(e) => updateLabel(node.id, e.target.value)}
              className="text-[13px]"
            />
          </Field>
          <NodeConfigForm node={node} />
        </div>
      </div>

      <footer className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-red-300 hover:bg-red-500/10 hover:text-red-200"
          onClick={() => deleteNode(node.id)}
        >
          <Trash /> Delete node
        </Button>
      </footer>
    </>
  );
}

function WorkflowOverview() {
  const { workflowName, workflowDescription, nodes, edges, explainMode } = useEditor();
  const dataEdges = edges.filter((e) => e.type === "data").length;
  const mcpEdges = edges.length - dataEdges;

  return (
    <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin">
      <div className="space-y-5 p-4">
        <div>
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Workflow</div>
          <h2 className="mt-1 text-sm font-medium">{workflowName}</h2>
          {workflowDescription && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{workflowDescription}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Nodes" value={nodes.length} />
          <Stat label="Data links" value={dataEdges} />
          <Stat label="MCP links" value={mcpEdges} />
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Legend</div>
          <LegendRow swatch={<span className="h-0.5 w-6 rounded bg-(--edge-data)" />}>
            Data flows from one step to the next
          </LegendRow>
          <LegendRow
            swatch={<span className="w-6 border-t-[1.5px] border-dashed border-(--edge-mcp)" />}
          >
            An MCP server grants tool access
          </LegendRow>
          <LegendRow swatch={<span className="size-2.5 rounded-full bg-zinc-400" />}>Data port</LegendRow>
          <LegendRow swatch={<span className="size-2.5 rotate-45 rounded-xs bg-sky-400" />}>MCP port</LegendRow>
        </div>

        <div className="space-y-1.5 rounded-lg border border-white/6 bg-white/2 p-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground/90">Tips</div>
          <p>Select a node to configure it.</p>
          <p>Drag from a port to another port to connect nodes.</p>
          <p>
            Press <Kbd>Delete</Kbd> to remove the selected node or edge.
          </p>
          {!explainMode && <p>Turn on Explain Mode to see how each node works.</p>}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/6 bg-white/2 px-2.5 py-2">
      <div className="text-base font-medium tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function LegendRow({ swatch, children }: { swatch: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex w-6 items-center justify-center">{swatch}</span>
      {children}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-white/10 bg-white/4 px-1 py-px font-mono text-[10.5px] text-foreground/80">
      {children}
    </kbd>
  );
}
