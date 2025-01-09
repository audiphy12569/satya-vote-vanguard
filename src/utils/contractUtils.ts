import { writeContract, waitForTransaction, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { sepolia } from "wagmi/chains";
import { config } from "@/config/web3";

type ContractFunction = 
  | "startElection"
  | "endElection"
  | "vote"
  | "approveVoter"
  | "removeAllVoters"
  | "addCandidate"
  | "removeCandidate";

export const writeContractWithConfirmation = async (
  functionName: ContractFunction,
  args: readonly unknown[]
) => {
  try {
    const result = await writeContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName,
      args,
      chain: sepolia
    });

    await waitForTransaction(config, {
      hash: result,
    });

    return result;
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    throw error;
  }
};

export const getAdminAddress = async (): Promise<string> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'admin'
    });
    return result as string;
  } catch (error) {
    console.error('Error getting admin address:', error);
    throw error;
  }
};

export const checkVoterStatus = async (address: string): Promise<boolean> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'approvedVoters',
      args: [address as `0x${string}`]
    });
    return result as boolean;
  } catch (error) {
    console.error('Error checking voter status:', error);
    throw error;
  }
};