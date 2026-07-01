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
  {
    id: "a1",
    title: "The State of MEV in 2026",
    creator: CREATORS[0],
    minutes: 14,
    rate: 0.0024,
    content: "Maximal Extractable Value has quietly become the defining force shaping blockchain economics in 2026. What began as a niche concern for Ethereum validators has evolved into a multi-billion dollar industry spanning every major L1 and L2.\n\nThe numbers are staggering. In Q1 2026 alone, MEV extraction on Ethereum exceeded $2.1 billion - a 340% increase from the same period two years ago.\n\nThe Rise of Cross-Chain MEV\n\nWith the proliferation of bridges and cross-chain protocols, arbitrageurs now operate across dozens of chains simultaneously. A single MEV bot might exploit a price discrepancy between Uniswap on Ethereum, Trader Joe on Avalanche, and a DEX on Arc all within the same block window.\n\nThe Democratization Problem\n\nThe irony of MEV in 2026 is that while the total value extracted has grown, the number of entities capturing that value has shrunk. The top 5 MEV bots now account for 71% of all extracted value.\n\nWhat is Actually Working\n\nThe most promising developments have come from application-layer solutions. Intent-based architectures have proven remarkably effective at reducing harmful MEV. Protocols like CoW Protocol and UniswapX now process over $800M in daily volume with MEV leakage reduced by an estimated 78%.",
  },
  {
    id: "a2",
    title: "Designing for AI-native readers",
    creator: CREATORS[1],
    minutes: 9,
    rate: 0.0018,
    content: "We are entering an era where the primary consumer of written content is not human. AI agents read, summarize, and act on information at a scale and speed no human can match. This has profound implications for how we design content experiences.\n\nThe Agent Reader is Different\n\nA human reader skims, backtracks, and makes intuitive leaps. An AI agent is systematic - it processes sequentially, weights recency, and struggles with ambiguity. Designing for both simultaneously requires rethinking fundamental assumptions about what reading means.\n\nSemantic Density Over Narrative Flow\n\nTraditional long-form writing prizes narrative arc. AI agents do not reward narrative. They reward semantic density: the maximum amount of accurate, actionable information per token.\n\nThe Economics of Attention\n\nPlatforms like StreamMint are making the economics explicit: content is worth exactly what readers pay to access it, measured in real time. When an AI agent can programmatically evaluate content quality and pay accordingly, clickbait dies.",
  },
  {
    id: "a3",
    title: "Why open-weight models won",
    creator: CREATORS[2],
    minutes: 22,
    rate: 0.0032,
    content: "In January 2024, the conventional wisdom held that frontier AI would remain the exclusive domain of a handful of well-capitalized labs. By mid-2026, that consensus has been decisively overturned. Open-weight models now power the majority of AI applications in production.\n\nThe Capability Convergence\n\nThe capability gap between frontier closed models and the best open-weight alternatives has narrowed dramatically. On most practical benchmarks - coding, reasoning, instruction following - models like Llama 4 and Mistral Large perform within 5-8% of GPT-5 and Claude 4.\n\nThe Trust Asymmetry\n\nEnterprises discovered a fundamental problem with closed API models: you are trusting a third party with your most sensitive data. Open-weight models solve the trust problem by making it disappear. When you run the model yourself, there is no third party.\n\nThe Ecosystem Effect\n\nThe decisive factor was ecosystem. Open-weight models attracted a density of tooling and community knowledge that closed models could not match. Closed model providers optimized for capturing value. Open-weight communities optimized for creating it. In the long run, value creation wins.",
  },
  {
    id: "a4",
    title: "Real yield, finally",
    creator: CREATORS[3],
    minutes: 7,
    rate: 0.0015,
    content: "The phrase real yield entered the DeFi lexicon in 2022 as a reaction to the unsustainable token emission models that had dominated the previous bull cycle. Four years later, we can finally say with confidence: real yield is here, it works, and it is changing who wins in DeFi.\n\nWhat Real Yield Actually Means\n\nReal yield means protocol revenue distributed to stakeholders - not newly minted tokens inflating supply, but actual fees generated from actual economic activity. A protocol generating $10M in annualized fees that distributes $8M to liquidity providers is building something durable.\n\nThe StreamMint Model\n\nPay-per-second content protocols represent a new frontier for real yield. Every second a reader spends consuming content generates a micropayment. 90% flows to creators, 5% to curators, 5% to the platform - all in real time, all on-chain. No token emissions, no unsustainable incentives. Just economic value exchanged for content value, continuously, transparently, on Arc.",
  },
  {
    id: "a5",
    title: "Building globally distributed inference",
    creator: CREATORS[4],
    minutes: 18,
    rate: 0.0028,
    content: "Running large language models at scale is a distributed systems problem disguised as an AI problem. The teams that are winning in inference infrastructure understand this distinction.\n\nThe Latency Imperative\n\nFor most AI applications, model quality is table stakes. What differentiates products is latency. A response in 200ms feels magical. A response in 2 seconds feels broken, even if the content is identical.\n\nThe Architecture That Works\n\nThe most effective globally distributed inference systems share a common architecture: a thin routing layer that sits close to users and makes real-time decisions about where to send each request, backed by a network of inference nodes distributed across major population centers.\n\nCold Start is the Enemy\n\nThe most underappreciated challenge in distributed inference is cold start. Loading a 70B parameter model into GPU memory takes 30-90 seconds depending on hardware. The solutions - model caching, predictive pre-warming, graceful traffic shaping - are well-understood in principle but difficult to implement correctly in production.",
  },
  {
    id: "a6",
    title: "The post-typography era",
    creator: CREATORS[5],
    minutes: 11,
    rate: 0.0021,
    content: "Typography has governed visual communication for five centuries. The rules - hierarchy, rhythm, contrast, readability - were forged in the age of movable type and refined through the digital revolution. We are now entering a period where those rules are being renegotiated by AI.\n\nWhat Generative Design Changes\n\nTraditional typography is static. A designer makes decisions and those decisions persist unchanged. Generative design breaks this contract. When layout decisions are made dynamically, in response to content and context, the relationship between content and form becomes fluid.\n\nThe Readability Paradox\n\nThe uncomfortable truth that generative design reveals is that much of traditional typographic convention is aesthetic preference masquerading as readability science. When AI systems optimize directly for reading comprehension, they often arrive at solutions that violate typographic convention but outperform it.\n\nWhat Survives\n\nNot everything changes. The underlying cognitive science of reading reflects how human brains process visual information. That does not change because we have AI. What changes is who enforces these principles and how.",
  },
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
  return s + "..." + hex[seed % 16] + hex[(seed * 3) % 16] + hex[(seed * 7) % 16] + hex[(seed * 11) % 16];
}

export function relTime(secondsAgo: number) {
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  return `${Math.floor(secondsAgo / 3600)}h ago`;
}
