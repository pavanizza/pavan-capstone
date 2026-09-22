import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { saveProfile } from "../lib/api";
import { colors } from "../lib/theme";
import { ActivityLevel, DietaryPreference, Goal, Sex, UserProfile } from "../lib/types";
import { GymGuyAvatar } from "./GymGuyAvatar";

interface ProfileFormScreenProps {
  initial?: UserProfile | null;
  onSaved: (profile: UserProfile) => void;
}

export function ProfileFormScreen({ initial, onSaved }: ProfileFormScreenProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial?.age?.toString() ?? "25");
  const [sex, setSex] = useState<Sex>(initial?.sex ?? "male");
  const [heightCm, setHeightCm] = useState(initial?.heightCm?.toString() ?? "170");
  const [weightKg, setWeightKg] = useState(initial?.weightKg?.toString() ?? "65");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initial?.activityLevel ?? "moderate");
  const [goal, setGoal] = useState<Goal>(initial?.goal ?? "maintain");
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>(
    initial?.dietaryPreference ?? "non_vegetarian",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const { profile } = await saveProfile({
        name,
        age,
        sex,
        heightCm,
        weightKg,
        activityLevel,
        goal,
        dietaryPreference,
      });
      onSaved(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={{ alignItems: "center", gap: 6 }}>
            <GymGuyAvatar size={96} />
            <Text style={styles.faintCenter}>Your Grub avatar</Text>
          </View>

          <Text style={styles.h1}>Set up your nutrition profile</Text>
          <Text style={styles.subtitle}>This gives Grub the basics it needs to compute your daily targets.</Text>

          <Field label="Name">
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={colors.faintDim} />
          </Field>

          <Field label="Age">
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholderTextColor={colors.faintDim}
            />
          </Field>

          <Field label="Sex">
            <View style={styles.pickerWrap}>
              <Picker selectedValue={sex} onValueChange={setSex} style={styles.picker} dropdownIconColor={colors.paper}>
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
              </Picker>
            </View>
          </Field>

          <Field label="Height (cm)">
            <TextInput
              style={styles.input}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="number-pad"
              placeholderTextColor={colors.faintDim}
            />
          </Field>

          <Field label="Weight (kg)">
            <TextInput
              style={styles.input}
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="number-pad"
              placeholderTextColor={colors.faintDim}
            />
          </Field>

          <Field label="Activity level">
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={activityLevel}
                onValueChange={setActivityLevel}
                style={styles.picker}
                dropdownIconColor={colors.paper}
              >
                <Picker.Item label="Sedentary (little to no exercise)" value="sedentary" />
                <Picker.Item label="Light (1-3 days/week)" value="light" />
                <Picker.Item label="Moderate (3-5 days/week)" value="moderate" />
                <Picker.Item label="Active (6-7 days/week)" value="active" />
                <Picker.Item label="Very active (physical job or 2x/day)" value="very_active" />
              </Picker>
            </View>
          </Field>

          <Field label="Goal">
            <View style={styles.pickerWrap}>
              <Picker selectedValue={goal} onValueChange={setGoal} style={styles.picker} dropdownIconColor={colors.paper}>
                <Picker.Item label="Lose weight" value="lose" />
                <Picker.Item label="Maintain weight" value="maintain" />
                <Picker.Item label="Gain weight / muscle" value="gain" />
              </Picker>
            </View>
          </Field>

          <Field label="Dietary preference">
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={dietaryPreference}
                onValueChange={setDietaryPreference}
                style={styles.picker}
                dropdownIconColor={colors.paper}
              >
                <Picker.Item label="Non-vegetarian" value="non_vegetarian" />
                <Picker.Item label="Vegetarian" value="vegetarian" />
                <Picker.Item label="Eggetarian" value="eggetarian" />
                <Picker.Item label="Vegan" value="vegan" />
                <Picker.Item label="Pescatarian" value="pescatarian" />
              </Picker>
            </View>
          </Field>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable onPress={handleSubmit} disabled={saving} style={[styles.button, saving && styles.buttonDisabled]}>
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Save profile &amp; start tracking</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: colors.ink, padding: 16, justifyContent: "center" },
  card: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 16, padding: 20 },
  faintCenter: { fontSize: 12, color: colors.faint },
  h1: { marginTop: 16, fontSize: 20, fontWeight: "700", color: colors.paper },
  subtitle: { marginTop: 4, fontSize: 13, color: colors.faint },
  label: { fontSize: 13, color: colors.faint, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.paper,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel2,
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: { color: colors.paper },
  error: { marginTop: 14, fontSize: 13, color: colors.red },
  button: {
    marginTop: 20,
    backgroundColor: colors.violet,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
