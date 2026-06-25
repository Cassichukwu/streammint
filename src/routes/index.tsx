import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Wallet, Cpu, Coins, Eye, Sparkles, TrendingUp, Lock, Gauge, Radio } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AGENTS, CREATORS, fmtUSD, shortHash } from "@/lib/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StreamMint — Pay Only For What You Consume" },
      { name: "description", content: "AI agents stream USDC nanopayments to creators every second. The protocol for the post-subscription creator economy." },
    ],
  }),
  component: Landing,
});

function useTicker(rate: number, start = 0) {
  const [val, setVal] = useState(start);
  useEffect(() => {
    const t = setInterval(() => setVal((v) => v + rate / 10), 100);
    return () => clearInterval(t);
  }, [rate]);
  return val;
}

function Landing() {
  return (
    <AppShell>
      <Hero />
      <HowItWorks />
      <Benefits />
      <LiveDemo />
      <CTA />
    </AppShell>
  );
}

function Hero() {
  const earned = useTicker(2.4, 18420.62);
  return (
    <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Now settling on Base · 1.2M agent sessions this week</span>
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Pay only for <span className="text-gradient">what you consume.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            StreamMint lets AI agents stream USDC nanopayments to creators — every second of reading, every token of inference, settled on-chain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/reader" className="group inline-flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.03] glow-mint">
              Start streaming <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/explorer" className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium hover:bg-white/10">
              View live flow
            </Link>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-white/5 pt-8">
            {[
              { k: "Paid to creators", v: "$4.2M", sub: "last 30d" },
              { k: "Avg session cost", v: "$0.04", sub: "per agent" },
              { k: "Settlement", v: "<400ms", sub: "Base L2" },
            ].map((s) => (
              <div key={s.k}>
                <dd className="text-2xl font-semibold tracking-tight">{s.v}</dd>
                <dt className="mt-1 text-xs text-muted-foreground">{s.k} · {s.sub}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Hero card */}
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-[40px] bg-gradient-brand opacity-20 blur-3xl" />
          <div className="glass-strong rounded-3xl p-6 shadow-[var(--shadow-elegant)]">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">stream://session_8f2a91</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" /> Live
              </span>
            </div>

            <div className="mt-6">
              <div className="font-mono text-xs uppercase text-muted-foreground">Earnings · @delphi.research</div>
              <div className="mt-2 font-mono text-5xl font-semibold tabular-nums text-gradient">
                {fmtUSD(earned, 4)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">+$0.0024 / second · 14 active readers</div>
            </div>

            <div className="mt-6 space-y-2">
              {AGENTS.slice(0, 4).map((a, i) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 animate-pulse-dot rounded-full" style={{ background: a.color }} />
                    <div>
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{a.model} · {a.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm tabular-nums">+{fmtUSD(0.0012 * (i + 1), 4)}</div>
                    <div className="text-[10px] text-muted-foreground">tick {Math.floor(earned * 10) - i}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
              <span className="text-muted-foreground">Next settlement</span>
              <span className="font-mono text-primary">02.4s</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Wallet, title: "Fund an agent wallet", body: "Top up any AI agent with USDC. No accounts, no subscriptions — just a smart wallet." },
    { icon: Cpu, title: "Agents read & infer", body: "Your agent streams content from creators. StreamMint meters every second of consumption." },
    { icon: Coins, title: "Creators get paid live", body: "USDC nanopayments settle to creators in real time. Splits, royalties and taxes handled on-chain." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader eyebrow="How it works" title="A new economic loop for machine readers" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="glass relative rounded-2xl p-6">
            <div className="absolute right-5 top-5 font-mono text-xs text-muted-foreground">0{i + 1}</div>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand glow-mint">
              <s.icon className="h-5 w-5 text-background" strokeWidth={2.4} />
            </div>
            <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-6 lg:grid-cols-2">
        <BenefitCard
          tag="For creators"
          title="Earn while AI agents read."
          tone="mint"
          items={[
            { icon: TrendingUp, t: "Revenue per second, not per subscriber", d: "Stop chasing churn. Get paid the moment your work is consumed." },
            { icon: Sparkles, t: "Programmable splits", d: "Co-authors, editors, translators — all paid in the same tick." },
            { icon: Radio, t: "Audience telemetry", d: "Anonymized reader graph, intent labels, and agent provenance." },
          ]}
        />
        <BenefitCard
          tag="For readers & agents"
          title="Spend cents, not subscriptions."
          tone="violet"
          items={[
            { icon: Gauge, t: "Pay only for time read", d: "Stop sessions instantly. Refunds are continuous, not policy." },
            { icon: Lock, t: "Wallet-native auth", d: "No login. Your agent's address is your library card." },
            { icon: Eye, t: "Provenance built-in", d: "Every quoted token can be traced back to a paid creator." },
          ]}
        />
      </div>
    </section>
  );
}

function BenefitCard({ tag, title, items, tone }: { tag: string; title: string; tone: "mint" | "violet"; items: { icon: any; t: string; d: string }[] }) {
  return (
    <div className="glass-strong relative overflow-hidden rounded-3xl p-8">
      <div
        className="absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl opacity-30"
        style={{ background: tone === "mint" ? "var(--mint)" : "var(--violet)" }}
      />
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{tag}</div>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h3>
      <ul className="mt-8 space-y-5">
        {items.map((it) => (
          <li key={it.t} className="flex gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5">
              <it.icon className="h-4.5 w-4.5" style={{ color: tone === "mint" ? "var(--mint)" : "var(--violet)" }} />
            </div>
            <div>
              <div className="font-medium">{it.t}</div>
              <div className="text-sm text-muted-foreground">{it.d}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LiveDemo() {
  const [rows, setRows] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      hash: shortHash(1000 + i),
      from: AGENTS[i % AGENTS.length],
      to: CREATORS[i % CREATORS.length],
      amt: 0.0008 + Math.random() * 0.004,
      t: i,
    })),
  );
  const total = useTicker(7.2, 12480.31);

  useEffect(() => {
    const id = setInterval(() => {
      setRows((r) => {
        const next = {
          id: r[0].id + 1,
          hash: shortHash(r[0].id + 1000),
          from: AGENTS[Math.floor(Math.random() * AGENTS.length)],
          to: CREATORS[Math.floor(Math.random() * CREATORS.length)],
          amt: 0.0008 + Math.random() * 0.004,
          t: 0,
        };
        return [next, ...r.slice(0, 5)];
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeader eyebrow="Live revenue" title="Watch the protocol breathe" />
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="glass-strong rounded-2xl p-6">
          <div className="font-mono text-xs uppercase text-muted-foreground">Network throughput · 24h</div>
          <div className="mt-3 font-mono text-5xl font-semibold tabular-nums text-gradient">{fmtUSD(total, 2)}</div>
          <div className="mt-1 text-xs text-muted-foreground">+12.4% vs yesterday · 84,221 settlements</div>

          <div className="mt-8 space-y-4">
            {[
              { k: "Active agents", v: "3,418", w: 78 },
              { k: "Active creators", v: "1,204", w: 56 },
              { k: "Median tick size", v: "$0.0021", w: 42 },
            ].map((m) => (
              <div key={m.k}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{m.k}</span>
                  <span className="font-mono">{m.v}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${m.w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" /> Mempool stream
            </div>
            <Link to="/explorer" className="text-xs text-primary hover:underline">Open explorer →</Link>
          </div>
          <div className="divide-y divide-white/5">
            {rows.map((r, idx) => (
              <div
                key={r.id}
                className={`grid grid-cols-[1.2fr_1fr_1fr_auto] items-center gap-4 px-5 py-3 text-sm transition-colors ${idx === 0 ? "bg-primary/5" : ""}`}
              >
                <div className="font-mono text-xs text-muted-foreground">{r.hash}</div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: r.from.color }} />
                  <span className="truncate">{r.from.name}</span>
                </div>
                <div className="truncate text-muted-foreground">→ {r.to.handle}</div>
                <div className="font-mono tabular-nums text-primary">+{fmtUSD(r.amt, 4)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="glass-strong relative overflow-hidden rounded-3xl p-12 text-center">
        <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "var(--gradient-hero)" }} />
        <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
          The internet is being read by <span className="text-gradient">machines.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Get paid for it. Mint a creator vault in under a minute and start receiving USDC the same day.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/creator" className="rounded-full bg-gradient-brand px-6 py-3 text-sm font-semibold text-background glow-mint">Open creator dashboard</Link>
          <Link to="/reader" className="glass rounded-full px-6 py-3 text-sm font-medium">Try as reader</Link>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <div className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h2>
    </div>
  );
}
