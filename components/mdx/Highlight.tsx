const colors: Record<string, string> = {
  red: "bg-red-500/20 text-red-300",
  green: "bg-green-500/20 text-green-300",
  blue: "bg-blue-500/20 text-blue-300",
  yellow: "bg-yellow-500/20 text-yellow-300",
  purple: "bg-purple-500/20 text-purple-300",
  cyan: "bg-cyan-500/20 text-cyan-300",
};

export default function Highlight({
  color = "yellow",
  children,
}: {
  color?: string;
  children: React.ReactNode;
}) {
  const cls = colors[color] || colors.yellow;
  return (
    <span className={`${cls} rounded px-1.5 py-0.5 font-medium`}>
      {children}
    </span>
  );
}
