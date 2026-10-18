import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  createEmptyWorkflow,
  SAMPLE_WORKFLOWS,
} from "@/src/lib/workflow/samples";

import { useEditor } from "./editor-context";
import { Button } from "../ui/button";
import {
  ChevronDown,
  GraduationCap,
  LayoutTemplate,
  PanelLeft,
  PanelRight,
  Play,
  Plus,
  Workflow,
} from "lucide-react";

type TopBarProps = {
  onTogglePalette: () => void;
  onToggleConfig: () => void;
};

export function Topbar({ onToggleConfig, onTogglePalette }: TopBarProps) {
  const {
    workflowName,
    setWorkflowName,
    loadWorkflow,
    explainMode,
    setExplainMode,
  } = useEditor();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar px-3">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onTogglePalette}
      >
        <PanelLeft />
      </Button>

      <div className="flex items-center gap-2 pr-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <Workflow />
        </div>
        <span className="hidden text-sm font-semibold tracking-tight sm:inline">
          MCP Flow
        </span>
      </div>

      <div className="hidden h-5 w-px bg-white/10 sm:block"></div>

      <input
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        aria-label="Workflow name"
        className="w-0 min-w-0 max-w-64 flex-1 truncate rounded-md bg-transparent px-2 py-1 text-[13px] font-medium outline-none hhover:bg-white/4 focus:bg-white/6 focus:ring-1 focus:ring-ring"
      />

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <LayoutTemplate />
            <span className="hidden md:inline">Templates</span>
            <ChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Sample workflows
          </DropdownMenuLabel>
          {SAMPLE_WORKFLOWS.map((workflow) => (
            <DropdownMenuItem
              key={workflow.id}
              onSelect={() => loadWorkflow(workflow)}
              className="flex-col items-start gap-0.5"
            >
              <span className="text-[13px]">{workflow.name}</span>
              <span className="text-[11px] leading-snug text-muted-foreground">
                {workflow.description}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => loadWorkflow(createEmptyWorkflow())}
          >
            <Plus /> New empty workflow
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <Switch id="explain-mode" checked={explainMode} onCheckedChange={setExplainMode} />
          <Label htmlFor="explain-mode" className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <GraduationCap className="size-3.5" />
            <span className="hidden sm:inline">Explain Mode</span>
          </Label>
        </div>

        <Tooltip>
          <TooltipTrigger >
            {/* Wrapper keeps the tooltip working while the button is disabled. */}
            <span tabIndex={0} className="rounded-lg">
              <Button size="sm" disabled>
                <Play /> <span className="hidden sm:inline">Run</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Running workflows arrives with the engine in Milestone 3</TooltipContent>
        </Tooltip>

        <Button variant="ghost" size="icon-sm" className="xl:hidden" aria-label="Toggle settings panel" onClick={onToggleConfig}>
          <PanelRight />
        </Button>
      </div>
    </header>
  );
}
