import {
  Bot,
  Flag,
  GitBranch,
  Server,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { NodeKind } from "@/src/lib/workflow/types";

export type NodeStyle = {
  icon: LucideIcon;
  tile: string;
  accent: string;
};

export const NODE_STYLES: Record<NodeKind, NodeStyle> = {
  trigger: {
    icon: Zap,
    tile: "bg-orange-400/12 text-orange-300 ring-orange-400/25",
    accent: "text-orange-300",
  },
  agent: {
    icon: Bot,
    tile: "bg-violet-400/12 text-violet-300 ring-violet-400/25",
    accent: "text-violet-300",
  },
  mcpServer: {
    icon: Server,
    tile: "bg-sky-400/12 text-sky-300 ring-sky-400/25",
    accent: "text-sky-300",
  },
  mcpTool: {
    icon: Wrench,
    tile: "bg-teal-400/12 text-teal-300 ring-teal-400/25",
    accent: "text-teal-300",
  },
  condition: {
    icon: GitBranch,
    tile: "bg-fuchsia-400/12 text-fuchsia-300 ring-fuchsia-400/25",
    accent: "text-fuchsia-300",
  },
  output: {
    icon: Flag,
    tile: "bg-zinc-400/12 text-zinc-300 ring-zinc-400/25",
    accent: "text-zinc-300",
  },
};
