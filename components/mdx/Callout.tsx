const variants = {
  info: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    icon: "ℹ",
    title: "text-blue-400",
  },
  warning: {
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    icon: "⚠",
    title: "text-yellow-400",
  },
  error: {
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    icon: "✕",
    title: "text-red-400",
  },
  success: {
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    icon: "✓",
    title: "text-green-400",
  },
  note: {
    border: "border-purple-500/30",
    bg: "bg-purple-500/10",
    icon: "✎",
    title: "text-purple-400",
  },
};

export default function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof variants;
  title?: string;
  children: React.ReactNode;
}) {
  const v = variants[type] || variants.info;

  return (
    <div
      className={`my-4 rounded-lg border ${v.border} ${v.bg} p-4 not-prose`}
    >
      {title && (
        <div className={`flex items-center gap-2 font-medium mb-2 ${v.title}`}>
          <span>{v.icon}</span>
          <span>{title}</span>
        </div>
      )}
      <div className="text-sm text-foreground/80 leading-relaxed [&>p]:m-0">
        {children}
      </div>
    </div>
  );
}
