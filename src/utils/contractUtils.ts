import { readContract, writeContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";

export const getAdminAddress = async (): Promise<string> => {
  try {
    const admin = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'admin',
    });
    return admin as string;
  } catch (error) {
    console.error("Failed to fetch admin address:", error);
    throw error;
  }
};

interface ElectionStatus {
  isActive: boolean;
  startTime: bigint;
  endTime: bigint;
  totalVotes: bigint;
}

interface ElectionResult {
  candidateId: bigint;
  voteCount: bigint;
  candidateName: string;
  party: string;
}

interface ElectionHistory {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  totalVotes: bigint;
  results: ElectionResult[];
}

export const writeContractWithConfirmation = async (
  functionName: "addCandidate" | "approveVoter" | "removeAllVoters" | "removeCandidate" | "startElection" | "endElection" | "vote",
  args: readonly unknown[],
  address?: string
) => {
  try {
    const result = await writeContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName,
      args,
      account: address as `0x${string}`,
    });
    return result;
  } catch (error) {
    console.error(`Failed to execute ${functionName}:`, error);
    throw error;
  }
};

export const checkVoterStatus = async (address: string): Promise<boolean> => {
  try {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'approvedVoters',
      args: [address as `0x${string}`],
    });
    return result as boolean;
  } catch (error) {
    console.error("Failed to check voter status:", error);
    return false;
  }
};

export const getElectionStatus = async (): Promise<ElectionStatus> => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getElectionStatus',
    }) as [boolean, bigint, bigint, bigint];
    
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

export const getCurrentElectionId = async (): Promise<number> => {
  try {
    const data = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'currentElectionId',
    });
    return Number(data);
  } catch (error) {
    console.error("Failed to fetch current election ID:", error);
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
    
    const [id, startTime, endTime, totalVotes, results] = data as readonly [
      bigint,
      bigint,
      bigint,
      bigint,
      readonly ElectionResult[]
    ];
    
    return {
      id,
      startTime,
      endTime,
      totalVotes,
      results: Array.from(results),
    };
  } catch (error) {
    console.error("Failed to fetch election history:", error);
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
    }) as boolean;
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
