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
    <div className="rounded-xl border border-line bg-gradient-to-br from-violet/10 via-panel to-azure/10 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-paper">Next-meal recommendation</h2>
        <button
          onClick={onRequest}
          disabled={loading}
          className="rounded-lg bg-violet px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-strong disabled:opacity-50"
        >
          {loading ? "Thinking..." : "What should I eat next?"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {!recommendation && !loading && !error && (
        <p className="mt-3 text-sm text-faint">
          Log a meal, then ask for a recommendation based on what you have left for the day.
        </p>
      )}

      {recommendation && (
        <div className="mt-3">
          <p className="text-base font-semibold text-paper">{recommendation.mealName}</p>
          <p className="mt-1 text-sm text-paper">{recommendation.description}</p>
          <ul className="mt-2 space-y-0.5 text-xs text-faint">
            {recommendation.items.map((item, i) => (
              <li key={i}>
                • {item.name} ({item.quantity})
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs font-medium text-paper">
            ~{Math.round(recommendation.estimatedMacros.calories)} kcal · P{" "}
            {Math.round(recommendation.estimatedMacros.protein)}g · C{" "}
            {Math.round(recommendation.estimatedMacros.carbs)}g · F{" "}
            {Math.round(recommendation.estimatedMacros.fat)}g
          </div>
          <p className="mt-2 text-xs italic text-faint">{recommendation.rationale}</p>
        </div>
      )}
    </div>
  );
}
