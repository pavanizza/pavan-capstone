"use client";

import { useState } from "react";

interface Report {
  written: string[];
  skipped: string[];
  needsReview: { food: string; why: string }[];
}

export function NutritionFactCheckPanel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);

  async function handleRun() {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/nutrition-facts/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to run the nutrition fact-check agent.");
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-paper">Nutrition fact-check agent</h2>
          <p className="mt-0.5 text-xs text-faint">
            Grounds today&apos;s logged foods against cited, AI-verified data instead of pure AI guesses (Assessment 2&apos;s
            perceive → reason → act → observe agent, wired into this app).
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="shrink-0 rounded-lg bg-violet px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-strong disabled:opacity-50"
        >
          {loading ? "Running..." : "Verify nutrition facts"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {report && (
        <div className="mt-3 space-y-1 text-xs text-faint">
          <p>
            <span className="font-medium text-azure">Written:</span> {report.written.join(", ") || "none"}
          </p>
          <p>
            <span className="font-medium text-faint">Skipped (already fresh):</span>{" "}
            {report.skipped.join(", ") || "none"}
          </p>
          <p>
            <span className="font-medium text-fat">Needs review:</span>{" "}
            {report.needsReview.map((r) => `${r.food} (${r.why})`).join("; ") || "none"}
          </p>
        </div>
      )}
    </div>
  );
}
