import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import type { ElectionHistory } from "@/types/election";

export const fetchElectionHistory = async (): Promise<ElectionHistory[]> => {
  try {
    const totalElections = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getTotalElections',
    });

    const elections: ElectionHistory[] = [];
    for (let i = 1; i <= Number(totalElections); i++) {
      try {
        const data = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getElectionHistory',
          args: [BigInt(i)],
        }) as [bigint, bigint, bigint, bigint, any[]];

        const election: ElectionHistory = {
          id: data[0],
          startTime: data[1],
          endTime: data[2],
          totalVotes: data[3],
          results: data[4].map(result => ({
            candidateId: result.candidateId,
            voteCount: result.voteCount,
            candidateName: result.candidateName,
            party: result.party
          }))
        };
        
        if (election.id !== 0n) {
          elections.push(election);
        }
      } catch (error) {
        console.error(`Failed to fetch election #${i}:`, error);
      }
    }
    
    return elections.sort((a, b) => Number(b.id - a.id));
  } catch (error) {
    console.error("Failed to fetch election history:", error);
    return [];
  }
};