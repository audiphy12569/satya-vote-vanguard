import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { writeContract, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2 } from "lucide-react";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { useAccount } from "wagmi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const VoterManagement = () => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [voterAddress, setVoterAddress] = useState("");
  const [votersList, setVotersList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVotersList = async () => {
    try {
      const data = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getAllVoters',
        chainId: sepolia.id,
        account: address,
      });
      setVotersList(data as string[]);
    } catch (error) {
      console.error("Failed to fetch voters list:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch voters list."
      });
    }
  };

  useEffect(() => {
    fetchVotersList();
  }, []);

  const handleApproveVoter = async () => {
    try {
      setIsLoading(true);
      const tx = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'approveVoter',
        args: [voterAddress as `0x${string}`],
        chainId: sepolia.id,
        account: address,
      });

      await tx.wait();
      
      toast({
        title: "Transaction Successful",
        description: `Voter ${voterAddress} has been approved successfully.`,
        variant: "default",
      });
      
      await fetchVotersList();
      setVoterAddress("");
    } catch (error) {
      console.error("Failed to approve voter:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve voter."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAllVoters = async () => {
    try {
      setIsDeleting(true);
      const tx = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'removeAllVoters',
        chainId: sepolia.id,
        account: address,
      });

      await tx.wait();
      
      toast({
        title: "Transaction Successful",
        description: "All voters have been removed successfully.",
        variant: "default",
      });
      
      await fetchVotersList();
    } catch (error) {
      console.error("Failed to remove all voters:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove all voters."
      });
    } finally {
      setIsDeleting(false);
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

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full mt-4"
              disabled={isDeleting || votersList.length === 0}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove All Voters
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently remove all approved voters from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveAllVoters}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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