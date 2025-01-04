import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ALCHEMY_API_KEY } from "./contract";

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`),
  },
});