import { useState, useEffect } from "react";
import { readContract } from "@wagmi/core";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/web3";
import { writeContractWithConfirmation } from "@/utils/contractUtils";
import { ElectionHistory } from "@/types/election";

export const useElectionData = (address?: string) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [electionEndTime, setElectionEndTime] = useState(0);
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [pastElections, setPastElections] = useState<ElectionHistory[]>([]);
  const [isVoting, setIsVoting] = useState(false);

  const fetchElectionData = async () => {
    try {
      const status = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "getElectionStatus",
      }) as readonly [boolean, bigint, bigint, bigint];

      setElectionEndTime(Number(status[2])); // endTime is at index 2
      setIsElectionActive(status[0]); // isActive is at index 0
    } catch (error) {
      console.error("Failed to fetch election data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch election data.",
      });
    }
  };

  const handleVote = async (candidateId: number) => {
    try {
      setIsVoting(true);
      const hash = await writeContractWithConfirmation("vote", [BigInt(candidateId)]);
      toast({
        title: "Vote Cast Successfully",
        description: "Your vote has been recorded.",
      });
      await fetchElectionData();
      return hash;
    } catch (error) {
      console.error("Failed to cast vote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cast your vote.",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const updateElectionStatus = async () => {
    await fetchElectionData();
  };

  useEffect(() => {
    fetchElectionData();
    const interval = setInterval(fetchElectionData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    isLoading,
    electionEndTime,
    isElectionActive,
    candidates,
    hasUserVoted,
    pastElections,
    isVoting,
    handleVote,
    updateElectionStatus,
    startElection: async (duration: number) => {
      try {
        setIsLoading(true);
        const hash = await writeContractWithConfirmation("startElection", [duration]);
        toast({
          title: "Election Started",
          description: "The election has been successfully started.",
        });
        await fetchElectionData();
        return hash;
      } catch (error) {
        console.error("Failed to start election:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to start the election.",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    endElection: async () => {
      try {
        setIsLoading(true);
        const hash = await writeContractWithConfirmation("endElection", []);
        toast({
          title: "Election Ended",
          description: "The election has been successfully ended.",
        });
        await fetchElectionData();
        return hash;
      } catch (error) {
        console.error("Failed to end election:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to end the election.",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
  };
};