import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../lib/theme";

interface MealLogFormProps {
  onSubmit: (description: string) => Promise<void>;
}

export function MealLogForm({ onSubmit }: MealLogFormProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!description.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(description.trim());
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log that meal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>What did you eat?</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={2}
        placeholder="e.g. I had 2 rotis, paneer curry and a bowl of curd"
        placeholderTextColor={colors.faintDim}
        value={description}
        onChangeText={setDescription}
        editable={!loading}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        onPress={handleSubmit}
        disabled={loading || !description.trim()}
        style={[styles.button, (loading || !description.trim()) && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Log meal</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 12, padding: 16 },
  label: { fontSize: 13, fontWeight: "600", color: colors.faint },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel2,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: colors.paper,
    minHeight: 60,
    textAlignVertical: "top",
  },
  error: { marginTop: 8, fontSize: 13, color: colors.red },
  button: {
    marginTop: 12,
    backgroundColor: colors.azure,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
