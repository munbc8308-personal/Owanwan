export const COLOR = {
  concrete: "#EDEBE6",
  concreteDark: "#E1DED7",
  asphalt: "#1F2023",
  lime: "#D7FF3F",
  red: "#E63B2E",
  slate: "#6E7075",
  white: "#FAFAF8",
} as const;

export const AVATAR_COLORS = [
  "#D7FF3F",
  "#B7C7A3",
  "#C9B7A3",
  "#A9B8C9",
  "#C9A9B5",
  "#E8C089",
] as const;

export const SPORT_LABEL = {
  running: "러닝",
  gym: "헬스",
  etc: "기타",
} as const;

export type Sport = keyof typeof SPORT_LABEL;
