import { writeContract, waitForTransaction, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";

type ContractWriteFunction = 
  | "startElection"
  | "vote"
  | "approveVoter"
  | "removeAllVoters"
  | "addCandidate"
  | "removeCandidate"
  | "endElection";

export const writeContractWithConfirmation = async (
  functionName: ContractWriteFunction,
  args: unknown[]
) => {
  try {
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName,
      args,
      chain: sepolia
    });

    await waitForTransaction(config, {
      hash,
    });

    return hash;
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