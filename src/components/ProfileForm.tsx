"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/types";

interface ProfileFormProps {
  initial?: UserProfile | null;
  onSaved: (profile: UserProfile) => void;
}

export function ProfileForm({ initial, onSaved }: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [age, setAge] = useState(initial?.age?.toString() ?? "25");
  const [sex, setSex] = useState(initial?.sex ?? "male");
  const [heightCm, setHeightCm] = useState(initial?.heightCm?.toString() ?? "170");
  const [weightKg, setWeightKg] = useState(initial?.weightKg?.toString() ?? "65");
  const [activityLevel, setActivityLevel] = useState(initial?.activityLevel ?? "moderate");
  const [goal, setGoal] = useState(initial?.goal ?? "maintain");
  const [dietaryPreference, setDietaryPreference] = useState(initial?.dietaryPreference ?? "none");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, sex, heightCm, weightKg, activityLevel, goal, dietaryPreference }),
      });
      if (!res.ok) throw new Error("Failed to save profile.");
      const data = await res.json();
      onSaved(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-neutral-900">Set up your nutrition profile</h1>
      <p className="mt-1 text-sm text-neutral-500">
        This gives NutriAgent the basics it needs to compute your daily calorie and macro targets.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
        <label className="col-span-2 flex flex-col gap-1 text-sm text-neutral-700">
          Name
          <input
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Age
          <input
            type="number"
            min={10}
            max={100}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Sex
          <select
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={sex}
            onChange={(e) => setSex(e.target.value as typeof sex)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Height (cm)
          <input
            type="number"
            min={100}
            max={250}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Weight (kg)
          <input
            type="number"
            min={30}
            max={250}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            required
          />
        </label>

        <label className="col-span-2 flex flex-col gap-1 text-sm text-neutral-700">
          Activity level
          <select
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value as typeof activityLevel)}
          >
            <option value="sedentary">Sedentary (little to no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
            <option value="very_active">Very active (physical job or 2x/day)</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Goal
          <select
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={goal}
            onChange={(e) => setGoal(e.target.value as typeof goal)}
          >
            <option value="lose">Lose weight</option>
            <option value="maintain">Maintain weight</option>
            <option value="gain">Gain weight / muscle</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-neutral-700">
          Dietary preference
          <select
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={dietaryPreference}
            onChange={(e) => setDietaryPreference(e.target.value as typeof dietaryPreference)}
          >
            <option value="none">No restriction</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="eggetarian">Eggetarian</option>
            <option value="vegan">Vegan</option>
            <option value="pescatarian">Pescatarian</option>
          </select>
        </label>

        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="col-span-2 mt-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save profile & start tracking"}
        </button>
      </form>
    </div>
  );
}
