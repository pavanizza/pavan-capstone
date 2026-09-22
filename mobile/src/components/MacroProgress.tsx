import { StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";

interface MacroProgressProps {
  label: string;
  unit: string;
  consumed: number;
  target: number;
  color: string;
}

export function MacroProgress({ label, unit, consumed, target, color }: MacroProgressProps) {
  const safeTarget = target > 0 ? target : 1;
  const pct = Math.min(100, Math.max(0, (consumed / safeTarget) * 100));
  const remaining = Math.round(target - consumed);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.faint}>
          {Math.round(consumed)} / {Math.round(target)} {unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.remaining}>
        {remaining >= 0 ? `${remaining} ${unit} remaining` : `${Math.abs(remaining)} ${unit} over target`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "48%",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    borderRadius: 12,
    padding: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  label: { fontSize: 13, fontWeight: "600", color: colors.paper },
  faint: { fontSize: 11, color: colors.faint },
  track: {
    marginTop: 8,
    height: 8,
    width: "100%",
    borderRadius: 999,
    backgroundColor: colors.panel2,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 999 },
  remaining: { marginTop: 4, fontSize: 11, color: colors.faint },
});
