"use client";

import { DayLog } from "@/lib/types";

interface MealHistoryProps {
  dayLog: DayLog;
  onDelete: (id: string) => void;
}

export function MealHistory({ dayLog, onDelete }: MealHistoryProps) {
  if (dayLog.meals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-faint">
        No meals logged yet today. Describe what you ate above to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {[...dayLog.meals].reverse().map((meal) => (
        <div key={meal.id} className="rounded-xl border border-line bg-panel p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-paper">{meal.description}</p>
              <p className="text-xs text-faint">
                {new Date(meal.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <button
              onClick={() => onDelete(meal.id)}
              className="shrink-0 text-xs text-faint hover:text-red-400"
            >
              Remove
            </button>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-faint">
            {meal.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {item.name} <span className="text-faint">({item.quantity})</span>
                  {item.grounded && (
                    <span
                      title="Grounded in a cited, verified entry from the nutrition-fact-check agent, not just an AI guess"
                      className="ml-1 rounded bg-violet/15 px-1 py-0.5 text-[10px] font-medium text-violet"
                    >
                      ✓ verified
                    </span>
                  )}
                </span>
                <span>{Math.round(item.macros.calories)} kcal</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-line pt-2 text-xs font-medium text-paper">
            Total: {Math.round(meal.totals.calories)} kcal · P {Math.round(meal.totals.protein)}g · C{" "}
            {Math.round(meal.totals.carbs)}g · F {Math.round(meal.totals.fat)}g
          </div>
        </div>
      ))}
    </div>
  );
}
