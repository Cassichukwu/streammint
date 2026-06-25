import { createPublicClient, http, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf-8")
  .split("\n")
  .reduce((acc, line) => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) acc[key.trim()] = rest.join("=").trim();
    return acc;
  }, {});

const buyer = privateKeyToAccount(env.BUYER_PRIVATE_KEY);

// Arc native USDC system contract address
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

const client = createPublicClient({
  transport: http(env.RPC_URL),
});

const USDC_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
];

async function main() {
  console.log("Buyer address:", buyer.address);
  const block = await client.getBlockNumber();
  console.log("Arc testnet block:", block.toString());

  const balance = await client.readContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [buyer.address],
  });

  console.log("USDC Balance:", formatUnits(balance, 6), "USDC");
  console.log("Connected to Arc testnet successfully!");
}

main().catch(console.error);
