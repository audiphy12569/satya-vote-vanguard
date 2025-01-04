import { writeContract } from '@wagmi/core';
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
  args: unknown[],
  address?: `0x${string}`
): Promise<{ hash: `0x${string}` }> => {
  try {
    const result = await writeContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName,
      args,
      chain: sepolia,
      account: address,
    });

    return { hash: result as `0x${string}` };
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
      functionName: 'isVoter',
      args: [address],
    });
    return Boolean(data);
  } catch (error) {
    console.error("Error checking voter status:", error);
    throw error;
  }
};