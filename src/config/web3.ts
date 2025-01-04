import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ALCHEMY_API_KEY } from "./contract";
import { walletConnect } from "wagmi/connectors";

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing VITE_WALLET_CONNECT_PROJECT_ID in environment variables");
}

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
        icons: ['https://avatars.githubusercontent.com/u/37784886'], // Replace with your actual icon URL
      },
      qrModalOptions: {
        themeMode: "dark",
        desktopWallets: [
          { id: "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", name: "MetaMask", links: { native: "metamask:", universal: "https://metamask.io" } },
          { id: "brave", name: "Brave Wallet", links: { native: "brave:", universal: "https://brave.com/wallet" } },
          { id: "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369", name: "Rainbow", links: { native: "rainbow:", universal: "https://rainbow.me" } },
          { id: "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", name: "Trust", links: { native: "trust:", universal: "https://trustwallet.com" } }
        ],
        mobileWallets: [
          { id: "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", name: "MetaMask", links: { native: "metamask:", universal: "https://metamask.io" } },
          { id: "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369", name: "Rainbow", links: { native: "rainbow:", universal: "https://rainbow.me" } },
          { id: "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0", name: "Trust", links: { native: "trust:", universal: "https://trustwallet.com" } }
        ],
        explorerRecommendedWalletIds: [
          "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96", // MetaMask
          "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369", // Rainbow
          "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0"  // Trust
        ]
      }
    }),
  ],
});