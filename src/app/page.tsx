"use client";

import { useEffect, useState } from "react";
import { MacroProgress } from "@/components/MacroProgress";
import { MealHistory } from "@/components/MealHistory";
import { MealLogForm } from "@/components/MealLogForm";
import { NutritionFactCheckPanel } from "@/components/NutritionFactCheckPanel";
import { ProfileForm } from "@/components/ProfileForm";
import { RecommendationCard } from "@/components/RecommendationCard";
import { DayLog, Recommendation, UserProfile } from "@/lib/types";

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dayLog, setDayLog] = useState<DayLog | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

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
    return <div className="p-8 text-sm text-neutral-400">Loading...</div>;
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

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">NutriAgent</h1>
          <p className="text-sm text-neutral-500">Log what you ate. The AI tracks it and tells you what to eat next.</p>
        </div>
        <button
          onClick={() => setEditingProfile(true)}
          className="text-xs text-neutral-400 hover:text-neutral-700"
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
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Today's meals</h2>
        {dayLog && <MealHistory dayLog={dayLog} onDelete={handleDeleteMeal} />}
      </section>

      <section className="mt-6">
        <NutritionFactCheckPanel />
      </section>
    </main>
  );
}
