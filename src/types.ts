import { Timestamp } from "firebase/firestore";

export type FirestoreDate = Timestamp | Date | string | null;

export interface User {
  id: string;
  name: string;
  flagEmoji: string;
  colors?: string[];
  createdAt?: FirestoreDate;
  pin?: string;

  seasonPoints?: Record<string, number>;
  seasonExacts?: Record<string, number>;
  seasonResults?: Record<string, number>;

  totalPoints?: number;
  totalExacts?: number;
  totalResults?: number;

  exacts?: number;
  results?: number;
}

export interface Season {
  id: string;
  name: string;
  status: "active" | "finished";
  startedAt?: FirestoreDate;
  finishedAt?: FirestoreDate;
  finalStandings?: {
    rank: number;
    name: string;
    flagEmoji: string;
    totalPoints: number;
  }[];
}

export interface Week {
  id: string;
  label: string;
  weekNumber: number;
  isActive: boolean;
  isPublished: boolean;
  pointsPublished: boolean;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate?: FirestoreDate | any;
  actualHome: number | null;
  actualAway: number | null;
  externalFixtureId?: number;
  source?: "api-football" | "manual";
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  externalStatus?: string;
}

export interface Prediction {
  id: string;
  userId: string;
  weekId: string;
  matchId: string;
  predictedHome: number;
  predictedAway: number;
  createdAt?: FirestoreDate;
}

export interface UserPoint {
  userId: string;
  points: number;
  bonus?: number;
  bonusPoints?: number;
  totalWeekPoints: number;
  exacts?: number;
  results?: number;
  breakdown?: any[];
}

export function sanitizeFlagEmoji(emoji: string | undefined | null): string {
  if (!emoji) return "⚽";

  const blockedSymbols = ["🔴", "🔵", "🟡", "🟢", "🟣", "🟠", "⚫", "⚪"];

  if (blockedSymbols.includes(emoji)) {
    return "⚽";
  }

  return emoji;
}
