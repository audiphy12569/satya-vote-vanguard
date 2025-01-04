import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";

export const VoterManagement = () => {
  const [voters, setVoters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchVoters = async () => {
    try {
      setIsLoading(true);
      const data = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getAllVoters',
      });
      setVoters(data);
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

  return (
    <div>
      <h2 className="text-lg font-bold">Voter Management</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {voters.map((voter) => (
            <li key={voter} className="flex justify-between items-center">
              <span>{voter}</span>
              <div>
                <Button onClick={() => handleApproveVoter(voter)}>Approve</Button>
                <Button onClick={() => handleRemoveVoter(voter)} variant="destructive">Remove</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
