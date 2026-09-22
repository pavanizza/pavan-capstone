// Mirrors the web app's @theme tokens in src/app/globals.css.
export const colors = {
  ink: "#0a0a12",
  panel: "#14141f",
  panel2: "#1b1b2c",
  line: "#2a2a40",
  paper: "#ffffff",
  faint: "#ffffff",
  faintDim: "#9291b5", // used only where iOS/Android needs a real secondary tone (e.g. placeholder text)
  violet: "#8b5cf6",
  violetStrong: "#7c3aed",
  azure: "#3b82f6",
  azureStrong: "#2563eb",
  calorie: "#3b82f6",
  protein: "#a855f7",
  carbs: "#6366f1",
  fat: "#d946ef",
  red: "#f87171",
} as const;
