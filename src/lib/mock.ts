// Shared mock data + helpers

export const CREATORS = [
  { handle: "@delphi.research", name: "Delphi Research", avatar: "DR", topic: "On-chain analytics" },
  { handle: "@nina.writes", name: "Nina Park", avatar: "NP", topic: "AI product strategy" },
  { handle: "@kaito.ml", name: "Kaito Ito", avatar: "KI", topic: "Open-source LLMs" },
  { handle: "@harvest.fi", name: "Harvest", avatar: "HV", topic: "DeFi yield" },
  { handle: "@samir.codes", name: "Samir Adel", avatar: "SA", topic: "Distributed systems" },
  { handle: "@lumen.studio", name: "Lumen", avatar: "LM", topic: "Generative design" },
];

export const AGENTS = [
  { id: "agt_01H", name: "Atlas", model: "gpt-5-mini", color: "var(--mint)" },
  { id: "agt_02K", name: "Orion", model: "claude-4-haiku", color: "var(--violet)" },
  { id: "agt_03Q", name: "Lyra", model: "gemini-2.5", color: "var(--chart-3)" },
  { id: "agt_04R", name: "Vega", model: "llama-4-70b", color: "var(--chart-4)" },
];

export const ARTICLES = [
  { id: "a1", title: "The State of MEV in 2026", creator: CREATORS[0], minutes: 14, rate: 0.0024 },
  { id: "a2", title: "Designing for AI-native readers", creator: CREATORS[1], minutes: 9, rate: 0.0018 },
  { id: "a3", title: "Why open-weight models won", creator: CREATORS[2], minutes: 22, rate: 0.0032 },
  { id: "a4", title: "Real yield, finally", creator: CREATORS[3], minutes: 7, rate: 0.0015 },
  { id: "a5", title: "Building globally distributed inference", creator: CREATORS[4], minutes: 18, rate: 0.0028 },
  { id: "a6", title: "The post-typography era", creator: CREATORS[5], minutes: 11, rate: 0.0021 },
];

export function fmtUSD(n: number, digits = 4) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function shortHash(seed: number) {
  const hex = "0123456789abcdef";
  let s = "0x";
  let v = seed;
  for (let i = 0; i < 8; i++) {
    v = (v * 9301 + 49297) % 233280;
    s += hex[Math.floor((v / 233280) * 16)];
  }
  return s + "…" + hex[seed % 16] + hex[(seed * 3) % 16] + hex[(seed * 7) % 16] + hex[(seed * 11) % 16];
}

export function relTime(secondsAgo: number) {
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  return `${Math.floor(secondsAgo / 3600)}h ago`;
}
