import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { refreshNutritionFacts } from "../lib/api";
import { colors } from "../lib/theme";
import { NutritionFactCheckReport } from "../lib/types";

export function NutritionFactCheckPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<NutritionFactCheckReport | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const { report } = await refreshNutritionFacts();
      setReport(report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Nutrition fact-check agent</Text>
          <Text style={styles.subtitle}>
            Grounds today&apos;s logged foods against cited Wikipedia data instead of pure AI guesses.
          </Text>
        </View>
        <Pressable onPress={handleRun} disabled={loading} style={[styles.button, loading && styles.buttonDisabled]}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Verify facts</Text>
          )}
        </Pressable>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      {report && (
        <View style={{ marginTop: 10, gap: 4 }}>
          <Text style={styles.reportLine}>
            <Text style={styles.written}>Written: </Text>
            {report.written.join(", ") || "none"}
          </Text>
          <Text style={styles.reportLine}>
            <Text style={styles.faint}>Skipped (fresh): </Text>
            {report.skipped.join(", ") || "none"}
          </Text>
          <Text style={styles.reportLine}>
            <Text style={styles.needsReview}>Needs review: </Text>
            {report.needsReview.map((r) => `${r.food} (${r.why})`).join("; ") || "none"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 12, padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  title: { fontSize: 13, fontWeight: "600", color: colors.paper },
  subtitle: { marginTop: 2, fontSize: 11, color: colors.faint },
  button: { backgroundColor: colors.violet, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  error: { marginTop: 10, fontSize: 13, color: colors.red },
  reportLine: { fontSize: 12, color: colors.faint },
  written: { fontWeight: "600", color: colors.azure },
  faint: { fontWeight: "600", color: colors.faint },
  needsReview: { fontWeight: "600", color: colors.fat },
});
