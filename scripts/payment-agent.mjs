import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = "https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_a68619df82c65562963c336a0216fc4cb3bcf592321d71fc9418d34dc31df47a";
const BUYER_KEY = "0xdcbbe76278afefd25265ef649249e6298d62056eef6b3c78abda2c5cd9793985";
const SELLER = "0xC37DcB82DE94cfFb98be438425B6505f80826A00";
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
  { name: "transfer", type: "function", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
];

async function getBalance(address) {
  const b = await publicClient.readContract({ address: USDC_ADDRESS, abi: USDC_ABI, functionName: "balanceOf", args: [address] });
  return formatUnits(b, 6);
}

async function sendPayment() {
  return await walletClient.sendTransaction({ to: SELLER, value: RATE_PER_SECOND });
}

async function main() {
  console.log("StreamMint Payment Agent");
  console.log("Buyer :", buyer.address);
  console.log("Seller:", SELLER);
  console.log("Rate  : $0.00005 USDC/second");
  console.log("");

  const startBalance = await getBalance(buyer.address);
  console.log("Starting balance:", startBalance, "USDC");
  console.log("Streaming 5 seconds of payments...");
  console.log("");

  for (let i = 1; i <= 5; i++) {
    try {
      const hash = await sendPayment();
      const balance = await getBalance(buyer.address);
      console.log(`Second ${i}: Sent $0.00005 | Tx: ${hash.slice(0, 12)}... | Balance: $${balance} USDC`);
    } catch (err) {
      console.log(`Second ${i}: Error - ${err.message.slice(0, 100)}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const endBalance = await getBalance(buyer.address);
  console.log("");
  console.log("Final balance:", endBalance, "USDC");
  console.log("Done!");
}

main().catch(console.error);
