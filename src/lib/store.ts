import fs from "fs";
import path from "path";
import { DB, DayLog } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const EMPTY_DB: DB = {
  profile: null,
  days: {},
  lastRecommendation: null,
};

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readDB(): DB {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    return structuredClone(EMPTY_DB);
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return { ...structuredClone(EMPTY_DB), ...JSON.parse(raw) };
}

export function writeDB(db: DB): void {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getOrCreateTodayLog(db: DB): DayLog {
  const date = todayKey();
  if (!db.days[date]) {
    db.days[date] = {
      date,
      meals: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    };
  }
  return db.days[date];
}
