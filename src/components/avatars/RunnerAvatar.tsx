interface AvatarProps {
  size?: number;
  className?: string;
}

/** Mid-stride runner in a cap - full-body pose for variety against the
 * upper-body gym avatars. */
export function RunnerAvatar({ size = 96, className = "" }: AvatarProps) {
  const skin = "#c98a5c";
  const ink = "#1b1b2c";
  const accent = "#f97316";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cartoon avatar of a runner mid-stride"
    >
      <defs>
        <linearGradient id="avatarBg-runner" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#avatarBg-runner)" />

      {/* back leg, bent behind */}
      <rect x="66" y="70" width="10" height="20" rx="5" fill={skin} transform="rotate(25 66 70)" />
      <rect x="78" y="86" width="9" height="10" rx="3" fill="#ffffff" transform="rotate(25 66 70)" />

      {/* front leg, striding forward */}
      <rect x="46" y="72" width="10" height="22" rx="5" fill={skin} transform="rotate(-20 46 72)" />
      <rect x="34" y="90" width="9" height="10" rx="3" fill="#ffffff" transform="rotate(-20 46 72)" />

      {/* torso, leaning into the stride */}
      <rect x="42" y="48" width="36" height="30" rx="14" fill={accent} transform="rotate(-6 60 63)" />

      {/* back arm, swung behind */}
      <rect x="70" y="50" width="9" height="20" rx="4.5" fill={skin} transform="rotate(50 70 50)" />
      {/* front arm, swung forward */}
      <rect x="34" y="48" width="9" height="20" rx="4.5" fill={skin} transform="rotate(-60 34 48)" />

      {/* neck + head */}
      <rect x="55" y="42" width="10" height="8" fill={skin} />
      <circle cx="61" cy="31" r="13" fill={skin} />

      {/* cap */}
      <path d="M48 27 Q61 15 74 27 Q74 30 70 29 Q61 22 52 29 Q48 30 48 27 Z" fill={ink} />
      <path d="M70 28 Q80 27 79 32 Q73 33 69 31 Z" fill={ink} />

      {/* face */}
      <circle cx="57" cy="31" r="1.4" fill={ink} />
      <circle cx="65" cy="31" r="1.4" fill={ink} />
      <path d="M57 37 Q61 39 65 36" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
