import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { writeContract, getPublicClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2 } from "lucide-react";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { useAccount } from "wagmi";

export const ElectionControl = () => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const { hash } = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'startElection',
        args: [BigInt(Number(duration))],
        chainId: sepolia.id,
        account: address,
      });

      toast({
        title: "Transaction Submitted",
        description: "Please wait for confirmation...",
        variant: "default",
      });

      const publicClient = await getPublicClient(config);
      await publicClient.waitForTransactionReceipt({ hash });
      
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
      </CardContent>
    </Card>
  );
};