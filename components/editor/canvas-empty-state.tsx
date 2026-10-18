"use client";

import { LayoutTemplate, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_WORKFLOWS } from "@/src/lib/workflow/samples";
import { useEditor } from "./editor-context";

export function CanvasEmptyState() {
  const { loadWorkflow, addNode } = useEditor();

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/8 bg-card/90 p-6 shadow-2xl backdrop-blur">
        <div className="mb-1 flex items-center gap-2 text-sm font-medium">
          <MousePointerClick className="size-4 text-primary" />
          Build your first workflow
        </div>
        <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
          Drag nodes from the left panel onto the canvas and connect their ports. Or start from a
          template that already wires an AI agent to the MCP Flow Demo Server.
        </p>
        <div className="grid gap-2">
          {SAMPLE_WORKFLOWS.map((workflow) => (
            <button
              key={workflow.id}
              type="button"
              onClick={() => loadWorkflow(workflow)}
              className="group flex items-start gap-3 rounded-lg border border-white/6 bg-white/2 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/6"
            >
              <LayoutTemplate className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              <span>
                <span className="block text-[13px] font-medium">{workflow.name}</span>
                <span className="block text-xs leading-snug text-muted-foreground">
                  {workflow.description}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => addNode("trigger")}>
            Start with a Manual Trigger
          </Button>
        </div>
      </div>
    </div>
  );
}
