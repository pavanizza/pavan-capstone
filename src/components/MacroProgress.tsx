interface MacroProgressProps {
  label: string;
  unit: string;
  consumed: number;
  target: number;
  colorClass: string;
}

export function MacroProgress({ label, unit, consumed, target, colorClass }: MacroProgressProps) {
  const safeTarget = target > 0 ? target : 1;
  const pct = Math.min(100, Math.max(0, (consumed / safeTarget) * 100));
  const remaining = Math.round(target - consumed);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-neutral-600">{label}</span>
        <span className="text-xs text-neutral-400">
          {Math.round(consumed)} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-neutral-500">
        {remaining >= 0 ? `${remaining} ${unit} remaining` : `${Math.abs(remaining)} ${unit} over target`}
      </div>
    </div>
  );
}
