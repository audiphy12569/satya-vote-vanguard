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
          functionName: 'candidates',
          args: [BigInt(candidateId)],
        }) as readonly [bigint, bigint, boolean, string, string, string, string];

        setVoteCount(candidate[1]); // voteCount is at index 1
      } catch (error) {
        console.error("Failed to fetch vote count:", error);
      }
    };

    fetchVoteCount(); // Initial fetch
    const interval = setInterval(fetchVoteCount, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [candidateId, electionActive]);

  return voteCount;
};