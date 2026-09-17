"use client";

import { Recommendation } from "@/lib/types";

interface RecommendationCardProps {
  recommendation: Recommendation | null;
  loading: boolean;
  error: string | null;
  onRequest: () => void;
}

export function RecommendationCard({ recommendation, loading, error, onRequest }: RecommendationCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-emerald-50 to-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">Next-meal recommendation</h2>
        <button
          onClick={onRequest}
          disabled={loading}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {loading ? "Thinking..." : "What should I eat next?"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {!recommendation && !loading && !error && (
        <p className="mt-3 text-sm text-neutral-500">
          Log a meal, then ask for a recommendation based on what you have left for the day.
        </p>
      )}

      {recommendation && (
        <div className="mt-3">
          <p className="text-base font-semibold text-neutral-900">{recommendation.mealName}</p>
          <p className="mt-1 text-sm text-neutral-700">{recommendation.description}</p>
          <ul className="mt-2 space-y-0.5 text-xs text-neutral-600">
            {recommendation.items.map((item, i) => (
              <li key={i}>
                • {item.name} ({item.quantity})
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs font-medium text-neutral-700">
            ~{Math.round(recommendation.estimatedMacros.calories)} kcal · P{" "}
            {Math.round(recommendation.estimatedMacros.protein)}g · C{" "}
            {Math.round(recommendation.estimatedMacros.carbs)}g · F{" "}
            {Math.round(recommendation.estimatedMacros.fat)}g
          </div>
          <p className="mt-2 text-xs italic text-neutral-500">{recommendation.rationale}</p>
        </div>
      )}
    </div>
  );
}
