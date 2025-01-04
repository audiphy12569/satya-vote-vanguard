import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getActiveCandidateCount, getElectionStatus } from "@/utils/electionUtils";
import { writeContractWithConfirmation } from "@/utils/contractUtils";
import { useAccount } from 'wagmi';

export const ElectionControl = () => {
  const { toast } = useToast();
  const [isStarting, setIsStarting] = useState(false);
  const [duration, setDuration] = useState<number>(60);
  const { address } = useAccount();

  const handleStartElection = async () => {
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

      if (duration < 1) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Duration must be at least 1 minute",
        });
        return;
      }

      await writeContractWithConfirmation(
        'startElection',
        [BigInt(duration)],
        address
      );
      
      toast({
        title: "Success",
        description: "Election started successfully",
      });
      
      // Refresh election status
      await getElectionStatus();
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
      <div className="flex items-center gap-4">
        <Input
          type="number"
          min="1"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          placeholder="Duration in minutes"
          className="w-48"
        />
        <Button onClick={handleStartElection} disabled={isStarting}>
          {isStarting ? "Starting..." : "Start Election"}
        </Button>
      </div>
    </div>
  );
};