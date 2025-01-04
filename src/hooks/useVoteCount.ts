import { useState, useEffect } from 'react';
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";

export const useVoteCount = (candidateId: number, electionActive: boolean) => {
  const [voteCount, setVoteCount] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const fetchVoteCount = async () => {
      if (!electionActive) return;
      
      try {
        const candidate = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getCandidate',
          args: [BigInt(candidateId)],
        });
        setVoteCount(candidate[4]);
      } catch (error) {
        console.error("Failed to fetch vote count:", error);
      }
    };

    const interval = setInterval(fetchVoteCount, 5000); // Poll every 5 seconds
    fetchVoteCount(); // Initial fetch

    return () => clearInterval(interval);
  }, [candidateId, electionActive]);

  return voteCount;
};