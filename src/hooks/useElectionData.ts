import { useState, useEffect } from "react";
import { readContract } from "@wagmi/core";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/web3";
import { writeContractWithConfirmation } from "@/utils/contractUtils";

export const useElectionData = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [electionEndTime, setElectionEndTime] = useState(0);
  const [isElectionActive, setIsElectionActive] = useState(false);

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

  const handleStartElection = async (duration: number) => {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndElection = async () => {
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
    } finally {
      setIsLoading(false);
    }
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
    startElection: handleStartElection,
    endElection: handleEndElection,
  };
};