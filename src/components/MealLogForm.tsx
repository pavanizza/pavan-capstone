"use client";

import { useState } from "react";

interface MealLogFormProps {
  onSubmit: (description: string) => Promise<void>;
}

export function MealLogForm({ onSubmit }: MealLogFormProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
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
    <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-4">
      <label className="text-sm font-medium text-neutral-700">What did you eat?</label>
      <textarea
        className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        rows={2}
        placeholder="e.g. I had 2 rotis, paneer curry and a bowl of curd"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !description.trim()}
        className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Estimating macros..." : "Log meal"}
      </button>
    </form>
  );
}
