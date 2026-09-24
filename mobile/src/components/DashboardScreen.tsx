import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { deleteMeal, getRecommendation, logMeal } from "../lib/api";
import { colors } from "../lib/theme";
import { DayLog, Recommendation, UserProfile } from "../lib/types";
import { GymGuyAvatar } from "./GymGuyAvatar";
import { MacroProgress } from "./MacroProgress";
import { MealHistory } from "./MealHistory";
import { MealLogForm } from "./MealLogForm";
import { NutritionFactCheckPanel } from "./NutritionFactCheckPanel";
import { RecommendationCard } from "./RecommendationCard";

interface DashboardScreenProps {
  profile: UserProfile;
  dayLog: DayLog;
  setDayLog: (d: DayLog) => void;
  onEditProfile: () => void;
  onLogPhoto: () => void;
}

export function DashboardScreen({ profile, dayLog, setDayLog, onEditProfile, onLogPhoto }: DashboardScreenProps) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);

  const totals = dayLog.totals;

  async function handleLogMeal(description: string) {
    const { dayLog: updated } = await logMeal(description);
    setDayLog(updated);
    setRecommendation(null);
    setRecommendError(null);
  }

  async function handleDeleteMeal(id: string) {
    const { dayLog: updated } = await deleteMeal(id);
    setDayLog(updated);
    setRecommendation(null);
    setRecommendError(null);
  }

  async function handleRecommend() {
    setRecommendLoading(true);
    setRecommendError(null);
    try {
      const { recommendation } = await getRecommendation();
      setRecommendation(recommendation);
    } catch (err) {
      setRecommendError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRecommendLoading(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <GymGuyAvatar size={44} />
          <View>
            <Text style={styles.title}>Grub</Text>
            <Text style={styles.subtitle}>{profile.name ? `Hey ${profile.name}` : "Log what you ate"}</Text>
          </View>
        </View>
        <Pressable onPress={onEditProfile}>
          <Text style={styles.editLink}>Edit profile</Text>
        </Pressable>
      </View>

      <View style={styles.macroGrid}>
        <MacroProgress label="Calories" unit="kcal" consumed={totals.calories} target={profile.targets.calories} color={colors.calorie} />
        <MacroProgress label="Protein" unit="g" consumed={totals.protein} target={profile.targets.protein} color={colors.protein} />
        <MacroProgress label="Carbs" unit="g" consumed={totals.carbs} target={profile.targets.carbs} color={colors.carbs} />
        <MacroProgress label="Fat" unit="g" consumed={totals.fat} target={profile.targets.fat} color={colors.fat} />
      </View>

      <View style={styles.section}>
        <MealLogForm onSubmit={handleLogMeal} />
        <Pressable style={styles.photoButton} onPress={onLogPhoto}>
          <Text style={styles.photoButtonText}>📷 Or log a meal with a photo</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <RecommendationCard
          recommendation={recommendation}
          loading={recommendLoading}
          error={recommendError}
          onRequest={handleRecommend}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today&apos;s meals</Text>
        <MealHistory dayLog={dayLog} onDelete={handleDeleteMeal} />
      </View>

      <View style={styles.section}>
        <NutritionFactCheckPanel />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, paddingBottom: 48, gap: 0 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 20, fontWeight: "800", color: colors.azure },
  subtitle: { fontSize: 12, color: colors.faint },
  editLink: { fontSize: 12, color: colors.faint },
  macroGrid: { marginTop: 20, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  section: { marginTop: 20 },
  photoButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel2,
  },
  photoButtonText: { color: colors.paper, fontSize: 13, fontWeight: "600" },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.paper, marginBottom: 10 },
});
