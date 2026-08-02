import type { Sport } from "@/constants/theme";

export interface Member {
  id: string;
  name: string;
  isOwner: boolean;
  color: string;
}

export interface FeedEntry {
  id: string;
  name: string;
  done: boolean;
  color: string | null;
  sport: Sport | null;
  time: string | null;
  stats: RunningStats | GymStats | EtcStats | null;
  route?: [number, number][];
}

export interface RunningStats {
  distance: string;
  pace: string;
  duration?: string;
}

export interface GymStats {
  part: string;
  weight: string;
  sets: string;
}

export interface EtcStats {
  activity: string;
  duration: string;
}

export interface Group {
  id: string;
  name: string;
  isOwner: boolean;
  code: string;
  streak: number;
  members: Member[];
}

export interface ChallengeParticipant {
  name: string;
  color: string;
  progress: number;
}

export interface Challenge {
  id: string;
  title: string;
  sport: Sport;
  groupGoal: boolean;
  desc: string;
  period: string;
  unit: string;
  goal: number;
  days: string;
  joined: boolean;
  participants: ChallengeParticipant[];
  rules: string[];
}

export interface ChallengeTemplate {
  id: string;
  title: string;
  sport: Sport;
  groupGoal: boolean;
  desc: string;
  period: string;
  unit: string;
  goal: number;
  rules: string[];
  periodDays: number;
}
