interface AvatarProps {
  size?: number;
  className?: string;
}

/** "Baddie" mascot - a pretty, slender character with long flowing hair,
 * big lashed eyes, and a cute top. No muscular/flexing pose. */
export function GymGirlAvatar({ size = 96, className = "" }: AvatarProps) {
  const skin = "#f0b088";
  const ink = "#1b1b2c";
  const pink = "#ec4899";
  const lips = "#e11d6e";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cartoon avatar of a pretty woman with long hair"
    >
      <defs>
        <linearGradient id="avatarBg-gymGirl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#avatarBg-gymGirl)" />

      {/* long hair, behind everything else */}
      <path
        d="M34 34 Q30 70 40 98 Q46 100 46 92 Q40 66 44 38 Q60 26 76 38 Q80 66 74 92 Q74 100 80 98 Q90 70 86 34 Q80 12 60 12 Q40 12 34 34 Z"
        fill={ink}
      />

      {/* slender arms, relaxed at the sides */}
      <rect x="35" y="62" width="8" height="22" rx="4" fill={skin} transform="rotate(4 35 62)" />
      <rect x="77" y="62" width="8" height="22" rx="4" fill={skin} transform="rotate(-4 77 62)" />

      {/* torso: cute top */}
      <rect x="45" y="56" width="30" height="28" rx="14" fill={pink} />
      <path d="M45 60 Q60 68 75 60 L75 66 Q60 74 45 66 Z" fill="#f9a8d4" />

      {/* neck */}
      <rect x="56" y="48" width="8" height="9" fill={skin} />

      {/* face */}
      <circle cx="60" cy="36" r="12.5" fill={skin} />

      {/* bangs */}
      <path d="M48 30 Q60 20 72 30 Q72 24 60 22 Q48 24 48 30 Z" fill={ink} />

      {/* hair bow */}
      <path
        d="M78 24 L84 20 L83 26 L88 24 L84 30 L86 34 L80 31 L79 35 L76 30 Z"
        fill="#f9a8d4"
      />
      <circle cx="80.5" cy="27" r="1.6" fill={pink} />

      {/* big lashed eyes */}
      <ellipse cx="55" cy="36" rx="2.6" ry="3.2" fill={ink} />
      <ellipse cx="65" cy="36" rx="2.6" ry="3.2" fill={ink} />
      <circle cx="54" cy="34.5" r="0.8" fill="#ffffff" />
      <circle cx="64" cy="34.5" r="0.8" fill="#ffffff" />
      <path d="M51 32 L48.5 29.5 M52.5 31 L51 28 M54.5 30.5 L54 27.5" stroke={ink} strokeWidth="1" strokeLinecap="round" />
      <path d="M69 32 L71.5 29.5 M67.5 31 L69 28 M65.5 30.5 L66 27.5" stroke={ink} strokeWidth="1" strokeLinecap="round" />

      {/* eyebrows */}
      <path d="M50.5 29 Q54.5 27 58 29" stroke={ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M62 29 Q65.5 27 69.5 29" stroke={ink} strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* blush */}
      <circle cx="51" cy="40" r="2.2" fill={pink} opacity="0.45" />
      <circle cx="69" cy="40" r="2.2" fill={pink} opacity="0.45" />

      {/* lips */}
      <path d="M56 43 Q60 46 64 43 Q60 45.5 56 43 Z" fill={lips} />
    </svg>
  );
}
