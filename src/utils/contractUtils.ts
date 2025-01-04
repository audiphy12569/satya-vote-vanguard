import { readContract, type PublicClient, createPublicClient, http } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI, ALCHEMY_API_KEY } from "@/config/contract";
import { sepolia } from "wagmi/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`)
});

export const getAdminAddress = async () => {
  try {
    const data = await readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'admin',
      chainId: sepolia.id,
      client: publicClient,
    });
    return data as string;
  } catch (error) {
    console.error("Error fetching admin address:", error);
    throw error;
  }
};

export const checkVoterStatus = async (address: string) => {
  try {
    const data = await readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'voters',
      args: [address],
      chainId: sepolia.id,
      client: publicClient,
    });
    return Boolean(data);
  } catch (error) {
    console.error("Error checking voter status:", error);
    throw error;
  }
};