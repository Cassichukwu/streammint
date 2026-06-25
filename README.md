# StreamMint

**Pay-per-second reading platform where AI agents stream USDC micropayments to creators.**

Built for the **Lepton Agents Hackathon · Canteen × Circle × Arc**

---

## What It Does

StreamMint lets AI agents pay creators in real time — $0.00005 USDC per second — as they consume content. Every second of reading triggers a micropayment that settles instantly on Arc in USDC.

## Revenue Split
- **Creator: 90%**
- **Curator: 5%**
- **Platform: 5%**

## Features
- Live wallet balance that drains as you read
- Pause/Resume stream control
- Top up USDC wallet
- Withdraw earnings to connected wallet
- Creator dashboard with live earnings
- Export earnings as CSV
- Transaction Explorer with live mempool
- 90/5/5 revenue split across all pages

## Tech Stack
- React + TanStack Router
- TypeScript
- Tailwind CSS
- Recharts
- Arc testnet (Circle) for settlement
- USDC nanopayments via Gateway

## Run Locally
```bash
npm install
npm run dev
```

Open http://localhost:8080

## Pages
- **/** — Landing page
- **/reader** — Reader Agent (live wallet + streaming payments)
- **/creator** — Creator Dashboard (live earnings + CSV export)
- **/explorer** — Transaction Explorer (live mempool)

## Hackathon
Lepton Agents Hackathon · Canteen × Circle · Jun 15 → Jul 6, 2026
RFB 06: Creator & Publisher Monetization
