/**
 * stream-store.tsx
 *
 * Global state that connects the Reader Agent to the Creator Dashboard.
 *
 * Architecture:
 * - React Context + useReducer for predictable state updates
 * - No external dependencies (no Zustand, no Redux)
 * - Single source of truth for wallet balance, session spend, and creator earnings
 *
 * Revenue split (per prompt 3):
 *   Creator  90%
 *   Curator   5%
 *   Platform  5%
 *
 * Charge rate (per prompt 2):
 *   0.00005 USDC / second
 */

import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

export const INITIAL_BALANCE = 10; // USDC (prompt 2: start with 10 USDC)
export const RATE_PER_SECOND = 0.00005; // USDC/s (prompt 2)

export const SPLIT = {
  creator: 0.90,
  curator: 0.05,
  platform: 0.05,
} as const;

// ─── State shape ──────────────────────────────────────────────────────────────

export interface StreamState {
  /** Reader wallet balance in USDC */
  balance: number;
  /** Total seconds spent reading in this session */
  elapsed: number;
  /** Total USDC spent this session */
  sessionSpend: number;
  /** Whether the reader agent is actively streaming */
  playing: boolean;
  /** Creator earnings breakdown (running totals) */
  earnings: {
    creator: number;   // 90% of all spend
    curator: number;   // 5%
    platform: number;  // 5%
    total: number;     // = sessionSpend
  };
}

type Action =
  | { type: "TICK" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "RESET" }
  | { type: "TOPUP"; amount: number }
  | { type: "WITHDRAW"; amount: number };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: StreamState, action: Action): StreamState {
  switch (action.type) {
    case "TICK": {
      if (!state.playing) return state;
      const charge = RATE_PER_SECOND;
      const newBalance = Math.max(0, state.balance - charge);
      const actualCharge = state.balance - newBalance; // may be less if we hit 0
      const newSpend = state.sessionSpend + actualCharge;
      const newElapsed = state.elapsed + 1;
      return {
        ...state,
        balance: newBalance,
        elapsed: newElapsed,
        sessionSpend: newSpend,
        playing: newBalance > 0 ? state.playing : false, // auto-pause if empty
        earnings: {
          creator: newSpend * SPLIT.creator,
          curator: newSpend * SPLIT.curator,
          platform: newSpend * SPLIT.platform,
          total: newSpend,
        },
      };
    }
    case "TOPUP":
      return {
        ...state,
        balance: state.balance + action.amount,
        playing: true, // auto-resume when topped up
      };
    case "WITHDRAW":
      return {
        ...state,
        balance: Math.max(0, state.balance - action.amount),
      };
    case "PAUSE":
      return { ...state, playing: false };
    case "RESUME":
      return { ...state, playing: state.balance > 0 };
    case "RESET":
      return initialState();
    default:
      return state;
  }
}

function initialState(): StreamState {
  return {
    balance: INITIAL_BALANCE,
    elapsed: 0,
    sessionSpend: 0,
    playing: true, // auto-start on load (prompt 2)
    earnings: { creator: 0, curator: 0, platform: 0, total: 0 },
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface StreamCtx {
  state: StreamState;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  topUp: (amount: number) => void;
  withdraw: (amount: number) => void;
}

const Ctx = createContext<StreamCtx | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StreamProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick every second — always running, reducer guards against charging when paused
  useEffect(() => {
    intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Ctx.Provider
      value={{
        state,
        pause: () => dispatch({ type: "PAUSE" }),
        resume: () => dispatch({ type: "RESUME" }),
        reset: () => dispatch({ type: "RESET" }),
        topUp: (amount) => dispatch({ type: "TOPUP", amount }),
        withdraw: (amount) => dispatch({ type: "WITHDRAW", amount }),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStream() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStream must be used inside <StreamProvider>");
  return ctx;
}
