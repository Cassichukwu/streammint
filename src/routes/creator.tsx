import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Users, Sparkles, Globe } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AGENTS, ARTICLES, fmtUSD } from "@/lib/mock";
import { useStream, SPLIT } from "@/lib/stream-store";

export const Route = createFileRoute("/creator")({
  head: () => ({
    meta: [
      { title: "Creator · StreamMint" },
      { name: "description", content: "Live earnings, audience insights, and agent activity for creators." },
    ],
  }),
  component: Creator,
});

const chartData = Array.from({ length: 30 }, (_, i) => ({
  d: `D${i + 1}`,
  rev: 40 + Math.sin(i / 2.4) * 18 + i * 2.1 + Math.random() * 8,
  agents: 80 + Math.sin(i / 3) * 22 + i * 1.4,
}));

function Creator() {
  /**
   * Prompt 3: Connect Reader Agent to Creator Dashboard.
   *
   * We pull live earnings from the global stream store.
   * earnings.creator = 90% of reader's session spend
   * earnings.curator = 5%
   * earnings.platform = 5%
   *
   * The base earnings (8421.60) represent historical earnings.
   * Live session earnings from the Reader Agent are added on top.
   */
  const { state } = useStream();
  const BASE_EARNINGS = 8421.6042;
  const liveCreatorEarnings = BASE_EARNINGS + state.earnings.creator;
  const liveRate = (state.playing ? state.earnings.total / Math.max(1, state.elapsed) * SPLIT.creator : 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <PageHeader />

        {/* Live revenue split panel — shows reader session earnings breakdown */}
        {state.earnings.total > 0 && (
          <div className="mt-6 glass rounded-2xl p-4 border border-primary/20 flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2 text-xs text-primary font-mono uppercase">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />
              Live reader session · revenue split
            </div>
            <div className="flex gap-6 font-mono text-sm">
              <span>Creator <span className="text-primary">(90%) +{fmtUSD(state.earnings.creator, 5)}</span></span>
              <span>Curator <span className="text-muted-foreground">(5%) +{fmtUSD(state.earnings.curator, 5)}</span></span>
              <span>Platform <span className="text-muted-foreground">(5%) +{fmtUSD(state.earnings.platform, 5)}</span></span>
            </div>
          </div>
        )}

        {/* KPI Strip — Live earnings now driven by Reader Agent */}
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <KPI
            label="Live earnings"
            value={fmtUSD(liveCreatorEarnings, 4)}
            delta={state.playing ? `+${fmtUSD(liveRate, 5)}/s` : "+$0.0024/s"}
            highlight
          />
          <KPI label="30d revenue" value="$12,840.21" delta="+18.4%" />
          <KPI label="Active agents" value="3,418" delta="+221 today" />
          <KPI label="Avg dwell" value="6m 42s" delta="+0:18" />
        </div>

        {/* Main */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <RevenueChart />
          <AgentFeed />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <TopArticles />
          <AudienceInsights />
        </div>
      </div>
    </AppShell>
  );
}

function PageHeader() {
  const { state } = useStream();
  const BASE_EARNINGS = 8421.6042;
  const [sellerBalance, setSellerBalance] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/api/seller-balance")
      .then(r => r.json())
      .then(d => setSellerBalance(d.balance))
      .catch(() => {});
  }, [state.earnings.total]);

  function handleExportCSV() {
    const rows = [
      ["Timestamp", "Type", "Amount USDC", "Creator 90%", "Curator 5%", "Platform 5%"],
      [new Date().toISOString(), "Session earnings", state.earnings.total.toFixed(6), state.earnings.creator.toFixed(6), state.earnings.curator.toFixed(6), state.earnings.platform.toFixed(6)],
      [new Date(Date.now() - 86400000).toISOString(), "Historical", BASE_EARNINGS.toFixed(6), (BASE_EARNINGS * 0.9).toFixed(6), (BASE_EARNINGS * 0.05).toFixed(6), (BASE_EARNINGS * 0.05).toFixed(6)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `streammint-earnings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleWithdraw() {
    const balance = sellerBalance ?? "0";
    const destination = window.prompt(
      `Withdraw $${balance} USDC from creator wallet\n\nEnter destination wallet address:`,
      "0xC37DcB82DE94cfFb98be438425B6505f80826A00"
    );
    if (!destination) return;

    const confirmed = window.confirm(
      `Withdraw $${balance} USDC to ${destination.slice(0, 8)}...?\n\nThis will send real USDC on Arc Testnet.`
    );
    if (!confirmed) return;

    setWithdrawing(true);
    try {
      const res = await fetch("http://localhost:3001/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: destination, amount: balance }),
      });
      const data = await res.json();
      if (data.hash) {
        alert(`✅ Withdrawal successful!\n\nTx: ${data.hash}\n\nView on Arc Explorer:\nhttps://testnet.arcscan.app/tx/${data.hash}`);
        setSellerBalance("0");
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      alert("❌ Withdrawal failed. Is the payment server running?");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Dashboard</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Creator</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, <span className="text-foreground">@delphi.research</span>.
          {sellerBalance && <span className="ml-2 font-mono text-xs text-primary">${sellerBalance} USDC available</span>}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleExportCSV} className="glass rounded-full px-4 py-2 text-sm hover:bg-white/10 transition-colors">Export CSV</button>
        <button onClick={handleWithdraw} disabled={withdrawing} className="rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity disabled:opacity-50">
          {withdrawing ? "Withdrawing..." : "Withdraw to bank"}
        </button>
      </div>
    </div>
  );
}

