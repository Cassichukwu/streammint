import { Link, useRouterState } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/reader", label: "Reader" },
  { to: "/creator", label: "Creator" },
  { to: "/explorer", label: "Explorer" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div aria-hidden className="bg-grid pointer-events-none fixed inset-0 -z-10 opacity-40" />

      <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl" style={{ background: "oklch(0.16 0.02 270 / 0.65)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand glow-mint">
              <Zap className="h-4.5 w-4.5 text-background" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-semibold tracking-tight">StreamMint</span>
              <span className="font-mono text-[10px] text-muted-foreground">USDC · Mainnet</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
            {navItems.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-muted-foreground md:flex">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-primary" />
              <span>Live · Base L2</span>
            </div>
            <Link
              to="/reader"
              className="rounded-full bg-gradient-brand px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
            >
              Launch app
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/5 mt-24">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>StreamMint Protocol · © 2026</span>
          </div>
          <div className="font-mono text-xs">v0.4.2-alpha · 0x7f3a…91c2</div>
        </div>
      </footer>
    </div>
  );
}
