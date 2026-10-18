"use client";

import { GraduationCap } from "lucide-react";
import { EXPLANATIONS } from "@/lib/content";
import type { NodeKind } from "@/src/lib/workflow/types";

export function ExplainCard({ kind }: { kind: NodeKind }) {
  const e = EXPLANATIONS[kind];
  const rows: [string, string][] = [
    ["Why it exists", e.why],
    ["Data in", e.dataIn],
    ["Data out", e.dataOut],
    ["Talks to", e.talksTo],
  ];

  return (
    <div className="space-y-3 rounded-xl border border-amber-300/15 bg-amber-300/4 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-amber-200">
        <GraduationCap className="size-3.5" />
        Explain Mode
      </div>
      <p className="text-[12.5px] leading-relaxed text-foreground/90">{e.what}</p>
      <dl className="space-y-2">
        {rows.map(([term, detail]) => (
          <div key={term}>
            <dt className="text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">{term}</dt>
            <dd className="text-[12px] leading-snug text-foreground/80">{detail}</dd>
          </div>
        ))}
      </dl>
      <div>
        <div className="mb-1 text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">Code</div>
        <ul className="space-y-1">
          {e.code.map((ref) => (
            <li key={ref.path} className="text-[11.5px] leading-snug">
              <code className="font-mono text-amber-100/90">{ref.path}</code>
              {ref.planned && <span className="ml-1 text-muted-foreground/70">(planned)</span>}
              <span className="block text-muted-foreground">{ref.note}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="border-t border-amber-300/10 pt-2 text-[11px] text-amber-200/70">{e.status}</p>
    </div>
  );
}
