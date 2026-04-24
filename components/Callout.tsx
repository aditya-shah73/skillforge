type Variant = "spring" | "info" | "warn" | "insight";

const variantStyles: Record<Variant, { border: string; bg: string; title: string; icon: string; label: string }> = {
  spring: {
    border: "border-green-300 dark:border-green-800",
    bg: "bg-green-50 dark:bg-green-950/30",
    title: "text-green-900 dark:text-green-200",
    icon: "🌱",
    label: "Spring Boot Corner",
  },
  info: {
    border: "border-sky-300 dark:border-sky-800",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    title: "text-sky-900 dark:text-sky-200",
    icon: "💡",
    label: "Info",
  },
  warn: {
    border: "border-amber-300 dark:border-amber-800",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    title: "text-amber-900 dark:text-amber-200",
    icon: "⚠️",
    label: "Heads up",
  },
  insight: {
    border: "border-purple-300 dark:border-purple-800",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    title: "text-purple-900 dark:text-purple-200",
    icon: "🧠",
    label: "Key insight",
  },
};

export default function Callout({
  variant = "info",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const s = variantStyles[variant];
  return (
    <div className={`my-6 rounded-xl border-l-4 ${s.border} ${s.bg} p-5`}>
      <div className={`flex items-center gap-2 mb-2 font-semibold text-sm uppercase tracking-wide ${s.title}`}>
        <span className="text-lg">{s.icon}</span>
        <span>{title || s.label}</span>
      </div>
      <div className="text-sm leading-relaxed prose-custom">{children}</div>
    </div>
  );
}
