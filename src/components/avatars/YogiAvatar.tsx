interface AvatarProps {
  size?: number;
  className?: string;
}

/** Seated lotus-pose character - a calmer female-presenting alternative to
 * the gym mascots. */
export function YogiAvatar({ size = 96, className = "" }: AvatarProps) {
  const skin = "#f0b088";
  const ink = "#1b1b2c";
  const accent = "#14b8a6";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cartoon avatar of a woman in a seated yoga pose"
    >
      <defs>
        <linearGradient id="avatarBg-yogi" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#avatarBg-yogi)" />

      {/* crossed legs */}
      <path d="M28 96 Q60 78 92 96 Q92 104 84 104 Q60 92 36 104 Q28 104 28 96 Z" fill={skin} />

      {/* resting hands on knees */}
      <circle cx="32" cy="94" r="6" fill={skin} />
      <circle cx="88" cy="94" r="6" fill={skin} />

      {/* torso */}
      <rect x="42" y="56" width="36" height="34" rx="16" fill={accent} />

      {/* arms down to knees */}
      <rect x="30" y="70" width="10" height="26" rx="5" fill={skin} transform="rotate(8 30 70)" />
      <rect x="80" y="70" width="10" height="26" rx="5" fill={skin} transform="rotate(-8 80 70)" />

      {/* neck */}
      <rect x="55" y="50" width="10" height="8" fill={skin} />

      {/* hair bun */}
      <circle cx="60" cy="20" r="6" fill={ink} />
      <circle cx="60" cy="30" r="14" fill={ink} />

      {/* headband */}
      <rect x="46" y="27" width="28" height="5" rx="2.5" fill={accent} />

      {/* face */}
      <circle cx="60" cy="38" r="13" fill={skin} />
      <path d="M52 35 Q54.5 33.5 57 35" stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M63 35 Q65.5 33.5 68 35" stroke={ink} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M55 44 Q60 47 65 44" stroke={ink} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="52" cy="41" r="2" fill="#e08a5c" opacity="0.5" />
      <circle cx="68" cy="41" r="2" fill="#e08a5c" opacity="0.5" />
    </svg>
  );
}
