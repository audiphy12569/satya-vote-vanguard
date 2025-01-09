import { useState, useEffect } from "react";
import { readContract, writeContract, waitForTransaction } from "@wagmi/core";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { useToast } from "@/hooks/use-toast";
import { mainnet } from "viem/chains";
import { writeContractWithConfirmation } from "@/utils/contractUtils";

export const useElectionData = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [electionEndTime, setElectionEndTime] = useState(0);
  const [isElectionActive, setIsElectionActive] = useState(false);

  const fetchElectionData = async () => {
    try {
      const endTime = await readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "electionEndTime",
      });

      const active = await readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: "isElectionActive",
      });

      setElectionEndTime(Number(endTime));
      setIsElectionActive(active as boolean);
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
      const tx = await writeContractWithConfirmation("startElection", [duration]);
      if (typeof tx === 'string') {
        await waitForTransaction({
          hash: tx as `0x${string}`,
        });
      }
      toast({
        title: "Election Started",
        description: "The election has been successfully started.",
      });
      await fetchElectionData();
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
      const tx = await writeContractWithConfirmation("endElection", []);
      if (typeof tx === 'string') {
        await waitForTransaction({
          hash: tx as `0x${string}`,
        });
      }
      toast({
        title: "Election Ended",
        description: "The election has been successfully ended.",
      });
      await fetchElectionData();
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
    // Poll for updates every 30 seconds
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