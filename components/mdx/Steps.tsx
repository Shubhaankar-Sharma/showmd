export default function Steps({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 not-prose">
      <div className="space-y-0">{children}</div>
    </div>
  );
}

function Step({
  title,
  step,
  children,
}: {
  title: string;
  step?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-10 pb-8 last:pb-0">
      {/* Vertical line */}
      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border last:hidden" />
      {/* Step number circle */}
      <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-xs font-mono text-muted">
        {step || "•"}
      </div>
      <div>
        <h3 className="font-medium text-foreground mb-2">{title}</h3>
        <div className="text-sm text-foreground/70 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

Steps.Step = Step;
