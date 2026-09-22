import { DayLog, NutritionFactCheckReport, Recommendation, UserProfile } from "./types";

// Set with EXPO_PUBLIC_API_URL in mobile/.env (Expo inlines EXPO_PUBLIC_*
// vars at build time - no extra config needed). Must be an address your
// phone/emulator can actually reach - "localhost" means the phone itself,
// not your dev machine. See mobile/README.md for how to find the right
// value (your machine's LAN IP for local dev, or the deployed Railway URL).
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

class ApiError extends Error {}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError(
      `Couldn't reach the Grub server at ${BASE_URL}. Check EXPO_PUBLIC_API_URL in mobile/.env and that the backend is running and reachable from this device.`,
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export function getProfile() {
  return request<{ profile: UserProfile | null }>("/api/profile");
}

export function saveProfile(profile: Record<string, string>) {
  return request<{ profile: UserProfile }>("/api/profile", {
    method: "POST",
    body: JSON.stringify(profile),
  });
}

export function getMeals() {
  return request<{ dayLog: DayLog }>("/api/meals");
}

export function logMeal(description: string) {
  return request<{ dayLog: DayLog }>("/api/meals", {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}

export function deleteMeal(id: string) {
  return request<{ dayLog: DayLog }>(`/api/meals/${id}`, { method: "DELETE" });
}

export function getRecommendation() {
  return request<{ recommendation: Recommendation }>("/api/recommend", { method: "POST" });
}

export function refreshNutritionFacts() {
  return request<{ report: NutritionFactCheckReport }>("/api/nutrition-facts/refresh", { method: "POST" });
}

export { ApiError, BASE_URL };
