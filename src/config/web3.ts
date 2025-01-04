import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ALCHEMY_API_KEY } from "./contract";
import { walletConnect } from "wagmi/connectors";

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  },
  connectors: [
    walletConnect({ 
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Satya Vote',
        description: 'Secure, Transparent, and Decentralized Voting System',
      }
    }),
  ],
});