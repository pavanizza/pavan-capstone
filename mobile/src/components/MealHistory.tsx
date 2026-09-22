import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";
import { DayLog } from "../lib/types";

interface MealHistoryProps {
  dayLog: DayLog;
  onDelete: (id: string) => void;
}

export function MealHistory({ dayLog, onDelete }: MealHistoryProps) {
  if (dayLog.meals.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No meals logged yet today. Describe what you ate above to get started.</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {[...dayLog.meals].reverse().map((meal) => (
        <View key={meal.id} style={styles.card}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.description}>{meal.description}</Text>
              <Text style={styles.time}>
                {new Date(meal.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </View>
            <Pressable onPress={() => onDelete(meal.id)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>

          {meal.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.name} <Text style={styles.faint}>({item.quantity})</Text>
                {item.grounded ? <Text style={styles.badge}>  ✓ verified</Text> : null}
              </Text>
              <Text style={styles.faint}>{Math.round(item.macros.calories)} kcal</Text>
            </View>
          ))}

          <View style={styles.totalsRow}>
            <Text style={styles.totalsText}>
              Total: {Math.round(meal.totals.calories)} kcal · P {Math.round(meal.totals.protein)}g · C{" "}
              {Math.round(meal.totals.carbs)}g · F {Math.round(meal.totals.fat)}g
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.line,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  emptyText: { fontSize: 13, color: colors.faint, textAlign: "center" },
  card: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 12, padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  description: { fontSize: 14, fontWeight: "600", color: colors.paper },
  time: { fontSize: 11, color: colors.faint, marginTop: 2 },
  remove: { fontSize: 12, color: colors.faint },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  itemName: { fontSize: 12, color: colors.faint, flex: 1, paddingRight: 8 },
  faint: { color: colors.faint },
  badge: { fontSize: 10, fontWeight: "600", color: colors.violet },
  totalsRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.line },
  totalsText: { fontSize: 12, fontWeight: "600", color: colors.paper },
});
