/**
 * arc-payment.ts
 *
 * Bridges the React Reader Agent to the real Arc testnet payment server.
 * Calls the local payment server (localhost:3001) every second when playing.
 * Falls back gracefully if the server is not running.
 */

const PAYMENT_SERVER = "http://localhost:3001";

export interface PaymentResult {
  hash: string;
  balance: string;
  amount: string;
  onChain: boolean;
}

export async function sendArcPayment(): Promise<PaymentResult | null> {
  try {
    const res = await fetch(`${PAYMENT_SERVER}/api/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000), // 3s timeout
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { ...data, onChain: true };
  } catch {
    // Server not running — fall back to simulation silently
    return null;
  }
}

export async function getArcBalance(): Promise<string | null> {
  try {
    const res = await fetch(`${PAYMENT_SERVER}/api/balance`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.balance;
  } catch {
    return null;
  }
}
