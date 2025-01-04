import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ALCHEMY_API_KEY } from "./contract";
import { w3mConnectors, w3mProvider } from "@web3modal/wagmi";

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing VITE_WALLET_CONNECT_PROJECT_ID in environment variables");
}

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  },
  connectors: w3mConnectors({ 
    projectId,
    chains: [sepolia],
    version: 2 
  }),
});