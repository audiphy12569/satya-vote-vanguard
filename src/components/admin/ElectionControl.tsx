import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getActiveCandidateCount, getElectionStatus } from "@/utils/electionUtils";
import { writeContractWithConfirmation } from "@/utils/contractUtils";
import { CONTRACT_ADDRESS } from "@/config/contract";

export const ElectionControl = () => {
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);
  const [electionActive, setElectionActive] = useState(false);
  const [endTime, setEndTime] = useState<number>(0);

  const handleStartElection = async (durationInMinutes: number) => {
    try {
      setIsStarting(true);
      const activeCandidates = await getActiveCandidateCount();
      
      if (activeCandidates < 2) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Minimum 2 candidates required to start election",
        });
        return;
      }

      await writeContractWithConfirmation(
        'startElection',
        [BigInt(durationInMinutes)],
        CONTRACT_ADDRESS
      );
      
      toast({
        title: "Success",
        description: "Election started successfully",
      });
      
      // Refresh election status
      const status = await getElectionStatus();
      setElectionActive(status.isActive);
      setEndTime(Number(status.endTime));
    } catch (error) {
      console.error("Failed to start election:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start election",
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Election Control</h2>
      <Button onClick={() => handleStartElection(60)} disabled={isStarting}>
        {isStarting ? "Starting..." : "Start Election"}
      </Button>
    </div>
  );
};
