import express from "express";
import cors from "cors";
import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf-8")
  .split("\n")
  .reduce((acc, line) => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) acc[key.trim()] = rest.join("=").trim();
    return acc;
  }, {});

const RPC_URL = env.RPC_URL;
const BUYER_KEY = env.BUYER_PRIVATE_KEY;
const SELLER = env.SELLER_ADDRESS;
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const RATE_PER_SECOND = parseUnits("0.00005", 6);

const buyer = privateKeyToAccount(BUYER_KEY);

const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: { default: { http: [RPC_URL] } },
};

const publicClient = createPublicClient({ chain: arcTestnet, transport: http(RPC_URL) });
const walletClient = createWalletClient({ account: buyer, chain: arcTestnet, transport: http(RPC_URL) });

const USDC_ABI = [
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
];

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/balance", async (req, res) => {
  try {
    const b = await publicClient.readContract({ address: USDC_ADDRESS, abi: USDC_ABI, functionName: "balanceOf", args: [buyer.address] });
    res.json({ balance: formatUnits(b, 6), address: buyer.address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/pay", async (req, res) => {
  try {
    const hash = await walletClient.sendTransaction({ to: SELLER, value: RATE_PER_SECOND });
    const b = await publicClient.readContract({ address: USDC_ADDRESS, abi: USDC_ABI, functionName: "balanceOf", args: [buyer.address] });
    res.json({ hash, balance: formatUnits(b, 6), amount: "0.00005" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/seller-balance", async (req, res) => {
  try {
    const b = await publicClient.readContract({ address: USDC_ADDRESS, abi: USDC_ABI, functionName: "balanceOf", args: [SELLER] });
    res.json({ balance: formatUnits(b, 6), address: SELLER });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/withdraw", async (req, res) => {
  try {
    const { to, amount } = req.body;
    if (!to || !amount) return res.status(400).json({ error: "Missing to or amount" });
    const sellerAccount = privateKeyToAccount(env.SELLER_PRIVATE_KEY);
    const sellerWallet = createWalletClient({ account: sellerAccount, chain: arcTestnet, transport: http(env.RPC_URL) });
    const withdrawAmount = parseUnits(String(amount), 6);
    const hash = await sellerWallet.sendTransaction({ to, value: withdrawAmount });
    res.json({ hash, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(3001, () => {
  console.log("StreamMint Payment Server running on http://localhost:3001");
  console.log("Buyer :", buyer.address);
  console.log("Seller:", SELLER);
});
