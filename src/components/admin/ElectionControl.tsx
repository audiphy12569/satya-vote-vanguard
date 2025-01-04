import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { writeContract, getPublicClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2 } from "lucide-react";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { useAccount } from "wagmi";
import { getActiveCandidateCount, getElectionStatus } from "@/utils/electionUtils";
import { ElectionTimer } from "@/components/ElectionTimer";

export const ElectionControl = () => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [electionActive, setElectionActive] = useState(false);
  const [endTime, setEndTime] = useState<number>(0);

  useEffect(() => {
    const checkElectionStatus = async () => {
      const status = await getElectionStatus();
      setElectionActive(status.isActive);
      setEndTime(Number(status.endTime));
    };
    checkElectionStatus();
  }, []);

  const handleStartElection = async () => {
    if (!duration) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a duration."
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const candidateCount = await getActiveCandidateCount();
      if (candidateCount < 2) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Minimum 2 active candidates required to start election."
        });
        return;
      }

      const { hash } = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'startElection',
        args: [BigInt(Number(duration))],
        chain: sepolia,
        account: address,
      });

      toast({
        title: "Transaction Submitted",
        description: "Please wait for confirmation...",
        variant: "default",
      });

      const publicClient = await getPublicClient(config);
      await publicClient.waitForTransactionReceipt({ hash });
      
      const status = await getElectionStatus();
      setElectionActive(status.isActive);
      setEndTime(Number(status.endTime));
      
      toast({
        title: "Transaction Successful",
        description: "Election has been started successfully.",
        variant: "default",
      });
      
      setDuration("");
    } catch (error) {
      console.error("Failed to start election:", error);
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
        {electionActive ? (
          <>
            <Alert>
              <AlertDescription>
                Election is currently active
              </AlertDescription>
            </Alert>
            <ElectionTimer endTime={endTime} />
          </>
        ) : (
          <>
            <Input
              type="number"
              placeholder="Duration in minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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
        )}
      </CardContent>
    </Card>
  );
};