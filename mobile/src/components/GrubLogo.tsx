import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Rect, Stop } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);

interface GrubLogoProps {
  size?: number;
  /** Play the "burger assembling itself" entrance animation, then a gentle
   * continuous bounce. Off by default (e.g. small header logos). */
  animated?: boolean;
}

/**
 * The Grub app logo: a cartoon burger stack on the brand's blue/purple
 * gradient badge, built from layered simple SVG shapes (no external image
 * asset), same technique as GymGuyAvatar.
 */
export function GrubLogo({ size = 96, animated = false }: GrubLogoProps) {
  const bunTop = "#e8a94f";
  const bunBottom = "#d9922f";
  const cheese = "#fbbf24";
  const lettuce = "#4ade80";
  const patty = "#7c4a1e";
  const seed = "#fff3d6";

  const seeds = [
    { cx: 48, cy: 42 },
    { cx: 58, cy: 37 },
    { cx: 69, cy: 41 },
    { cx: 60, cy: 46 },
  ];

  // One Animated.Value per layer (bottom bun -> patty -> lettuce -> cheese ->
  // top bun), each dropping into place with a staggered delay, then a slow
  // continuous bounce once assembly finishes.
  const layers = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(animated ? 0 : 1))).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    const drop = Animated.stagger(
      130,
      layers.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.back(1.6)),
          useNativeDriver: true,
        }),
      ),
    );

    drop.start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ).start();
    });
  }, [animated]);

  const bounceTranslateY = bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  const dropTransform = (v: Animated.Value) => [
    { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-70, 0] }) },
  ];

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY: bounceTranslateY }] }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="logoBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#3b82f6" />
            <Stop offset="100%" stopColor="#8b5cf6" />
          </LinearGradient>
        </Defs>

        <Circle cx="60" cy="60" r="58" fill="url(#logoBg)" />

        {/* bottom bun */}
        <AnimatedG opacity={layers[0]} transform={dropTransform(layers[0])}>
          <Rect x="28" y="90" width="64" height="16" rx="10" fill={bunBottom} />
        </AnimatedG>

        {/* patty */}
        <AnimatedG opacity={layers[1]} transform={dropTransform(layers[1])}>
          <Rect x="30" y="80" width="60" height="12" rx="3" fill={patty} />
        </AnimatedG>

        {/* lettuce */}
        <AnimatedG opacity={layers[2]} transform={dropTransform(layers[2])}>
          <Rect x="26" y="72" width="68" height="10" rx="4" fill={lettuce} />
        </AnimatedG>

        {/* cheese */}
        <AnimatedG opacity={layers[3]} transform={dropTransform(layers[3])}>
          <Rect x="28" y="64" width="64" height="10" rx="2" fill={cheese} />
        </AnimatedG>

        {/* top bun + seeds */}
        <AnimatedG opacity={layers[4]} transform={dropTransform(layers[4])}>
          <Ellipse cx="60" cy="52" rx="30" ry="20" fill={bunTop} />
          {seeds.map((s, i) => (
            <Ellipse key={i} cx={s.cx} cy={s.cy} rx="2" ry="3" fill={seed} />
          ))}
        </AnimatedG>
      </Svg>
    </Animated.View>
  );
}
