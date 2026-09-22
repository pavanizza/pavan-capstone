import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

interface GymGuyAvatarProps {
  size?: number;
}

/** Same mascot as the web app's GymGuyAvatar.tsx, ported to react-native-svg. */
export function GymGuyAvatar({ size = 96 }: GymGuyAvatarProps) {
  const skin = "#f0a878";
  const skinShade = "#d99464";
  const ink = "#1b1b2c";

  const arms = [
    { cx: 40, cy: 56, r: 9 },
    { cx: 28, cy: 52, r: 8 },
    { cx: 18, cy: 46, r: 9 },
    { cx: 20, cy: 36, r: 9 },
    { cx: 28, cy: 30, r: 8 },
    { cx: 80, cy: 56, r: 9 },
    { cx: 92, cy: 52, r: 8 },
    { cx: 102, cy: 46, r: 9 },
    { cx: 100, cy: 36, r: 9 },
    { cx: 92, cy: 30, r: 8 },
  ];

  const absTiles = [56, 64, 72].flatMap((y) => [46, 64].map((x) => ({ x, y })));

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#3b82f6" />
          <Stop offset="100%" stopColor="#8b5cf6" />
        </LinearGradient>
      </Defs>

      <Circle cx="60" cy="60" r="58" fill="url(#avatarBg)" />

      {arms.map((c, i) => (
        <Circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={skin} />
      ))}
      <Circle cx="16" cy="44" r="3" fill="#ffffff" opacity={0.25} />
      <Circle cx="104" cy="44" r="3" fill="#ffffff" opacity={0.25} />

      <Rect x="38" y="50" width="44" height="32" rx="14" fill={skin} />

      {absTiles.map((t, i) => (
        <Rect key={i} x={t.x} y={t.y} width="10" height="7" rx="2.5" fill={skinShade} />
      ))}

      <Rect x="38" y="74" width="44" height="10" rx="4" fill="#8b5cf6" />
      <Rect x="55" y="44" width="10" height="8" fill={skin} />

      <Circle cx="60" cy="25" r="14" fill={ink} />
      <Circle cx="60" cy="33" r="13" fill={skin} />
      <Circle cx="55" cy="32" r="1.6" fill={ink} />
      <Circle cx="65" cy="32" r="1.6" fill={ink} />
      <Path d="M54 38 Q60 43 66 38" stroke={ink} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}
