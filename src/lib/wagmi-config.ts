import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc-node.thecanteenapp.com/v1/swrm_a68619df82c65562963c336a0216fc4cb3bcf592321d71fc9418d34dc31df47a"],
    },
  },
  blockExplorers: {
    default: { name: "Arc Explorer", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
} as const;

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  connectors: [injected()],
  transports: {
    [arcTestnet.id]: http(),
  },
});