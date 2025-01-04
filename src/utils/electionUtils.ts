import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import type { ElectionResult, ElectionHistory } from "@/types/election";

export interface ElectionStatus {
  isActive: boolean;
  startTime: bigint;
  endTime: bigint;
  totalVotes: bigint;
}

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
    }) as [bigint, bigint, bigint, bigint, ElectionResult[]];
    
    return {
      id: data[0],
      startTime: data[1],
      endTime: data[2],
      totalVotes: data[3],
      results: data[4],
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