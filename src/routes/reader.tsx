import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pause, Play, Wallet, Clock, BookOpen, Sparkles, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ARTICLES, fmtUSD } from "@/lib/mock";
import { useStream, RATE_PER_SECOND } from "@/lib/stream-store";

export const Route = createFileRoute("/reader")({
  head: () => ({
    meta: [
      { title: "Reader · StreamMint" },
      { name: "description", content: "Your reader wallet, live consumption, and recommendations." },
    ],
  }),
  component: Reader,
});

function WalletConnect({ onConnect }: { onConnect: (address: string) => void }) {
  const [address, setAddress] = useState<string | null>(null);

  async function connect() {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          onConnect(accounts[0]);
          try {
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x4CFE12" }],
            });
          } catch {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x4CFE12",
                chainName: "Arc Testnet",
                nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
                rpcUrls: ["https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_a68619df82c65562963c336a0216fc4cb3bcf592321d71fc9418d34dc31df47a"],
                blockExplorerUrls: ["https://testnet.arcscan.app"],
              }],
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      window.open("https://metamask.io", "_blank");
    }
  }

  function disconnect() {
    setAddress(null);
    onConnect("");
  }

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">USDC</span>
      {address ? (
        <button onClick={disconnect} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] hover:bg-white/10">
          {address.slice(0, 6)}...{address.slice(-4)} · Disconnect
        </button>
      ) : (
        <button onClick={connect} className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary hover:bg-primary/20">
          Connect Wallet
        </button>
      )}
    </div>
  );
}

function Reader() {
  const { state, pause, resume } = useStream();
  const { balance, elapsed, sessionSpend, playing } = state;
  const [currentIndex, setCurrentIndex] = useState(2);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const current = ARTICLES[currentIndex];

  async function handleConnect(address: string) {
    if (!address) { setWalletBalance(null); return; }
    try {
      const res = await fetch(`http://localhost:3001/api/balance?address=${address}`);
      const data = await res.json();
      setWalletBalance(parseFloat(data.balance));
    } catch {
      setWalletBalance(null);
    }
  }

  const displayBalance = walletBalance !== null ? walletBalance : balance;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <PageHeader title="Reader" subtitle="Your wallet, your time, your bytes." />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1.4fr]">
          {/* Wallet */}
          <div className="glass-strong relative overflow-hidden rounded-3xl p-7">
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" /> Wallet · Arc Testnet
              </div>
              <WalletConnect onConnect={handleConnect} />
            </div>
            <div className="mt-6">
              <div className="font-mono text-6xl font-semibold tabular-nums tracking-tight">
                ${displayBalance.toFixed(4)}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                ≈ {Math.floor(displayBalance / RATE_PER_SECOND).toLocaleString()} seconds of reading at current rate
              </div>
            </div>
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { l: "Today", v: fmtUSD(sessionSpend, 4) },
                { l: "Rate/s", v: fmtUSD(RATE_PER_SECOND, 5) },
                { l: "Session", v: fmtUSD(sessionSpend, 4) },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">{s.l}</div>
                  <div className="mt-1 font-mono text-lg">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => window.open("https://faucet.circle.com/", "_blank")}
                className="flex-1 rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-background"
              >
                Top up USDC ↗
              </button>
              <button
                onClick={() => {
                  const confirmed = window.confirm(
                    `Withdraw USDC?\n\nThis will initiate an on-chain transfer from your Arc streaming wallet.`
                  );
                  if (confirmed) {
                    alert(`Withdrawal initiated!\n\nYour USDC will settle on Arc Testnet within ~2 seconds.`);
                  }
                }}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Active reading session */}
          <div className="glass-strong rounded-3xl p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" /> Active session
              </div>
              <button
                onClick={() => (playing ? pause() : resume())}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
              >
                {playing
                  ? <><Pause className="h-3.5 w-3.5" /> Pause stream</>
                  : elapsed === 0
                  ? <><Play className="h-3.5 w-3.5" /> Start streaming</>
                  : <><Play className="h-3.5 w-3.5" /> Resume</>}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-[1fr_auto] gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">{current.title}</h3>
                <div className="mt-1 text-sm text-muted-foreground">{current.creator.name} · {current.creator.topic}</div>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-background font-mono font-semibold">
                {current.creator.avatar}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <Metric icon={Clock} label="Time read" value={`${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`} />
              <Metric icon={Sparkles} label="Cost / second" value={fmtUSD(RATE_PER_SECOND, 5)} accent />
              <Metric icon={Wallet} label="Session spend" value={fmtUSD(sessionSpend, 4)} />
            </div>

            {state.lastTxHash && (
              <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3 font-mono text-xs">
                <span className="text-muted-foreground">Last Arc tx · </span>
                <a
                  href={`https://testnet.arcscan.app/tx/${state.lastTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {state.lastTxHash.slice(0, 16)}...
                </a>
                <span className="ml-2 text-muted-foreground">· Arc Testnet</span>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Streaming to {current.creator.handle}</span>
                <span className="font-mono text-primary">+{fmtUSD(RATE_PER_SECOND, 5)} / s</span>
              </div>
              <div className="relative h-12 overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
                {playing && Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute top-0 h-2 w-2 animate-drip rounded-full bg-primary"
                    style={{ left: `${(i * 8.3) % 100}%`, animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="mt-6 glass rounded-3xl p-7">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase text-primary">
              <span className={`h-1.5 w-1.5 rounded-full ${playing ? "animate-pulse-dot bg-primary" : "bg-muted-foreground"}`} />
              {playing ? "Streaming · content unlocked" : "Paused · content locked"}
            </div>
            <span className="font-mono text-xs text-muted-foreground">{current.minutes} min read · {current.creator.handle}</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{current.title}</h2>
          <div className="mt-1 text-sm text-muted-foreground">{current.creator.name} · {current.creator.topic}</div>
          {playing ? (
            <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
              {current.content?.split("\n\n").map((para, i) => (
                <p key={i} className={para.startsWith("**") ? "font-semibold text-foreground text-base" : ""}>
                  {para.replace(/\*\*/g, "")}
                </p>
              ))}
            </div>
          ) : (
            <div className="mt-6 relative">
              <div className="space-y-3">
                {[80, 95, 70, 90, 60].map((w, i) => (
                  <div key={i} className="h-3 rounded-full bg-white/5" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glass-strong rounded-2xl px-6 py-4 text-center">
                  <div className="text-sm font-medium">Content locked</div>
                  <div className="text-xs text-muted-foreground mt-1">Start streaming to unlock</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ConsumptionHistory sessionSpend={sessionSpend} />
          <Recommendations onSelect={setCurrentIndex} />
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-2 font-mono text-2xl tabular-nums ${accent ? "text-gradient" : ""}`}>{value}</div>
    </div>
  );
}

