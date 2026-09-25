interface AvatarProps {
  size?: number;
  className?: string;
}

/** "Diva" mascot - slender hourglass silhouette in a fit-and-flare dress,
 * long wavy hair, earrings, and a softer, clearly feminine face (big
 * almond eyes with lashes, arched brows, fuller lips). No muscles/flexing. */
export function GymGirlAvatar({ size = 96, className = "" }: AvatarProps) {
  const skin = "#f0b088";
  const ink = "#1b1b2c";
  const pink = "#ec4899";
  const pinkDark = "#db2777";
  const lips = "#e11d6e";
  const gold = "#eab308";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cartoon avatar of a feminine woman with long wavy hair in a dress"
    >
      <defs>
        <linearGradient id="avatarBg-gymGirl" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#avatarBg-gymGirl)" />

      {/* long wavy hair, behind everything else */}
      <path
        d="M32 32 Q28 66 36 96 Q44 100 43 90 Q37 64 42 40 Q46 30 52 26 Q44 28 40 22 Q52 14 60 15 Q68 14 80 22 Q76 28 68 26 Q74 30 78 40 Q83 64 77 90 Q76 100 84 96 Q92 66 88 32 Q82 10 60 10 Q38 10 32 32 Z"
        fill={ink}
      />

      {/* slender arms, relaxed at the sides */}
      <rect x="35" y="60" width="7.5" height="22" rx="3.75" fill={skin} transform="rotate(5 35 60)" />
      <rect x="77.5" y="60" width="7.5" height="22" rx="3.75" fill={skin} transform="rotate(-5 77.5 60)" />

      {/* fit-and-flare dress: bust tapering to a waist, then flaring out */}
      <path
        d="M45 54 Q44 62 49 68 L71 68 Q76 62 75 54 Q60 48 45 54 Z"
        fill={pink}
      />
      <path d="M49 68 Q40 76 39 86 L81 86 Q80 76 71 68 Z" fill={pinkDark} />
      <path d="M45 56 Q60 64 75 56 L75 60 Q60 68 45 60 Z" fill="#f9a8d4" />

      {/* neck */}
      <rect x="56" y="47" width="8" height="9" fill={skin} />

      {/* earrings */}
      <circle cx="47.5" cy="42" r="1.6" fill={gold} />
      <circle cx="72.5" cy="42" r="1.6" fill={gold} />

      {/* face */}
      <circle cx="60" cy="35" r="12.5" fill={skin} />

      {/* side-swept fringe */}
      <path d="M47 30 Q52 18 60 20 Q66 17 73 26 Q66 20 58 24 Q50 24 47 30 Z" fill={ink} />

      {/* hair bow accessory */}
      <path d="M78 22 L84 18 L83 24 L88 22 L84 28 L86 32 L80 29 L79 33 L76 28 Z" fill="#f9a8d4" />
      <circle cx="80.5" cy="25" r="1.6" fill={pink} />

      {/* big almond eyes, angled up slightly at the outer corner */}
      <path d="M50.5 35.5 Q53 32.5 57.5 34.5 Q53.5 35 50.5 35.5 Z" fill={ink} />
      <path d="M69.5 35.5 Q67 32.5 62.5 34.5 Q66.5 35 69.5 35.5 Z" fill={ink} />
      <circle cx="54.5" cy="34" r="1" fill="#ffffff" />
      <circle cx="65.5" cy="34" r="1" fill="#ffffff" />

      {/* long upswept lashes */}
      <path d="M50 32 L47 28.5 M51.5 30.5 L49.5 27 M53.5 29.5 L52.5 26" stroke={ink} strokeWidth="1" strokeLinecap="round" />
      <path d="M70 32 L73 28.5 M68.5 30.5 L70.5 27 M66.5 29.5 L67.5 26" stroke={ink} strokeWidth="1" strokeLinecap="round" />

      {/* thin, high-arched eyebrows */}
      <path d="M49.5 27.5 Q54 24.5 58.5 27" stroke={ink} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M61.5 27 Q66 24.5 70.5 27.5" stroke={ink} strokeWidth="1.1" fill="none" strokeLinecap="round" />

      {/* blush */}
      <circle cx="50.5" cy="39.5" r="2.4" fill={pink} opacity="0.5" />
      <circle cx="69.5" cy="39.5" r="2.4" fill={pink} opacity="0.5" />

      {/* fuller lips with a small gloss highlight */}
      <path d="M55 43 Q60 46.5 65 43 Q60 46 55 43 Z" fill={lips} />
      <circle cx="61" cy="43.6" r="0.7" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}
