import { useState, useEffect } from "react";
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
  const [isElectionActive, setIsElectionActive] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    const checkElectionStatus = async () => {
      const status = await getElectionStatus();
      setIsElectionActive(status.isActive);
    };
    
    checkElectionStatus();
    const interval = setInterval(checkElectionStatus, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

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

      // Start new election
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
      const status = await getElectionStatus();
      setIsElectionActive(status.isActive);
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
          disabled={isElectionActive}
        />
        <Button 
          onClick={handleStartElection} 
          disabled={isStarting || isElectionActive}
        >
          {isStarting ? "Starting..." : "Start Election"}
        </Button>
      </div>
      {isElectionActive && (
        <p className="text-sm text-yellow-600">
          Cannot start a new election while current election is active
        </p>
      )}
    </div>
  );
};