import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";

export const getAllVoters = async (): Promise<string[]> => {
  try {
    const voters = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getAllVoters',
    }) as string[];
    return voters;
  } catch (error) {
    console.error("Failed to fetch voters:", error);
    return [];
  }
};