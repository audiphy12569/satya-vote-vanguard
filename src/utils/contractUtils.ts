import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { sepolia } from "wagmi/chains";
import { config } from "@/config/web3";

export const getAdminAddress = async () => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'admin',
    });
    return data as string;
  } catch (error) {
    console.error("Error fetching admin address:", error);
    throw error;
  }
};

export const checkVoterStatus = async (address: string) => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'voters',
      args: [address],
    });
    return Boolean(data);
  } catch (error) {
    console.error("Error checking voter status:", error);
    throw error;
  }
};