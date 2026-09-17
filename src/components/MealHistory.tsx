"use client";

import { DayLog } from "@/lib/types";

interface MealHistoryProps {
  dayLog: DayLog;
  onDelete: (id: string) => void;
}

export function MealHistory({ dayLog, onDelete }: MealHistoryProps) {
  if (dayLog.meals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
        No meals logged yet today. Describe what you ate above to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {[...dayLog.meals].reverse().map((meal) => (
        <div key={meal.id} className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-neutral-900">{meal.description}</p>
              <p className="text-xs text-neutral-400">
                {new Date(meal.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <button
              onClick={() => onDelete(meal.id)}
              className="shrink-0 text-xs text-neutral-400 hover:text-red-600"
            >
              Remove
            </button>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-neutral-600">
            {meal.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {item.name} <span className="text-neutral-400">({item.quantity})</span>
                </span>
                <span>{Math.round(item.macros.calories)} kcal</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 border-t border-neutral-100 pt-2 text-xs font-medium text-neutral-700">
            Total: {Math.round(meal.totals.calories)} kcal · P {Math.round(meal.totals.protein)}g · C{" "}
            {Math.round(meal.totals.carbs)}g · F {Math.round(meal.totals.fat)}g
          </div>
        </div>
      ))}
    </div>
  );
}
