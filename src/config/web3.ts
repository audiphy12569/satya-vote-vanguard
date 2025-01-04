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
        url: 'https://satyavote.com', // Replace with your actual URL
        icons: ['https://avatars.githubusercontent.com/u/37784886'] // Replace with your actual icon URL
      }
    }),
  ],
});