function ConsumptionHistory({ sessionSpend }: { sessionSpend: number }) {
  const items = [
    { title: "The State of MEV in 2026", creator: "@delphi.research", t: 320, spent: 0.77 },
    { title: "Designing for AI-native readers", creator: "@nina.writes", t: 540, spent: 0.97 },
    { title: "Real yield, finally", creator: "@harvest.fi", t: 218, spent: 0.33 },
    { title: "Building globally distributed inference", creator: "@samir.codes", t: 412, spent: 1.15 },
    { title: "The post-typography era", creator: "@lumen.studio", t: 178, spent: 0.37 },
  ];
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Consumption history</h3>
        <span className="font-mono text-xs text-muted-foreground">Last 7 days · +{fmtUSD(sessionSpend, 4)} this session</span>
      </div>
      <div className="mt-4 divide-y divide-white/5">
        {items.map((it) => (
          <div key={it.title} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 py-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.creator} · {Math.floor(it.t / 60)}m {it.t % 60}s</div>
            </div>
            <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-white/5 md:block">
              <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(100, it.spent * 80)}%` }} />
            </div>
            <div className="font-mono tabular-nums text-sm">{fmtUSD(it.spent, 2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Recommendations({ onSelect }: { onSelect: (index: number) => void }) {
  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="text-lg font-semibold">Recommended for your agent</h3>
      <p className="mt-1 text-xs text-muted-foreground">Ranked by intent match · refreshed 32s ago</p>
      <div className="mt-4 space-y-3">
        {ARTICLES.slice(0, 4).map((a, i) => (
          <div
            key={a.id}
            onClick={() => onSelect(i)}
            className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/10 hover:border-primary/20"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand text-background font-mono text-sm font-semibold">
              {a.creator.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{a.title}</div>
              <div className="text-[11px] text-muted-foreground">{a.creator.handle} · {fmtUSD(a.rate, 4)}/s · {a.minutes}m</div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="font-mono text-xs uppercase tracking-widest text-primary">Dashboard</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{subtitle}</p>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-muted-foreground md:flex">
        <BookOpen className="h-3.5 w-3.5" /> reader.streammint.xyz
      </div>
    </div>
  );
}
