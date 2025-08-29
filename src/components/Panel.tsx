import { useId } from "react";
import type { ReactNode } from "react";

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  tone?: "glass" | "solid" | "transparent";
  /** densidad: sm = p-4, md = p-6, lg = p-8 */
  pad?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  labelledById?: string;
};

export default function Panel({
  title,
  subtitle,
  actions,
  tone = "glass",
  pad = "md",
  className,
  children,
  labelledById,
}: Props) {
  const autoId = useId();
  const titleId = labelledById ?? (title ? `panel-${autoId}` : undefined);

  const toneCls =
    tone === "glass"
      ? "bg-black/35 ring-1 ring-white/10 backdrop-blur-sm"
      : tone === "solid"
      ? "bg-zinc-900/60 ring-1 ring-white/10"
      : "bg-transparent";

  const padCls = pad === "sm" ? "p-4" : pad === "lg" ? "p-8" : "p-6";

  return (
    <section
      role="region"
      aria-labelledby={titleId}
      className={["rounded-2xl", toneCls, padCls, className ?? ""].join(" ").trim()}
    >
      {(title || actions || subtitle) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title ? (
              <h2 id={titleId} className="font-title text-lg leading-tight">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
