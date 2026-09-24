import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { ApiError, getMeals, getProfile } from "./src/lib/api";
import { colors } from "./src/lib/theme";
import { DayLog, UserProfile } from "./src/lib/types";
import { DashboardScreen } from "./src/components/DashboardScreen";
import { HomeScreen } from "./src/components/HomeScreen";
import { PhotoLogScreen } from "./src/components/PhotoLogScreen";
import { ProfileFormScreen } from "./src/components/ProfileFormScreen";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [showPhotoLog, setShowPhotoLog] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [{ profile }, { dayLog }] = await Promise.all([getProfile(), getMeals()]);
        setProfile(profile);
        setDayLog(dayLog);
      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : "Couldn't load Grub.");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.violet} size="large" />
        <StatusBar style="light" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{loadError}</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (showHome) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <HomeScreen hasProfile={!!profile} onContinue={() => setShowHome(false)} />
        <StatusBar style="light" />
      </View>
    );
  }

  if (!profile || editingProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <ProfileFormScreen
          initial={profile}
          onSaved={(p) => {
            setProfile(p);
            setEditingProfile(false);
          }}
        />
        <StatusBar style="light" />
      </View>
    );
  }

  if (showPhotoLog) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ink }}>
        <PhotoLogScreen onLogged={setDayLog} onClose={() => setShowPhotoLog(false)} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <DashboardScreen
        profile={profile}
        dayLog={dayLog ?? { date: "", meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } }}
        setDayLog={setDayLog}
        onEditProfile={() => setEditingProfile(true)}
        onLogPhoto={() => setShowPhotoLog(true)}
      />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { color: colors.paper, fontSize: 14, textAlign: "center" },
});
