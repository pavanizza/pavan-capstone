"use client";

import { useEffect, useState } from "react";
import { IntroScreen } from "@/components/IntroScreen";
import { MacroProgress } from "@/components/MacroProgress";
import { MealHistory } from "@/components/MealHistory";
import { MealLogForm } from "@/components/MealLogForm";
import { NutritionFactCheckPanel } from "@/components/NutritionFactCheckPanel";
import { ProfileForm } from "@/components/ProfileForm";
import { RecommendationCard } from "@/components/RecommendationCard";
import { getAvatarComponent } from "@/lib/avatars";
import { DayLog, Recommendation, UserProfile } from "@/lib/types";

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    (async () => {
      const [profileRes, mealsRes] = await Promise.all([fetch("/api/profile"), fetch("/api/meals")]);
      const profileData = await profileRes.json();
      const mealsData = await mealsRes.json();
      setProfile(profileData.profile);
      setDayLog(mealsData.dayLog);
      setLoaded(true);
    })();
  }, []);

  async function handleLogMeal(description: string) {
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to log meal.");
    setDayLog(data.dayLog);
    setRecommendation(null);
    setRecommendError(null);
  }

  async function handleDeleteMeal(id: string) {
    const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setDayLog(data.dayLog);
      setRecommendation(null);
      setRecommendError(null);
    }
  }

  async function handleRecommend() {
    setRecommendLoading(true);
    setRecommendError(null);
    try {
      const res = await fetch("/api/recommend", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get a recommendation.");
      setRecommendation(data.recommendation);
    } catch (err) {
      setRecommendError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRecommendLoading(false);
    }
  }

  if (!loaded) {
    return <div className="p-8 text-sm text-faint">Loading...</div>;
  }

  if (showIntro) {
    return (
      <main className="px-4 py-10">
        <IntroScreen onGetStarted={() => setShowIntro(false)} />
      </main>
    );
  }

  if (!profile || editingProfile) {
    return (
      <main className="px-4 py-10">
        <ProfileForm
          initial={profile}
          onSaved={(p) => {
            setProfile(p);
            setEditingProfile(false);
          }}
        />
      </main>
    );
  }

  const totals = dayLog?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const Avatar = getAvatarComponent(profile.avatarId);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar size={48} className="shrink-0" />
          <div>
            <h1 className="bg-gradient-to-r from-azure to-violet bg-clip-text text-2xl font-bold text-transparent">
              Grub.
            </h1>
          </div>
        </div>
        <button
          onClick={() => setEditingProfile(true)}
          className="shrink-0 text-xs text-faint hover:text-paper"
        >
          Edit profile
        </button>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MacroProgress label="Calories" unit="kcal" consumed={totals.calories} target={profile.targets.calories} colorClass="bg-calorie" />
        <MacroProgress label="Protein" unit="g" consumed={totals.protein} target={profile.targets.protein} colorClass="bg-protein" />
        <MacroProgress label="Carbs" unit="g" consumed={totals.carbs} target={profile.targets.carbs} colorClass="bg-carbs" />
        <MacroProgress label="Fat" unit="g" consumed={totals.fat} target={profile.targets.fat} colorClass="bg-fat" />
      </section>

      <section className="mt-6">
        <MealLogForm onSubmit={handleLogMeal} />
      </section>

      <section className="mt-6">
        <RecommendationCard
          recommendation={recommendation}
          loading={recommendLoading}
          error={recommendError}
          onRequest={handleRecommend}
        />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-paper">Today's meals</h2>
        {dayLog && <MealHistory dayLog={dayLog} onDelete={handleDeleteMeal} />}
      </section>

      <section className="mt-6">
        <NutritionFactCheckPanel />
      </section>
    </main>
  );
}
