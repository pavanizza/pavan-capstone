import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getRecommendation, logMealPhoto } from "../lib/api";
import { colors } from "../lib/theme";
import { DayLog, MealEntry, Recommendation } from "../lib/types";
import { RecommendationCard } from "./RecommendationCard";

interface PhotoLogScreenProps {
  onLogged: (dayLog: DayLog) => void;
  onClose: () => void;
}

type Stage = "pick" | "preview" | "result";

export function PhotoLogScreen({ onLogged, onClose }: PhotoLogScreenProps) {
  const [stage, setStage] = useState<Stage>("pick");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealEntry | null>(null);

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);

  async function pick(source: "camera" | "library") {
    setError(null);
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(`Grub needs ${source === "camera" ? "camera" : "photo library"} access to log a meal this way.`);
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      base64: true,
      quality: 0.6,
      allowsEditing: true,
    };
    const result = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled || !result.assets[0]?.base64) return;
    setPhotoUri(result.assets[0].uri);
    setPhotoBase64(result.assets[0].base64);
    setStage("preview");
  }

  async function analyze() {
    if (!photoBase64) return;
    setAnalyzing(true);
    setError(null);
    try {
      // expo-image-picker's base64 output is always JPEG-encoded data
      // regardless of the source format - see ImagePickerAsset.base64 docs.
      const { meal, dayLog } = await logMealPhoto(photoBase64, "image/jpeg");
      setMeal(meal);
      onLogged(dayLog);
      setStage("result");
      requestRecommendation();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze that photo.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function requestRecommendation() {
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

  function reset() {
    setStage("pick");
    setPhotoUri(null);
    setPhotoBase64(null);
    setMeal(null);
    setRecommendation(null);
    setError(null);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Log a meal with a photo</Text>
        <Pressable onPress={onClose}>
          <Text style={styles.close}>Close</Text>
        </Pressable>
      </View>

      {stage === "pick" && (
        <View style={styles.card}>
          <Text style={styles.body}>Take a photo of your plate, or pick one from your library.</Text>
          <Pressable style={styles.primaryButton} onPress={() => pick("camera")}>
            <Text style={styles.primaryButtonText}>📷 Take photo</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => pick("library")}>
            <Text style={styles.secondaryButtonText}>Choose from library</Text>
          </Pressable>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      )}

      {stage === "preview" && photoUri && (
        <View style={styles.card}>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={styles.primaryButton} onPress={analyze} disabled={analyzing}>
            {analyzing ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Analyze meal</Text>}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={reset} disabled={analyzing}>
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </Pressable>
        </View>
      )}

      {stage === "result" && meal && (
        <View style={{ gap: 16 }}>
          <View style={styles.card}>
            {photoUri && <Image source={{ uri: photoUri }} style={styles.previewSmall} />}
            <Text style={styles.mealTitle}>{meal.description}</Text>
            {meal.items.map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <Text style={styles.itemName}>
                  {item.name} <Text style={styles.faint}>({item.quantity})</Text>
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

          <RecommendationCard
            recommendation={recommendation}
            loading={recommendLoading}
            error={recommendError}
            onRequest={requestRecommendation}
          />

          <Pressable style={styles.secondaryButton} onPress={reset}>
            <Text style={styles.secondaryButtonText}>Log another photo</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 16, paddingBottom: 48 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: colors.paper },
  close: { fontSize: 13, color: colors.faint },
  card: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 12, padding: 16 },
  body: { fontSize: 14, color: colors.faint, marginBottom: 16 },
  primaryButton: { backgroundColor: colors.azure, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryButton: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 10, borderWidth: 1, borderColor: colors.line },
  secondaryButtonText: { color: colors.paper, fontSize: 14, fontWeight: "600" },
  error: { marginTop: 10, fontSize: 13, color: colors.red },
  preview: { width: "100%", aspectRatio: 1, borderRadius: 10, backgroundColor: colors.panel2 },
  previewSmall: { width: 96, height: 96, borderRadius: 10, backgroundColor: colors.panel2, marginBottom: 12 },
  mealTitle: { fontSize: 16, fontWeight: "700", color: colors.paper, marginBottom: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  itemName: { fontSize: 12, color: colors.faint, flex: 1, paddingRight: 8 },
  faint: { color: colors.faint },
  totalsRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line },
  totalsText: { fontSize: 12, fontWeight: "600", color: colors.paper },
});
