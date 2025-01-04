import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ALCHEMY_API_KEY } from "./contract";
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing VITE_WALLET_CONNECT_PROJECT_ID in environment variables");
}

const metadata = {
  name: 'Satya Vote',
  description: 'A decentralized voting system',
  url: 'https://satyavote.com', // Add your website URL
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [sepolia];

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains,
  enableAnalytics: true,
});