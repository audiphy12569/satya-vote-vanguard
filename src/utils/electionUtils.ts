import { readContract, writeContract, getPublicClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";

export interface ElectionStatus {
  isActive: boolean;
  startTime: bigint;
  endTime: bigint;
  totalVotes: bigint;
}

export interface ElectionResult {
  candidateId: bigint;
  candidateName: string;
  party: string;
  voteCount: bigint;
}

export interface ElectionHistory {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  totalVotes: bigint;
  results: ElectionResult[];
}

export const writeContractWithConfirmation = async (
  functionName: string,
  args: readonly unknown[],
  account: `0x${string}` | undefined
) => {
  const { hash } = await writeContract(config, {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName,
    args,
    chain: sepolia,
    account,
  }) as { hash: `0x${string}` };

  const publicClient = await getPublicClient(config);
  await publicClient.waitForTransactionReceipt({ hash });
  
  return hash;
};

export const getElectionStatus = async (): Promise<ElectionStatus> => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getElectionStatus',
    });
    
    return {
      isActive: data[0],
      startTime: data[1],
      endTime: data[2],
      totalVotes: data[3],
    };
  } catch (error) {
    console.error("Failed to fetch election status:", error);
    throw error;
  }
};

export const getElectionHistory = async (electionId: number): Promise<ElectionHistory> => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getElectionHistory',
      args: [BigInt(electionId)],
    });
    
    return {
      id: data[0],
      startTime: data[1],
      endTime: data[2],
      totalVotes: data[3],
      results: data[4].map((result: any) => ({
        candidateId: result.candidateId,
        candidateName: result.candidateName,
        party: result.party,
        voteCount: result.voteCount,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch election history:", error);
    throw error;
  }
};

export const getTotalElections = async (): Promise<number> => {
  try {
    const total = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getTotalElections',
    });
    return Number(total);
  } catch (error) {
    console.error("Failed to fetch total elections:", error);
    throw error;
  }
};

export const hasVoted = async (address: string): Promise<boolean> => {
  try {
    return await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'hasVoted',
      args: [address as `0x${string}`],
    });
  } catch (error) {
    console.error("Failed to check voting status:", error);
    throw error;
  }
};

export const getActiveCandidateCount = async (): Promise<number> => {
  try {
    const count = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getActiveCandidateCount',
    });
    return Number(count);
  } catch (error) {
    console.error("Failed to fetch active candidate count:", error);
    throw error;
  }
};

type ContractFunction = 
  | "addCandidate" 
  | "approveVoter" 
  | "removeAllVoters" 
  | "removeCandidate" 
  | "removeVoter" 
  | "startElection" 
  | "vote";
