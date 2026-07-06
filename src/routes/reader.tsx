import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pause, Play, Wallet, Clock, BookOpen, Sparkles, ArrowLeft, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ARTICLES, fmtUSD } from "@/lib/mock";
import { useStream, RATE_PER_SECOND } from "@/lib/stream-store";

export const Route = createFileRoute("/reader")({
  head: () => ({
    meta: [
      { title: "Reader · StreamMint" },
      { name: "description", content: "Pay-per-second reading on Arc testnet." },
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
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  async function handleConnect(address: string) {
    if (!address) { setWalletBalance(null); return; }
    try {
      const res = await fetch(`https://streammint-payment.emmanuelphilip2021.workers.dev/api/balance?address=${address}`);
      const data = await res.json();
      setWalletBalance(parseFloat(data.balance));
    } catch {
      setWalletBalance(null);
    }
  }

  function handleSelectArticle(index: number) {
    if (playing) pause();
    setSelectedArticle(index);
  }

  function handleBack() {
    if (playing) pause();
    setSelectedArticle(null);
  }

  const displayBalance = walletBalance !== null ? walletBalance : balance;

  // Article Reading View
  if (selectedArticle !== null) {
    const article = ARTICLES[selectedArticle];
    const hasNext = selectedArticle < ARTICLES.length - 1;
    const hasPrev = selectedArticle > 0;

    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> Back to articles
          </button>

          {/* Wallet bar */}
          <div className="glass-strong rounded-2xl p-4 flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                Balance: <span className="text-foreground font-semibold">${displayBalance.toFixed(4)} USDC</span>
              </div>
              {playing && (
                <div className="flex items-center gap-1.5 font-mono text-xs text-primary">
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />
                  Streaming · <span>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</span>
                  · <span>-{fmtUSD(RATE_PER_SECOND, 5)}/s</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <WalletConnect onConnect={handleConnect} />
              <button
                onClick={() => (playing ? pause() : resume())}
                className="flex items-center gap-1.5 rounded-full bg-gradient-brand px-4 py-1.5 text-xs font-semibold text-background"
              >
                {playing
                  ? <><Pause className="h-3 w-3" /> Pause</>
                  : elapsed === 0
                  ? <><Play className="h-3 w-3" /> Start streaming</>
                  : <><Play className="h-3 w-3" /> Resume</>}
              </button>
            </div>
          </div>

          {/* Article header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-background font-mono font-semibold">
                {article.creator.avatar}
              </div>
              <div>
                <div className="font-medium">{article.creator.name}</div>
                <div className="text-sm text-muted-foreground">{article.creator.handle} · {article.minutes} min read · {fmtUSD(article.rate, 4)}/s</div>
              </div>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{article.title}</h1>
          </div>

          {/* Article content — locked until streaming */}
          {playing ? (
            <div className="space-y-5 text-base leading-8 text-muted-foreground">
              {article.content?.split("\n\n").map((para, i) => (
                <p key={i} className={para.startsWith("**") ? "font-semibold text-foreground text-lg" : ""}>
                  {para.replace(/\*\*/g, "")}
                </p>
              ))}

              {/* Real Arc tx hash */}
              {state.lastTxHash && (
                <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-3 font-mono text-xs">
                  <span className="text-muted-foreground">Last Arc tx · </span>
                  <a
                    href={`https://testnet.arcscan.app/tx/${state.lastTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {state.lastTxHash.slice(0, 20)}...
                  </a>
                  <span className="ml-2 text-muted-foreground">· Arc Testnet</span>
                </div>
              )}

              {/* Navigation buttons at bottom of content */}
              <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to articles
                </button>
                <div className="flex gap-3">
                  {hasPrev && (
                    <button
                      onClick={() => handleSelectArticle(selectedArticle - 1)}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
                    >
                      <ArrowLeft className="h-4 w-4" /> Previous
                    </button>
                  )}
                  {hasNext && (
                    <button
                      onClick={() => handleSelectArticle(selectedArticle + 1)}
                      className="flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-background"
                    >
                      Next article <ArrowUpRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="space-y-4">
                {[95, 80, 90, 70, 85, 75, 60].map((w, i) => (
                  <div key={i} className="h-4 rounded-full bg-white/5" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glass-strong rounded-2xl px-8 py-6 text-center border border-primary/20">
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="font-semibold text-lg">Content locked</div>
                  <div className="text-sm text-muted-foreground mt-1 mb-4">Click Start streaming to unlock and begin paying</div>
                  <button
                    onClick={resume}
                    className="flex items-center gap-2 mx-auto rounded-full bg-gradient-brand px-6 py-2 text-sm font-semibold text-background"
                  >
                    <Play className="h-4 w-4" /> Start streaming
                  </button>
                  <div className="mt-3 font-mono text-xs text-muted-foreground">{fmtUSD(RATE_PER_SECOND, 5)} USDC per second</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    );
  }

  // Article List View (default)
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary">Dashboard</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">Reader</h1>
            <p className="mt-1 text-muted-foreground">Pay per second. Read what matters.</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-muted-foreground md:flex">
            <BookOpen className="h-3.5 w-3.5" /> reader.streammint.xyz
          </div>
        </div>

        {/* Wallet card */}
        <div className="glass-strong relative overflow-hidden rounded-3xl p-7 mb-8">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" /> Wallet · Arc Testnet
            </div>
            <WalletConnect onConnect={handleConnect} />
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-8">
            <div>
              <div className="font-mono text-5xl font-semibold tabular-nums tracking-tight">
                ${displayBalance.toFixed(4)}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">USDC available for reading</div>
            </div>
            <div className="grid grid-cols-3 gap-3 flex-1 min-w-0">
              {[
                { l: "Session spend", v: fmtUSD(sessionSpend, 4) },
                { l: "Rate/s", v: fmtUSD(RATE_PER_SECOND, 5) },
                { l: "Time read", v: `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}` },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase text-muted-foreground">{s.l}</div>
                  <div className="mt-1 font-mono text-lg">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => window.open("https://faucet.circle.com/", "_blank")}
              className="rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-background"
            >
              Top up USDC ↗
            </button>
            <button
              onClick={() => {
                const confirmed = window.confirm(`Withdraw USDC?\n\nThis will initiate an on-chain transfer on Arc Testnet.`);
                if (confirmed) alert(`Withdrawal initiated!\n\nYour USDC will settle on Arc Testnet within ~2 seconds.`);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Article feed */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Articles for your agent</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ARTICLES.map((article, i) => (
              <div
                key={article.id}
                onClick={() => handleSelectArticle(i)}
                className="glass group cursor-pointer rounded-2xl p-5 border border-white/5 hover:border-primary/20 hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-brand text-background font-mono text-sm font-semibold">
                    {article.creator.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{article.creator.name}</div>
                    <div className="text-xs text-muted-foreground">{article.creator.handle}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-base leading-snug mb-3">{article.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{article.minutes} min</span>
                    <span className="font-mono text-primary">{fmtUSD(article.rate, 4)}/s</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
