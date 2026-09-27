export default function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClasses = {
    default: "text-gray-900",
    warning: "text-amber-600",
    danger: "text-red-600",
  }[tone];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClasses}`}>{value}</p>
    </div>
  );
}
