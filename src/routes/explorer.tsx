import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ArrowRight, Activity } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AGENTS, CREATORS, fmtUSD, relTime, shortHash } from "@/lib/mock";

export const Route = createFileRoute("/explorer")({
  head: () => ({
    meta: [
      { title: "Explorer · StreamMint" },
      { name: "description", content: "Real-time micropayments, revenue splits, and wallet activity on StreamMint." },
    ],
  }),
  component: Explorer,
});

type Tx = {
  hash: string;
  block: number;
  agent: typeof AGENTS[number];
  creator: typeof CREATORS[number];
  amt: number;
  split: { creator: number; editor: number; protocol: number };
  age: number;
};

function mk(seed: number): Tx {
  const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  const c = CREATORS[Math.floor(Math.random() * CREATORS.length)];
  const amt = 0.0006 + Math.random() * 0.008;
  return {
    hash: shortHash(seed),
    block: 18_402_188 + Math.floor(seed % 9999),
    agent: a,
    creator: c,
    amt,
    split: { creator: amt * 0.90, editor: amt * 0.05, protocol: amt * 0.05 },
    age: Math.floor(Math.random() * 18),
  };
}

function Explorer() {
  const [txs, setTxs] = useState<Tx[]>(() => Array.from({ length: 14 }, (_, i) => mk(i + 100)));
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Tx | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setTxs((p) => [mk(Math.floor(Math.random() * 1e6)), ...p.slice(0, 19)]);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    if (!q) return txs;
    const t = q.toLowerCase();
    return txs.filter((x) => x.hash.includes(t) || x.agent.name.toLowerCase().includes(t) || x.creator.handle.includes(t));
  }, [txs, q]);

  const totalFlow = txs.reduce((s, t) => s + t.amt, 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">Network</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Transaction Explorer</h1>
            <p className="mt-1 text-muted-foreground">Real-time micropayments · Arc Testnet · Block #{(18_402_188).toLocaleString()}</p>
          </div>
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by hash, agent, creator…"
              className="w-80 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat label="Flow / window" value={fmtUSD(totalFlow, 4)} sub="last 20 tx" accent />
          <Stat label="Avg micropayment" value={fmtUSD(totalFlow / Math.max(1, txs.length), 4)} sub="USDC" />
          <Stat label="Protocol fee" value="5.0%" sub="creator-elected" />
          <Stat label="Settlement" value="384ms" sub="p95" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="glass-strong overflow-hidden rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-primary" /> Live mempool
              </div>
              <span className="text-xs text-muted-foreground">{filtered.length} txs</span>
            </div>

            <div className="grid grid-cols-[1.2fr_1.2fr_1.2fr_0.8fr_auto] gap-3 border-b border-white/5 px-5 py-2 font-mono text-[10px] uppercase text-muted-foreground">
              <span>Tx hash</span><span>From agent</span><span>To creator</span><span>Amount</span><span>Age</span>
            </div>

            <div className="max-h-[520px] divide-y divide-white/5 overflow-y-auto">
              {filtered.map((t, idx) => (
                <button
                  key={t.hash + idx}
                  onClick={() => setSelected(t)}
                  className={`grid w-full grid-cols-[1.2fr_1.2fr_1.2fr_0.8fr_auto] items-center gap-3 px-5 py-3 text-left text-sm transition-colors hover:bg-white/5 ${idx === 0 ? "bg-primary/5" : ""} ${selected?.hash === t.hash ? "bg-white/10" : ""}`}
                >
                  <span className="font-mono text-xs text-primary truncate">{t.hash}</span>
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-2 w-2 rounded-full" style={{ background: t.agent.color }} />
                    {t.agent.name}
                  </span>
                  <span className="truncate text-muted-foreground">{t.creator.handle}</span>
                  <span className="font-mono tabular-nums text-primary">+{fmtUSD(t.amt, 4)}</span>
                  <span className="font-mono text-xs text-muted-foreground">{relTime(t.age)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <TxDetail tx={selected ?? txs[0]} />
        </div>

        <WalletActivity />
      </div>
    </AppShell>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="font-mono text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className={`mt-2 font-mono text-2xl tabular-nums ${accent ? "text-gradient" : ""}`}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function TxDetail({ tx }: { tx: Tx }) {
  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="font-mono text-[10px] uppercase text-muted-foreground">Transaction</div>
      <div className="mt-2 break-all font-mono text-sm text-primary">{tx.hash}</div>
      <div className="mt-1 font-mono text-xs text-muted-foreground">Block #{tx.block.toLocaleString()} · {relTime(tx.age)}</div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">From</div>
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ background: tx.agent.color }} />
              {tx.agent.name}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="text-right">
            <div className="text-xs text-muted-foreground">To</div>
            <div className="mt-1 text-sm">{tx.creator.name}</div>
          </div>
        </div>
        <div className="mt-4 border-t border-white/5 pt-4 text-center">
          <div className="font-mono text-3xl font-semibold tabular-nums text-gradient">{fmtUSD(tx.amt, 6)}</div>
          <div className="mt-1 text-[10px] uppercase text-muted-foreground">USDC · Base</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">Revenue split</div>
        <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
          <div style={{ width: "90%", background: "var(--mint)" }} />
          <div style={{ width: "5%", background: "var(--violet)" }} />
          <div style={{ width: "5%", background: "var(--chart-4)" }} />
        </div>
        <div className="mt-3 space-y-1.5 text-xs">
          <SplitRow color="var(--mint)" label="Creator (90%)" v={tx.split.creator} />
          <SplitRow color="var(--violet)" label="Curator (5%)" v={tx.split.editor} />
          <SplitRow color="var(--chart-4)" label="Protocol (5%)" v={tx.split.protocol} />
        </div>
      </div>
    </div>
  );
}

function SplitRow({ color, label, v }: { color: string; label: string; v: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-mono tabular-nums">{fmtUSD(v, 6)}</span>
    </div>
  );
}

function WalletActivity() {
  const wallets = [
    { addr: "0x7f3a…91c2", type: "Agent", name: "Atlas", flow: 412.84, dir: "out" },
    { addr: "0x18bc…7d04", type: "Creator vault", name: "@delphi.research", flow: 1240.12, dir: "in" },
    { addr: "0xa9e1…0f3a", type: "Agent", name: "Orion", flow: 318.20, dir: "out" },
    { addr: "0x44d2…b8f9", type: "Creator vault", name: "@nina.writes", flow: 982.05, dir: "in" },
    { addr: "0x91c8…22ad", type: "Splitter", name: "Editor pool · #04", flow: 144.61, dir: "in" },
  ];
  return (
    <div className="mt-6 glass rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top wallet activity</h3>
        <span className="font-mono text-xs text-muted-foreground">last hour</span>
      </div>
      <div className="mt-4 divide-y divide-white/5">
        {wallets.map((w) => (
          <div key={w.addr} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-3 text-sm">
            <div>
              <div className="font-medium">{w.name}</div>
              <div className="font-mono text-xs text-muted-foreground">{w.addr}</div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{w.type}</span>
            <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-white/5 md:block">
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, w.flow / 14)}%`, background: w.dir === "in" ? "var(--mint)" : "var(--violet)" }} />
            </div>
            <div className={`font-mono tabular-nums ${w.dir === "in" ? "text-primary" : "text-accent"}`}>
              {w.dir === "in" ? "+" : "−"}{fmtUSD(w.flow, 2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
