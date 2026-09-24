import { AVATARS, AvatarId } from "@/lib/avatars";

interface AvatarPickerProps {
  value: AvatarId;
  onChange: (id: AvatarId) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {(Object.keys(AVATARS) as AvatarId[]).map((id) => {
        const { label, Component } = AVATARS[id];
        const selected = id === value;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-1.5 transition ${
              selected ? "border-violet bg-violet/10" : "border-transparent hover:border-line"
            }`}
          >
            <Component size={56} />
            <span className="text-[10px] text-faint">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
