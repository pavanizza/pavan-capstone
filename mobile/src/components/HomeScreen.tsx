import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";
import { GrubLogo } from "./GrubLogo";

interface HomeScreenProps {
  hasProfile: boolean;
  onContinue: () => void;
}

export function HomeScreen({ hasProfile, onContinue }: HomeScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <GrubLogo size={140} animated />
        <Text style={styles.title}>Grub</Text>
        <Text style={styles.tagline}>Log what you ate.{"\n"}The AI tracks it and tells you what to eat next.</Text>
      </View>

      <Pressable onPress={onContinue} style={styles.button}>
        <Text style={styles.buttonText}>{hasProfile ? "Continue" : "Get started"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  title: { marginTop: 8, fontSize: 36, fontWeight: "800", color: colors.azure },
  tagline: { textAlign: "center", fontSize: 14, color: colors.faint, lineHeight: 20 },
  button: {
    width: "100%",
    backgroundColor: colors.violet,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
