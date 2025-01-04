import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
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
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [votersList, setVotersList] = useState<string[]>([]);
  const [candidatesList, setCandidatesList] = useState([]);

  useEffect(() => {
    fetchElectionStatus();
    fetchVotersList();
    fetchCandidates();
  }, []);

  const fetchElectionStatus = async () => {
    try {
      // Contract interaction will be implemented here
      const status = false; // This will come from smart contract
      setIsElectionActive(status);
    } catch (error) {
      console.error("Failed to fetch election status:", error);
    }
  };

  const fetchVotersList = async () => {
    try {
      // Contract interaction will be implemented here
      const voters = []; // This will come from smart contract
      setVotersList(voters);
    } catch (error) {
      console.error("Failed to fetch voters list:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      // Contract interaction will be implemented here
      const candidates = []; // This will come from smart contract
      setCandidatesList(candidates);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    }
  };

  const handleApproveVoter = async () => {
    try {
      // Contract interaction will be implemented here
      toast({
        title: "Voter Approved",
        description: `Address ${voterAddress} has been approved to vote.`
      });
      fetchVotersList();
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
      fetchCandidates();
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
      setIsElectionActive(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start election."
      });
    }
  };

  const handleEndElection = async () => {
    try {
      // Contract interaction will be implemented here
      toast({
        title: "Election Ended",
        description: "The election has been ended successfully."
      });
      setIsElectionActive(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to end election."
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Admin Dashboard</h1>
      
      <Alert className={isElectionActive ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
        <AlertDescription>
          {isElectionActive ? "Election is currently active" : "Election is not active"}
        </AlertDescription>
      </Alert>
      
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
            {!isElectionActive ? (
              <>
                <Input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={electionDuration}
                  onChange={(e) => setElectionDuration(e.target.value)}
                />
                <Button onClick={handleStartElection} className="w-full">
                  Start Election
                </Button>
              </>
            ) : (
              <Button onClick={handleEndElection} className="w-full bg-red-600 hover:bg-red-700">
                End Election
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidates List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {candidatesList.map((candidate: any, index) => (
                <div key={index} className="p-2 border rounded">
                  <p className="font-semibold">{candidate.name}</p>
                  <p className="text-sm text-gray-600">{candidate.party}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};