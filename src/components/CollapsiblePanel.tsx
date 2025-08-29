import { useState } from "react";
import type { ReactNode } from "react";
import Panel from "./Panel";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
};

export default function CollapsiblePanel({ title, subtitle, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Panel
      tone="glass"
      pad="sm"
      className="bg-black/25"
      title={title}
      subtitle={subtitle}
      actions={
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg px-3 py-1 bg-white/10 hover:bg-white/15 ring-1 ring-white/15 text-sm"
          aria-expanded={open}
          aria-controls="collapsible-content"
        >
          {open ? "Ocultar" : "Mostrar"}
        </button>
      }
    >
      <div id="collapsible-content" hidden={!open}>
        {children}
      </div>
    </Panel>
  );
}
