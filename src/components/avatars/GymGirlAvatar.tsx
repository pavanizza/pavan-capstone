interface AvatarProps {
  size?: number;
  className?: string;
}

/** Female flexing gym mascot - same muscular-arm pose as GymGuyAvatar, with a
 * ponytail, headband, and sports-bra top to read as a distinct character. */
export function GymGirlAvatar({ size = 96, className = "" }: AvatarProps) {
  const skin = "#e8a373";
  const skinShade = "#cf8a5c";
  const ink = "#1b1b2c";
  const accent = "#ec4899";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cartoon avatar of a flexing gym woman"
    >
      <defs>
        <linearGradient id="avatarBg-gymGirl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#avatarBg-gymGirl)" />

      {/* arms, flexed double-bicep pose */}
      {[
        { cx: 40, cy: 56, r: 8 },
        { cx: 28, cy: 52, r: 7 },
        { cx: 18, cy: 46, r: 8 },
        { cx: 20, cy: 36, r: 8 },
        { cx: 28, cy: 30, r: 7 },
        { cx: 80, cy: 56, r: 8 },
        { cx: 92, cy: 52, r: 7 },
        { cx: 102, cy: 46, r: 8 },
        { cx: 100, cy: 36, r: 8 },
        { cx: 92, cy: 30, r: 7 },
      ].map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={skin} />
      ))}
      <circle cx="16" cy="44" r="2.6" fill="#ffffff" opacity="0.25" />
      <circle cx="104" cy="44" r="2.6" fill="#ffffff" opacity="0.25" />

      {/* torso + sports-bra top */}
      <rect x="39" y="50" width="42" height="32" rx="14" fill={skin} />
      <path d="M39 56 Q60 64 81 56 L81 68 Q60 76 39 68 Z" fill={accent} />

      {/* waistband */}
      <rect x="39" y="74" width="42" height="10" rx="4" fill={accent} />

      {/* neck */}
      <rect x="55" y="44" width="10" height="8" fill={skin} />

      {/* ponytail (behind head) */}
      <path d="M74 20 Q88 24 84 42 Q80 44 78 40 Q80 26 70 20 Z" fill={ink} />

      {/* hair */}
      <circle cx="60" cy="24" r="14" fill={ink} />
      <path d="M46 24 Q60 12 74 24 Q74 30 70 28 Q60 20 50 28 Q46 30 46 24 Z" fill={ink} />

      {/* headband */}
      <rect x="47" y="21" width="26" height="5" rx="2.5" fill={accent} />

      {/* face */}
      <circle cx="60" cy="33" r="13" fill={skin} />
      <path d="M52 29 Q54.5 27.5 57 29" stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M63 29 Q65.5 27.5 68 29" stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="55" cy="32" r="1.5" fill={ink} />
      <circle cx="65" cy="32" r="1.5" fill={ink} />
      <path d="M54 38 Q60 42 66 38" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="36" r="2" fill={skinShade} opacity="0.5" />
      <circle cx="68" cy="36" r="2" fill={skinShade} opacity="0.5" />
    </svg>
  );
}
