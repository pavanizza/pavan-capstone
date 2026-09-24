interface AvatarProps {
  size?: number;
  className?: string;
}

/** The "Rizzler" mascot - slicked-back hair, open-collar shirt and chain,
 * winking with a smug smirk. Replaces the old chef design. */
export function RizzlerAvatar({ size = 96, className = "" }: AvatarProps) {
  const skin = "#d99464";
  const ink = "#1b1b2c";
  const shirt = "#18181b";
  const gold = "#eab308";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cartoon avatar of a winking, smirking character in an open-collar shirt with a gold chain"
    >
      <defs>
        <linearGradient id="avatarBg-rizzler" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#avatarBg-rizzler)" />

      {/* arms, relaxed at the sides */}
      <rect x="32" y="60" width="10" height="22" rx="5" fill={skin} transform="rotate(6 32 60)" />
      <rect x="78" y="60" width="10" height="22" rx="5" fill={skin} transform="rotate(-6 78 60)" />

      {/* torso: open-collar shirt */}
      <rect x="40" y="50" width="40" height="34" rx="14" fill={shirt} />
      <path d="M50 50 L60 66 L70 50 Z" fill={skin} />

      {/* gold chain */}
      <path d="M51 52 Q60 60 69 52" stroke={gold} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="61" r="2.2" fill={gold} />

      {/* neck */}
      <rect x="55" y="44" width="10" height="8" fill={skin} />

      {/* face */}
      <circle cx="60" cy="35" r="13" fill={skin} />

      {/* slicked-back hair */}
      <path
        d="M46 30 Q44 16 60 14 Q76 16 74 30 Q70 22 60 21 Q50 22 46 30 Z"
        fill={ink}
      />
      <path d="M50 20 Q60 17 70 20" stroke="#3f3f52" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* winking eye (closed) with a raised, cheeky brow */}
      <path d="M50 33 Q53.5 35.5 57 33" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M49 28.5 Q53.5 26 58 28" stroke={ink} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* open eye */}
      <ellipse cx="66" cy="32.5" rx="3" ry="2.6" fill="#ffffff" />
      <circle cx="66.8" cy="32.5" r="1.4" fill={ink} />
      <path d="M62 28.5 Q66 26.5 70 28.5" stroke={ink} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* smug smirk */}
      <path d="M53 40 Q60 44 68 38" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* charm sparkle */}
      <path
        d="M44 24 L45.5 27.5 L49 29 L45.5 30.5 L44 34 L42.5 30.5 L39 29 L42.5 27.5 Z"
        fill="#fde047"
      />
    </svg>
  );
}
