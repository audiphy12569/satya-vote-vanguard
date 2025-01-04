import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VoterList } from "@/components/admin/voter/VoterList";
import { VoterActions } from "@/components/admin/voter/VoterActions";
import { Loader2, Trash2 } from "lucide-react";
import { writeContractWithConfirmation } from "@/utils/contractUtils";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/web3";
import { CONTRACT_ADDRESS } from "@/config/contract";

export const VoterManagement = () => {
  const { toast } = useToast();
  const [voters, setVoters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVoters = async () => {
    // Fetch the list of approved voters from the contract
    // This is a placeholder for the actual implementation
    // You would replace this with the actual contract call to get the voters
    setVoters(["0x123...", "0x456..."]); // Example addresses
  };

  const handleApproveVoter = async (voterAddress: string) => {
    setIsLoading(true);
    try {
      await writeContractWithConfirmation("approveVoter", [voterAddress]);
      toast({
        title: "Voter Approved",
        description: `Successfully approved ${voterAddress}`,
        variant: "default",
      });
      fetchVoters(); // Refresh the list of voters
    } catch (error) {
      console.error("Failed to approve voter:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve voter.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAllVoters = async () => {
    setIsLoading(true);
    try {
      await writeContractWithConfirmation("removeAllVoters", []);
      toast({
        title: "All Voters Removed",
        description: "Successfully removed all voters.",
        variant: "default",
      });
      fetchVoters(); // Refresh the list of voters
    } catch (error) {
      console.error("Failed to remove all voters:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove all voters.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Voter Management</CardTitle>
          <CardDescription>Approve new voters and manage existing ones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <VoterActions 
              onApprove={handleApproveVoter} 
              onRemoveAll={handleRemoveAllVoters}
              isLoading={isLoading}
            />
            <VoterList 
              voters={voters} 
              isLoading={isLoading} 
              onRemove={() => {}} // Empty function since individual removal is not supported
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};