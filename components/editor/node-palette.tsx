"use client";

import { Plus, Search, Server } from "lucide-react";
import { useMemo, useState, type DragEvent } from "react";
import { Input } from "@/components/ui/input";
import { NODE_CATALOG, NODE_CATEGORIES, NODE_KINDS } from "@/src/lib/workflow/node-catalog";
import type { NodeKind } from "@/src/lib/workflow/types";
import { cn } from "@/lib/utils";
import { NODE_STYLES } from "@/components/nodes/nodes-style";
import { useEditor } from "./editor-context";
import { NODE_DRAG_TYPE } from "./workflow-canvas";

export function NodePalette() {
  const { addNode } = useEditor();
  const [query, setQuery] = useState("");

  const kindsByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = NODE_KINDS.filter((kind) => {
      const def = NODE_CATALOG[kind];
      return !q || def.title.toLowerCase().includes(q) || def.description.toLowerCase().includes(q);
    });
    return NODE_CATEGORIES.map((category) => ({
      category,
      kinds: matches.filter((kind) => NODE_CATALOG[kind].category === category),
    })).filter((group) => group.kinds.length > 0);
  }, [query]);

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes"
            aria-label="Search nodes"
            className="h-8 pl-8 text-[13px]"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin">
        <div className="space-y-4 px-3 pb-4">
          {kindsByCategory.map(({ category, kinds }) => (
            <section key={category}>
              <h3 className="mb-1.5 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                {category}
              </h3>
              <div className="space-y-1">
                {kinds.map((kind) => (
                  <PaletteItem key={kind} kind={kind} onAdd={() => addNode(kind)} />
                ))}
              </div>
            </section>
          ))}
          {kindsByCategory.length === 0 && (
            <p className="px-1 text-xs text-muted-foreground">No nodes match “{query}”.</p>
          )}
        </div>
      </div>

      <ServerList />
    </aside>
  );
}

function PaletteItem({ kind, onAdd }: { kind: NodeKind; onAdd: () => void }) {
  const def = NODE_CATALOG[kind];
  const style = NODE_STYLES[kind];
  const Icon = style.icon;

  const onDragStart = (event: DragEvent) => {
    event.dataTransfer.setData(NODE_DRAG_TYPE, kind);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      title={def.description}
      className="group flex cursor-grab items-center gap-2.5 rounded-lg border border-transparent p-1.5 pr-1 transition-colors hover:border-white/6 hover:bg-sidebar-accent active:cursor-grabbing"
    >
      <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md ring-1", style.tile)}>
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] leading-tight">{def.title}</div>
        <div className="truncate text-[11px] text-muted-foreground">{def.description}</div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Add ${def.title} to canvas`}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/6 hover:text-foreground focus-visible:opacity-100"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

function ServerList() {
  return (
    <div className="border-t border-sidebar-border p-3">
      <h3 className="mb-2 px-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        MCP Servers
      </h3>
      <div className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 p-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20">
          <Server className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px]">MCP Flow Demo Server</div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-zinc-500" />
            Not connected · studio
          </div>
        </div>
      </div>
      <p className="mt-2 px-1 text-[11px] leading-snug text-muted-foreground/70">
        Live connection and tool discovery arrive in Milestone 4.
      </p>
    </div>
  );
}
