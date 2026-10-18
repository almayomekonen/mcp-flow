"use client";

import { Info, Plus, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type {
  AgentConfig,
  ConditionConfig,
  ConditionOperator,
  McpServerConfig,
  McpToolConfig,
  OutputConfig,
  TriggerConfig,
} from "@/src/lib/workflow/types";
import { useEditor } from "./editor-context";
import type { FlowNode } from "./flow-types";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] leading-snug text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-[11.5px] leading-snug text-muted-foreground">
      <Info className="mt-px size-3.5 shrink-0 text-primary/80" />
      <div>{children}</div>
    </div>
  );
}

export function NodeConfigForm({ node }: { node: FlowNode }) {
  switch (node.type) {
    case "trigger":
      return <TriggerForm id={node.id} config={node.data.config} />;
    case "agent":
      return <AgentForm id={node.id} config={node.data.config} />;
    case "mcpServer":
      return <McpServerForm id={node.id} config={node.data.config} />;
    case "mcpTool":
      return <McpToolForm id={node.id} config={node.data.config} />;
    case "condition":
      return <ConditionForm id={node.id} config={node.data.config} />;
    case "output":
      return <OutputForm id={node.id} config={node.data.config} />;
  }
}

function TriggerForm({ id, config }: { id: string; config: TriggerConfig }) {
  const { updateConfig } = useEditor();
  return (
    <Field label="Request" htmlFor={`${id}-input`} hint="This text becomes the workflow's starting data.">
      <Textarea
        id={`${id}-input`}
        value={config.input}
        onChange={(e) => updateConfig<"trigger">(id, { input: e.target.value })}
        placeholder="What should the workflow do?"
        className="min-h-24 text-[13px]"
      />
    </Field>
  );
}

function AgentForm({ id, config }: { id: string; config: AgentConfig }) {
  const { updateConfig } = useEditor();
  return (
    <div className="space-y-4">
      <Field label="Mode">
        <Select
          value={config.mode}
          onValueChange={(mode) => updateConfig<"agent">(id, { mode: mode as AgentConfig["mode"] })}
        >
          <SelectTrigger className="w-full text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="demo">Demo: simulated decisions, no API key</SelectItem>
            <SelectItem value="live">Live: real model (server API key)</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {config.mode === "demo" ? (
        <Note>
          Demo mode follows a fixed script instead of asking a model. Its decisions are labelled
          as <strong className="text-foreground">simulated</strong>. Its tool calls will still go
          to the real MCP server once Milestone 4 is in place.
        </Note>
      ) : (
        <Note>
          Live mode calls a real model using an API key stored on the server, never in the
          browser. It arrives in Milestone 5.
        </Note>
      )}

      <Field label="Model" htmlFor={`${id}-model`}>
        <Input
          id={`${id}-model`}
          value={config.model}
          disabled={config.mode === "demo"}
          onChange={(e) => updateConfig<"agent">(id, { model: e.target.value })}
          className="font-mono text-[12.5px]"
        />
      </Field>

      <Field label="Instructions" htmlFor={`${id}-instructions`}>
        <Textarea
          id={`${id}-instructions`}
          value={config.instructions}
          onChange={(e) => updateConfig<"agent">(id, { instructions: e.target.value })}
          className="min-h-28 text-[13px]"
        />
      </Field>

      <Field
        label="Max tool calls"
        htmlFor={`${id}-max`}
        hint="A hard limit so the agent can never loop forever (1–20)."
      >
        <Input
          id={`${id}-max`}
          type="number"
          min={1}
          max={20}
          value={config.maxToolsCalls}
          onChange={(e) => {
            const value = Math.min(20, Math.max(1, Number(e.target.value) || 1));
            updateConfig<"agent">(id, { maxToolsCalls: value });
          }}
          className="w-24 text-[13px]"
        />
      </Field>
    </div>
  );
}

function McpServerForm({ id, config }: { id: string; config: McpServerConfig }) {
  const { updateConfig } = useEditor();
  const removeTool = (tool: string) =>
    updateConfig<"mcpServer">(id, { allowedTools: config.allowedTools.filter((t) => t !== tool) });

  return (
    <div className="space-y-4">
      <Field label="Server" hint="Only servers configured locally on this machine can be used.">
        <Select
          value={config.serverId}
          onValueChange={(serverId) => {
            if (serverId == null) return;
            updateConfig<"mcpServer">(id, { serverId });
          }}
        >
          <SelectTrigger className="w-full text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="demo">MCP Flow Demo Server (stdio)</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-xs">
        <span className="text-muted-foreground">Connection</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-zinc-500" />
          Not connected
        </span>
      </div>

      <Field label="Allowed tools">
        {config.allowedTools.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {config.allowedTools.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1 rounded-md border border-sky-400/20 bg-sky-400/[0.06] py-0.5 pr-1 pl-2 font-mono text-[11.5px] text-sky-200"
              >
                {tool}
                <button
                  type="button"
                  onClick={() => removeTool(tool)}
                  aria-label={`Remove ${tool}`}
                  className="rounded p-0.5 text-sky-200/60 hover:bg-white/10 hover:text-sky-100"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground/70 italic">No tools allowed.</p>
        )}
      </Field>

      <Note>
        This allowlist comes from the template. In Milestone 4 you will pick tools from the list the
        running server reports. Tools you do not allow can never be called.
      </Note>
    </div>
  );
}

