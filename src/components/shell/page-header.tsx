import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-6 py-7 md:flex-row md:items-end md:justify-between md:gap-6 md:px-10 md:py-9",
        className,
      )}
      style={{
        background: "var(--af-paper)",
        borderBottom: "1px solid var(--af-ink-08)",
      }}
    >
      <div className="min-w-0">
        {eyebrow && <div className="af-eb mb-2.5">{eyebrow}</div>}
        <h1
          className="af-h-tight text-balance"
          style={{
            fontSize: "clamp(28px, 3vw, 38px)",
            color: "var(--af-ink-deep)",
            margin: 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="af-body text-pretty max-w-2xl"
            style={{
              fontSize: 14.5,
              color: "var(--af-ink-2)",
              margin: "10px 0 0",
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
