import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";
import { Recommendation } from "../lib/types";

interface RecommendationCardProps {
  recommendation: Recommendation | null;
  loading: boolean;
  error: string | null;
  onRequest: () => void;
}

export function RecommendationCard({ recommendation, loading, error, onRequest }: RecommendationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Next-meal recommendation</Text>
        <Pressable onPress={onRequest} disabled={loading} style={[styles.button, loading && styles.buttonDisabled]}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>What should I eat next?</Text>
          )}
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {!recommendation && !loading && !error && (
        <Text style={styles.placeholder}>
          Log a meal, then ask for a recommendation based on what you have left for the day.
        </Text>
      )}

      {recommendation && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.mealName}>{recommendation.mealName}</Text>
          <Text style={styles.description}>{recommendation.description}</Text>
          {recommendation.items.map((item, i) => (
            <Text key={i} style={styles.item}>
              • {item.name} ({item.quantity})
            </Text>
          ))}
          <Text style={styles.macros}>
            ~{Math.round(recommendation.estimatedMacros.calories)} kcal · P{" "}
            {Math.round(recommendation.estimatedMacros.protein)}g · C{" "}
            {Math.round(recommendation.estimatedMacros.carbs)}g · F{" "}
            {Math.round(recommendation.estimatedMacros.fat)}g
          </Text>
          <Text style={styles.rationale}>{recommendation.rationale}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 12, padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  title: { fontSize: 13, fontWeight: "600", color: colors.paper, flex: 1 },
  button: { backgroundColor: colors.violet, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  error: { marginTop: 10, fontSize: 13, color: colors.red },
  placeholder: { marginTop: 10, fontSize: 13, color: colors.faint },
  mealName: { fontSize: 16, fontWeight: "700", color: colors.paper },
  description: { marginTop: 4, fontSize: 13, color: colors.paper },
  item: { marginTop: 4, fontSize: 12, color: colors.faint },
  macros: { marginTop: 8, fontSize: 12, fontWeight: "600", color: colors.paper },
  rationale: { marginTop: 8, fontSize: 12, fontStyle: "italic", color: colors.faint },
});
