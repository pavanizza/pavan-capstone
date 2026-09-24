interface GymGuyAvatarProps {
  size?: number;
  className?: string;
}

/**
 * The app's default profile picture: a flexing, six-pack-abs gym-guy mascot,
 * hand-built from simple SVG shapes (no external image asset needed).
 */
export function GymGuyAvatar({ size = 96, className = "" }: GymGuyAvatarProps) {
  const skin = "#f0a878";
  const skinShade = "#d99464";
  const ink = "#1b1b2c";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Cartoon avatar of a flexing gym guy with abs"
    >
      <defs>
        <linearGradient id="avatarBg-gymGuy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="58" fill="url(#avatarBg-gymGuy)" />

      {/* arms (flexed, double-bicep pose) - drawn behind the torso so shoulders connect cleanly */}
      {[
        // left arm: shoulder -> elbow -> raised fist
        { cx: 40, cy: 56, r: 9 },
        { cx: 28, cy: 52, r: 8 },
        { cx: 18, cy: 46, r: 9 },
        { cx: 20, cy: 36, r: 9 },
        { cx: 28, cy: 30, r: 8 },
        // right arm, mirrored
        { cx: 80, cy: 56, r: 9 },
        { cx: 92, cy: 52, r: 8 },
        { cx: 102, cy: 46, r: 9 },
        { cx: 100, cy: 36, r: 9 },
        { cx: 92, cy: 30, r: 8 },
      ].map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={skin} />
      ))}
      {/* bicep highlights for a bit of muscle definition */}
      <circle cx="16" cy="44" r="3" fill="#ffffff" opacity="0.25" />
      <circle cx="104" cy="44" r="3" fill="#ffffff" opacity="0.25" />

      {/* torso */}
      <rect x="38" y="50" width="44" height="32" rx="14" fill={skin} />

      {/* abs grid (six-pack) */}
      {[56, 64, 72].flatMap((y) =>
        [46, 64].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="10" height="7" rx="2.5" fill={skinShade} />
        )),
      )}

      {/* waistband / shorts accent, tying into the app palette */}
      <rect x="38" y="74" width="44" height="10" rx="4" fill="#8b5cf6" />

      {/* neck */}
      <rect x="55" y="44" width="10" height="8" fill={skin} />

      {/* hair */}
      <circle cx="60" cy="25" r="14" fill={ink} />

      {/* face */}
      <circle cx="60" cy="33" r="13" fill={skin} />
      <circle cx="55" cy="32" r="1.6" fill={ink} />
      <circle cx="65" cy="32" r="1.6" fill={ink} />
      <path d="M54 38 Q60 43 66 38" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
