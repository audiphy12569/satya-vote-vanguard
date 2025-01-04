import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { writeContract, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2 } from "lucide-react";
import { config } from "@/config/web3";

export const ElectionControl = () => {
  const { toast } = useToast();
  const [electionDuration, setElectionDuration] = useState("");
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchElectionStatus = async () => {
    try {
      const data = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getElectionStatus',
      });
      setIsElectionActive(data[0]);
    } catch (error) {
      console.error("Failed to fetch election status:", error);
    }
  };

  const handleStartElection = async () => {
    try {
      setIsLoading(true);
      await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'startElection',
        args: [BigInt(Number(electionDuration))],
      });
      toast({
        title: "Election Started",
        description: `Election has been started for ${electionDuration} minutes.`
      });
      setIsElectionActive(true);
      setElectionDuration("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start election."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Election Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isElectionActive ? (
          <>
            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={electionDuration}
              onChange={(e) => setElectionDuration(e.target.value)}
            />
            <Button 
              onClick={handleStartElection} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Election
            </Button>
          </>
        ) : (
          <Alert>
            <AlertDescription>
              Election is in progress. Wait for it to end or contact support to end it manually.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};