function McpToolForm({ id, config }: { id: string; config: McpToolConfig }) {
  const { updateConfig } = useEditor();
  const entries = Object.entries(config.arguments);

  const setEntries = (next: [string, string][]) =>
    updateConfig<"mcpTool">(id, { arguments: Object.fromEntries(next) });

  const addArgument = () => {
    let n = entries.length + 1;
    while (`arg${n}` in config.arguments) n++;
    setEntries([...entries, [`arg${n}`, ""]]);
  };

  return (
    <div className="space-y-4">
      <Field label="Tool name" htmlFor={`${id}-tool`} hint="Must be allowed by the attached MCP Server node.">
        <Input
          id={`${id}-tool`}
          value={config.toolName}
          onChange={(e) => updateConfig<"mcpTool">(id, { toolName: e.target.value })}
          placeholder="e.g. get_project_summary"
          className="font-mono text-[12.5px]"
        />
      </Field>

      <Field
        label="Arguments"
        hint={
          <>
            Reference upstream data with <code className="font-mono text-foreground/80">{"{{ input.path }}"}</code>.
          </>
        }
      >
        <div className="space-y-1.5">
          {entries.map(([key, value], index) => (
            <div key={index} className="flex items-center gap-1.5">
              <Input
                value={key}
                aria-label="Argument name"
                onChange={(e) => {
                  const next = [...entries];
                  next[index] = [e.target.value, value];
                  setEntries(next);
                }}
                className="h-7 w-[40%] font-mono text-[12px]"
              />
              <Input
                value={value}
                aria-label={`Value for ${key}`}
                onChange={(e) => {
                  const next = [...entries];
                  next[index] = [key, e.target.value];
                  setEntries(next);
                }}
                className="h-7 flex-1 font-mono text-[12px]"
              />
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${key}`}
                onClick={() => setEntries(entries.filter((_, i) => i !== index))}
              >
                <X />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="xs" onClick={addArgument}>
            <Plus /> Add argument
          </Button>
        </div>
      </Field>

      <Note>
        In Milestone 4 these fields are generated from the tool&apos;s real input schema and
        validated before the call is made.
      </Note>
    </div>
  );
}

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "equals", label: "equals" },
  { value: "non_equals", label: "does not equal" },
  { value: "greater_than", label: "is greater than" },
  { value: "less_then", label: "is less than" },
  { value: "contains", label: "contains" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

function ConditionForm({ id, config }: { id: string; config: ConditionConfig }) {
  const { updateConfig } = useEditor();
  const unary = config.operator === "is_empty" || config.operator === "is_not_empty";
  return (
    <div className="space-y-4">
      <Field label="Value to check" htmlFor={`${id}-left`} hint="A path into the incoming data.">
        <Input
          id={`${id}-left`}
          value={config.left}
          onChange={(e) => updateConfig<"condition">(id, { left: e.target.value })}
          className="font-mono text-[12.5px]"
        />
      </Field>
      <Field label="Operator">
        <Select
          value={config.operator}
          onValueChange={(operator) =>
            updateConfig<"condition">(id, { operator: operator as ConditionOperator })
          }
        >
          <SelectTrigger className="w-full text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPERATORS.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {!unary && (
        <Field label="Compare with" htmlFor={`${id}-right`}>
          <Input
            id={`${id}-right`}
            value={config.right}
            onChange={(e) => updateConfig<"condition">(id, { right: e.target.value })}
            className="font-mono text-[12.5px]"
          />
        </Field>
      )}
      <Note>Conditions use a fixed list of operators. User-written code is never evaluated.</Note>
    </div>
  );
}

function OutputForm({ id, config }: { id: string; config: OutputConfig }) {
  const { updateConfig } = useEditor();
  return (
    <Field label="Display as">
      <Select
        value={config.format}
        onValueChange={(format) =>
          updateConfig<"output">(id, { format: format as OutputConfig["format"] })
        }
      >
        <SelectTrigger className="w-full text-[13px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="summary">Readable summary</SelectItem>
          <SelectItem value="json">Raw JSON</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  );
}
