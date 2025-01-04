import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getActiveCandidateCount, getElectionStatus, getElectionHistory, getCurrentElectionId } from "@/utils/electionUtils";
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

      // Check current election status first
      const currentStatus = await getElectionStatus();
      
      // If there's an active election
      if (currentStatus.isActive) {
        const now = Date.now();
        const endTime = Number(currentStatus.endTime) * 1000;
        
        // If the election has ended but is still marked as active
        if (now >= endTime) {
          try {
            // End the current election by calling startElection with 0 duration
            // This will trigger _endElection in the smart contract
            await writeContractWithConfirmation(
              'startElection',
              [0n], // 0 duration to trigger election end
              address
            );
            
            // Get the results of the ended election
            const currentElectionId = await getCurrentElectionId();
            if (currentElectionId > 0) {
              const results = await getElectionHistory(currentElectionId);
              console.log("Previous election ended, results:", results);
            }
            
            // Now start the new election
            await writeContractWithConfirmation(
              'startElection',
              [BigInt(duration)],
              address
            );
            
            toast({
              title: "Success",
              description: "Previous election ended and new election started successfully",
            });
          } catch (error) {
            console.error("Failed to end previous election:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to end previous election",
            });
          }
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot start new election while current election is active",
          });
          return;
        }
      } else {
        // No active election, start a new one
        await writeContractWithConfirmation(
          'startElection',
          [BigInt(duration)],
          address
        );
        
        toast({
          title: "Success",
          description: "Election started successfully",
        });
      }
      
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