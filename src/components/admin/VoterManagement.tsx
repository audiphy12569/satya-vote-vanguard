import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { writeContract, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2 } from "lucide-react";
import { config } from "@/config/web3";

export const VoterManagement = () => {
  const { toast } = useToast();
  const [voterAddress, setVoterAddress] = useState("");
  const [votersList, setVotersList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVotersList = async () => {
    try {
      const data = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getAllVoters',
      });
      setVotersList(data as string[]);
    } catch (error) {
      console.error("Failed to fetch voters list:", error);
    }
  };

  const handleApproveVoter = async () => {
    try {
      setIsLoading(true);
      await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'approveVoter',
        args: [voterAddress as `0x${string}`],
      });
      toast({
        title: "Voter Approved",
        description: `Address ${voterAddress} has been approved to vote.`
      });
      await fetchVotersList();
      setVoterAddress("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve voter."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voter Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Voter Address"
          value={voterAddress}
          onChange={(e) => setVoterAddress(e.target.value)}
        />
        <Button 
          onClick={handleApproveVoter} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Approve Voter
        </Button>
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Approved Voters</h3>
          <div className="max-h-40 overflow-y-auto">
            {votersList.map((voter, index) => (
              <div key={index} className="text-sm text-gray-600 mb-1">
                {voter}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};