function KPI({ label, value, delta, highlight }: { label: string; value: string; delta: string; highlight?: boolean }) {
  return (
    <div className={`glass-strong relative overflow-hidden rounded-2xl p-5 ${highlight ? "" : ""}`}>
      {highlight && <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />}
      <div className="font-mono text-[10px] uppercase text-muted-foreground">{label}</div>
      <div className={`mt-2 font-mono text-2xl tabular-nums ${highlight ? "text-gradient" : ""}`}>{value}</div>
      <div className="mt-1 text-xs text-primary">{delta}</div>
    </div>
  );
}

function RevenueChart() {
  return (
    <div className="glass-strong rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Revenue · 30 days</h3>
          <p className="text-xs text-muted-foreground">USDC settled · net of protocol fees</p>
        </div>
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-xs">
          {["24h", "7d", "30d", "90d"].map((t, i) => (
            <button key={t} className={`rounded-full px-3 py-1 ${i === 2 ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="mt-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.18 160)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="oklch(0.78 0.18 160)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.22 295)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.65 0.22 295)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="oklch(1 0 0 / 0.05)" vertical={false} />
            <XAxis dataKey="d" stroke="oklch(0.7 0.03 260)" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(0.7 0.03 260)" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "oklch(0.20 0.025 270)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "oklch(0.7 0.03 260)" }}
            />
            <Area type="monotone" dataKey="agents" stroke="oklch(0.65 0.22 295)" strokeWidth={2} fill="url(#g2)" />
            <Area type="monotone" dataKey="rev" stroke="oklch(0.78 0.18 160)" strokeWidth={2} fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AgentFeed() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 7 }, (_, i) => mkAgentEvent(i)),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setItems((p) => [mkAgentEvent(Math.random() * 1e6), ...p.slice(0, 6)]);
    }, 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="glass-strong rounded-3xl p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" /> Agent activity
        </div>
        <span className="text-xs text-muted-foreground">live</span>
      </div>
      <div className="divide-y divide-white/5 max-h-[360px] overflow-hidden">
        {items.map((it, idx) => (
          <div key={it.k} className={`px-5 py-3 text-sm ${idx === 0 ? "bg-primary/5" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: it.agent.color }} />
                <span className="font-medium">{it.agent.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{it.agent.id}</span>
              </div>
              <span className="font-mono tabular-nums text-primary">+{fmtUSD(it.amt, 4)}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground truncate">{it.verb} · {it.article}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function mkAgentEvent(seed: number) {
  const a = AGENTS[Math.floor(Math.random() * AGENTS.length)];
  const verbs = ["started session on", "renewed pay-stream for", "quoted from", "embedded chunk of"];
  return {
    k: `${seed}-${Math.random()}`,
    agent: a,
    verb: verbs[Math.floor(Math.random() * verbs.length)],
    article: ARTICLES[Math.floor(Math.random() * ARTICLES.length)].title,
    amt: 0.0008 + Math.random() * 0.004,
  };
}

function TopArticles() {
  const top = ARTICLES.slice(0, 5).map((a, i) => ({ ...a, rev: 1240 - i * 180 + Math.random() * 80, reads: 4800 - i * 620 }));
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Top articles</h3>
        <TrendingUp className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-4 divide-y divide-white/5">
        {top.map((a, i) => (
          <div key={a.id} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 py-3">
            <div className="font-mono text-xs text-muted-foreground">0{i + 1}</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{a.title}</div>
              <div className="text-xs text-muted-foreground">{a.reads.toLocaleString()} agent reads · {fmtUSD(a.rate, 4)}/s</div>
            </div>
            <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-white/5 md:block">
              <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${100 - i * 16}%` }} />
            </div>
            <div className="font-mono text-sm tabular-nums">{fmtUSD(a.rev, 2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AudienceInsights() {
  const regions = [
    { r: "North America", v: 42, c: "var(--mint)" },
    { r: "Europe", v: 31, c: "var(--violet)" },
    { r: "Asia Pacific", v: 18, c: "var(--chart-3)" },
    { r: "LATAM", v: 6, c: "var(--chart-4)" },
    { r: "Other", v: 3, c: "var(--chart-5)" },
  ];
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Audience insights</h3>
        <Globe className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-5 flex h-3 overflow-hidden rounded-full">
        {regions.map((r) => <div key={r.r} style={{ width: `${r.v}%`, background: r.c }} />)}
      </div>
      <div className="mt-4 space-y-2">
        {regions.map((r) => (
          <div key={r.r} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: r.c }} />
              <span>{r.r}</span>
            </div>
            <span className="font-mono text-muted-foreground">{r.v}%</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Mini icon={Users} label="Unique agents" value="3,418" />
        <Mini icon={Sparkles} label="Quote rate" value="14.2%" />
      </div>
    </div>
  );
}

function Mini({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 font-mono text-lg">{value}</div>
    </div>
  );
}
