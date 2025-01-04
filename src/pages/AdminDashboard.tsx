import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAccount } from "wagmi";

export const AdminDashboard = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [voterAddress, setVoterAddress] = useState("");
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    tagline: "",
    logoIPFS: ""
  });
  const [electionDuration, setElectionDuration] = useState("");

  const handleApproveVoter = async () => {
    try {
      // Contract interaction will be implemented here
      toast({
        title: "Voter Approved",
        description: `Address ${voterAddress} has been approved to vote.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve voter."
      });
    }
  };

  const handleAddCandidate = async () => {
    try {
      // Contract interaction will be implemented here
      toast({
        title: "Candidate Added",
        description: `${candidateForm.name} has been added as a candidate.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add candidate."
      });
    }
  };

  const handleStartElection = async () => {
    try {
      // Contract interaction will be implemented here
      toast({
        title: "Election Started",
        description: `Election has been started for ${electionDuration} minutes.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start election."
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Admin Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
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
            <Button onClick={handleApproveVoter} className="w-full">
              Approve Voter
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Candidate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Name"
              value={candidateForm.name}
              onChange={(e) => setCandidateForm({...candidateForm, name: e.target.value})}
            />
            <Input
              placeholder="Party"
              value={candidateForm.party}
              onChange={(e) => setCandidateForm({...candidateForm, party: e.target.value})}
            />
            <Input
              placeholder="Tagline"
              value={candidateForm.tagline}
              onChange={(e) => setCandidateForm({...candidateForm, tagline: e.target.value})}
            />
            <Input
              placeholder="Logo IPFS Hash"
              value={candidateForm.logoIPFS}
              onChange={(e) => setCandidateForm({...candidateForm, logoIPFS: e.target.value})}
            />
            <Button onClick={handleAddCandidate} className="w-full">
              Add Candidate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Election Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={electionDuration}
              onChange={(e) => setElectionDuration(e.target.value)}
            />
            <Button onClick={handleStartElection} className="w-full">
              Start Election
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};