import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { writeContractWithConfirmation } from "@/utils/contractUtils";
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VoterList } from "./voter/VoterList";
import { VoterActions } from "./voter/VoterActions";

export const VoterManagement = () => {
  const [voters, setVoters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { address } = useAccount();

  const fetchVoters = async () => {
    try {
      setIsLoading(true);
      const data = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getAllVoters',
      }) as `0x${string}`[];
      setVoters([...data]);
    } catch (error) {
      console.error("Failed to fetch voters:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch voters",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  const handleApproveVoter = async (voterAddress: string) => {
    try {
      setIsLoading(true);
      await writeContractWithConfirmation(
        'approveVoter',
        [voterAddress as `0x${string}`],
        address
      );
      
      toast({
        title: "Success",
        description: "Voter approved successfully",
      });
      
      await fetchVoters();
    } catch (error) {
      console.error("Failed to approve voter:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve voter",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveVoter = async (voterAddress: string) => {
    try {
      setIsLoading(true);
      await writeContractWithConfirmation(
        'removeVoter',
        [voterAddress as `0x${string}`],
        address
      );
      
      toast({
        title: "Success",
        description: "Voter removed successfully",
      });
      
      await fetchVoters();
    } catch (error) {
      console.error("Failed to remove voter:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove voter",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAllVoters = async () => {
    try {
      setIsLoading(true);
      await writeContractWithConfirmation(
        'removeAllVoters',
        [],
        address
      );
      
      toast({
        title: "Success",
        description: "All voters removed successfully",
      });
      
      await fetchVoters();
    } catch (error) {
      console.error("Failed to remove all voters:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove all voters",
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
      <CardContent>
        <VoterActions onRemoveAll={handleRemoveAllVoters} isLoading={isLoading} />
        <VoterList 
          voters={voters}
          onApprove={handleApproveVoter}
          onRemove={handleRemoveVoter}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};