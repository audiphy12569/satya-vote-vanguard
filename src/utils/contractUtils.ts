import { writeContract, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";

type ContractFunction = 
  | "addCandidate" 
  | "approveVoter" 
  | "removeAllVoters" 
  | "removeCandidate" 
  | "startElection" 
  | "vote";

export const writeContractWithConfirmation = async (
  functionName: ContractFunction,
  args: readonly unknown[],
  address?: `0x${string}`
): Promise<{ hash: `0x${string}`; }> => {
  try {
    const result = await writeContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName,
      args: args as any[],
      chain: sepolia,
      account: address,
    });

    return { hash: result };
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    throw error;
  }
};

export const checkVoterStatus = async (address: `0x${string}`): Promise<boolean> => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'approvedVoters',
      args: [address],
    });
    return Boolean(data);
  } catch (error) {
    console.error("Error checking voter status:", error);
    throw error;
  }
};

export const getAdminAddress = async (): Promise<`0x${string}`> => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'admin',
    });
    return data as `0x${string}`;
  } catch (error) {
    console.error("Error fetching admin address:", error);
    throw error;
  }
};