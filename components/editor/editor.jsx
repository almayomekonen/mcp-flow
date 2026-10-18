"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { EditorProvider, useEditor } from "./editor-context";
import { Topbar } from "./top-bar";
import { NodePalette } from "./node-palette";

export default function Editor() {
  return (
    <ReactFlowProvider>
      <EditorProvider>
        <EditorLayout />
      </EditorProvider>
    </ReactFlowProvider>
  );
}

function EditorLayout() {
  const { selectedNode, selectNode } = useEditor();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);

  const showConfig = configOpen || selectedNode !== undefined;

  const toggleConfig = () => {
    if (showConfig) {
      setConfigOpen(false);
      selectNode(null);
    } else {
      setConfigOpen(true);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Topbar
        onToggleConfig={toggleConfig}
        onTogglePalette={() => setPaletteOpen((open) => !open)}
      />

      <div
        className={cn(
          "absolute inset-y-0 left-0 z-20 shadow-2xl transition-transform lg:static lg:z-auto lg:translate-x-0 lg:shadow-none",
          paletteOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <NodePalette />
      </div>
    </div>
  );
}
