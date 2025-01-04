import { useState } from "react";
import { writeContract, getPublicClient, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { getElectionStatus, hasVoted, getElectionHistory } from "@/utils/electionUtils";
import { useToast } from "@/hooks/use-toast";
import type { Hash } from 'viem';

interface Candidate {
  id: number;
  name: string;
  party: string;
  tagline: string;
  logoIPFS: string;
  voteCount: bigint;
}

export const useElectionData = (address: `0x${string}` | undefined) => {
  const { toast } = useToast();
  const [electionActive, setElectionActive] = useState(false);
  const [endTime, setEndTime] = useState<number>(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [pastElections, setPastElections] = useState<any[]>([]);
  const [isVoting, setIsVoting] = useState(false);

  const fetchCandidates = async () => {
    try {
      const count = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getCandidateCount',
      });

      const candidatesData = [];
      for (let i = 1; i <= Number(count); i++) {
        const candidate = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getCandidate',
          args: [BigInt(i)],
        });
        candidatesData.push({
          id: i,
          name: candidate[0],
          party: candidate[1],
          tagline: candidate[2],
          logoIPFS: candidate[3],
          voteCount: candidate[4],
        });
      }
      setCandidates(candidatesData);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    }
  };

  const fetchPastElections = async () => {
    try {
      const totalElections = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getTotalElections',
      });

      const elections = [];
      for (let i = 1; i <= Number(totalElections); i++) {
        const election = await getElectionHistory(i);
        if (election.id !== 0n) {
          elections.push(election);
        }
      }
      setPastElections(elections);
    } catch (error) {
      console.error("Failed to fetch past elections:", error);
    }
  };

  const handleVote = async (candidateId: number) => {
    if (!address) return;
    
    try {
      setIsVoting(true);
      const { hash } = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'vote',
        args: [BigInt(candidateId)],
        chain: sepolia,
        account: address,
      });

      toast({
        title: "Vote Submitted",
        description: "Please wait for confirmation...",
        variant: "default",
      });

      const publicClient = await getPublicClient(config);
      await publicClient.waitForTransactionReceipt({ hash: hash as Hash });
      
      setHasUserVoted(true);
      await fetchCandidates();
      
      toast({
        title: "Vote Successful",
        description: "Your vote has been recorded.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to vote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cast vote."
      });
    } finally {
      setIsVoting(false);
    }
  };

  const updateElectionStatus = async (address: `0x${string}`) => {
    const status = await getElectionStatus();
    setElectionActive(status.isActive);
    setEndTime(Number(status.endTime));

    if (status.isActive) {
      const voted = await hasVoted(address);
      setHasUserVoted(voted);
      await fetchCandidates();
    }

    await fetchPastElections();
  };

  return {
    electionActive,
    endTime,
    candidates,
    hasUserVoted,
    pastElections,
    isVoting,
    handleVote,
    updateElectionStatus,
    fetchCandidates,
    fetchPastElections,
  };
};