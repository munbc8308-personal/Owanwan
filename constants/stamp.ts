import type { FeedEntry } from "@/types";

export function stampText(entry: FeedEntry): string {
  if (!entry.done || !entry.stats || !entry.time) return "";
  if (entry.sport === "running") {
    const s = entry.stats as { distance: string; pace: string };
    return `${entry.time} · ${s.distance} · ${s.pace}`;
  }
  if (entry.sport === "gym") {
    const s = entry.stats as { part: string; weight: string; sets: string };
    return `${entry.time} · ${s.part} ${s.weight}×${s.sets}`;
  }
  const s = entry.stats as { activity: string; duration: string };
  return `${entry.time} · ${s.activity} ${s.duration}`;
}
