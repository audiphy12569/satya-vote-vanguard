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

export const getElectionStatus = async (): Promise<ElectionStatus> => {
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
};

export const getElectionHistory = async (electionId: number): Promise<ElectionHistory> => {
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
    results: [...data[4]] as ElectionResult[],
  };
};

export const hasVoted = async (address: string): Promise<boolean> => {
  return await readContract(config, {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'hasVoted',
    args: [address as `0x${string}`],
  });
};

export const getActiveCandidateCount = async (): Promise<number> => {
  const count = await readContract(config, {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'getActiveCandidateCount',
  });
  return Number(count);
};

export const writeContractWithConfirmation = async (
  functionName: "addCandidate" | "approveVoter" | "removeAllVoters" | "removeCandidate" | "removeVoter" | "startElection" | "vote",
  args: Parameters<typeof CONTRACT_ABI[number]>[number],
  account: `0x${string}` | undefined
) => {
  const { hash } = await writeContract(config, {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName,
    args,
    chain: sepolia,
    account,
  });

  const publicClient = await getPublicClient(config);
  await publicClient.waitForTransactionReceipt({ hash });
  
  return hash;
};