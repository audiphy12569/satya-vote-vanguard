import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VoterList } from "@/components/admin/voter/VoterList";
import { VoterActions } from "@/components/admin/voter/VoterActions";
import { writeContractWithConfirmation } from "@/utils/contractUtils";
import { getAllVoters } from "@/utils/voterUtils";
import { useToast } from "@/hooks/use-toast";

export const VoterManagement = () => {
  const { toast } = useToast();
  const [voters, setVoters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVoters = async () => {
    try {
      setIsLoading(true);
      const voterList = await getAllVoters();
      setVoters(voterList);
    } catch (error) {
      console.error("Failed to fetch voters:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch voters.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVoter = async (voterAddress: string) => {
    setIsLoading(true);
    try {
      const result = await writeContractWithConfirmation("approveVoter", [voterAddress]);
      toast({
        title: "Voter Approved",
        description: `Successfully approved ${voterAddress}`,
        variant: "default",
      });
      await fetchVoters();
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
      await fetchVoters();
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
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchVoters, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
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
            onRemove={async () => {}} // Empty async function since individual removal is not supported
          />
        </div>
      </CardContent>
    </Card>
  );
};