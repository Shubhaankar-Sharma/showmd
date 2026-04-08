const colors: Record<string, string> = {
  red: "bg-red-500/20 text-red-300 border-red-500/30",
  green: "bg-green-500/20 text-green-300 border-green-500/30",
  blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  gray: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export default function Badge({
  color = "blue",
  children,
}: {
  color?: string;
  children: React.ReactNode;
}) {
  const cls = colors[color] || colors.blue;
  return (
    <span
      className={`${cls} inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium`}
    >
      {children}
    </span>
  );
}
