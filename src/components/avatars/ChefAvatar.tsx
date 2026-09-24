interface AvatarProps {
  size?: number;
  className?: string;
}

/** Chef mascot, tying the "what should I eat next" side of the app back to
 * food rather than just the gym. Gender-neutral by design. */
export function ChefAvatar({ size = 96, className = "" }: AvatarProps) {
  const skin = "#d99464";
  const ink = "#1b1b2c";
  const white = "#f4f4f5";
  const accentRed = "#ef4444";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cartoon avatar of a chef holding a mixing bowl"
    >
      <defs>
        <linearGradient id="avatarBg-chef" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#avatarBg-chef)" />

      {/* arms holding the bowl */}
      <rect x="30" y="66" width="10" height="18" rx="5" fill={skin} transform="rotate(-15 30 66)" />
      <rect x="80" y="66" width="10" height="18" rx="5" fill={skin} transform="rotate(15 80 66)" />

      {/* mixing bowl */}
      <path d="M38 82 Q60 96 82 82 L79 90 Q60 100 41 90 Z" fill="#a1a1aa" />
      <ellipse cx="60" cy="82" rx="22" ry="6" fill="#d4d4d8" />

      {/* torso + apron */}
      <rect x="40" y="52" width="40" height="34" rx="14" fill={white} />
      <path d="M50 52 L70 52 L66 70 L54 70 Z" fill={accentRed} />

      {/* neck */}
      <rect x="55" y="46" width="10" height="8" fill={skin} />

      {/* chef hat */}
      <rect x="47" y="26" width="26" height="10" rx="3" fill={white} />
      <path
        d="M48 27 Q42 8 54 10 Q57 2 60 10 Q63 2 66 10 Q78 8 72 27 Z"
        fill={white}
      />

      {/* face */}
      <circle cx="60" cy="35" r="13" fill={skin} />
      <circle cx="55" cy="34" r="1.5" fill={ink} />
      <circle cx="65" cy="34" r="1.5" fill={ink} />
      <path d="M55 40 Q60 43 65 40" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
