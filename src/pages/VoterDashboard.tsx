import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

export const VoterDashboard = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [candidates, setCandidates] = useState([]);
  const [isVerifiedVoter, setIsVerifiedVoter] = useState(false);
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    checkVoterStatus();
    checkElectionStatus();
    fetchCandidates();
  }, [address]);

  const checkVoterStatus = async () => {
    try {
      // Contract interaction will be implemented here to check if address is in voter list
      // For now using mock data
      const isVerified = false; // This will come from smart contract
      setIsVerifiedVoter(isVerified);
    } catch (error) {
      console.error("Failed to check voter status:", error);
    }
  };

  const checkElectionStatus = async () => {
    try {
      // Contract interaction will be implemented here
      // For now using mock data
      const electionActive = false; // This will come from smart contract
      setIsElectionActive(electionActive);
    } catch (error) {
      console.error("Failed to check election status:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      // Contract interaction will be implemented here
      // For now using mock data
      const candidatesList = []; // This will come from smart contract
      setCandidates(candidatesList);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) return;
    try {
      // Contract interaction will be implemented here
      toast({
        title: "Vote Cast",
        description: "Your vote has been recorded successfully."
      });
      setHasVoted(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cast vote."
      });
    }
  };

  if (!isVerifiedVoter) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            You are not verified to vote. Please contact the admin to verify your address.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isElectionActive) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertDescription>
            Election has not started yet. Please wait for the admin to start the election.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="container mx-auto p-4">
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription>
            Thank you for voting! Your vote has been recorded.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Voter Dashboard</h1>
      
      <Alert className="mb-4 bg-green-50 border-green-200">
        <AlertDescription>
          Congratulations! You are eligible for voting.
        </AlertDescription>
      </Alert>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate: any) => (
          <Card key={candidate.id} className={`cursor-pointer transition-all ${
            selectedCandidate === candidate.id ? 'ring-2 ring-purple-500' : ''
          }`} onClick={() => setSelectedCandidate(candidate.id)}>
            <CardHeader>
              <CardTitle>{candidate.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">{candidate.party}</p>
              <p className="text-sm mt-2">{candidate.tagline}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCandidate && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleVote} className="px-8">
            Cast Vote
          </Button>
        </div>
      )}
    </div>
  );
};