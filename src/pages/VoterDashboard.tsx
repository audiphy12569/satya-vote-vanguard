import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { checkVoterStatus } from "@/utils/contractUtils";
import { CheckCircle2, XCircle } from "lucide-react";

export const VoterDashboard = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [candidates, setCandidates] = useState([]);
  const [isVerifiedVoter, setIsVerifiedVoter] = useState(false);
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      checkVoterEligibility();
      checkElectionStatus();
      fetchCandidates();
    }
  }, [address]);

  const checkVoterEligibility = async () => {
    try {
      setIsLoading(true);
      const isVerified = await checkVoterStatus(address as string);
      setIsVerifiedVoter(isVerified);
    } catch (error) {
      console.error("Failed to check voter status:", error);
      setIsVerifiedVoter(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkElectionStatus = async () => {
    try {
      // Contract interaction will be implemented here
      const electionActive = false; // This will come from smart contract
      setIsElectionActive(electionActive);
    } catch (error) {
      console.error("Failed to check election status:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      // Contract interaction will be implemented here
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

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Voter Dashboard</h1>
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Eligibility Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
            ) : isVerifiedVoter ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <span className="text-green-600 font-medium">You are eligible to vote</span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="text-red-600 font-medium">You are not eligible to vote</span>
              </>
            )}
          </div>
          
          {!isVerifiedVoter && !isLoading && (
            <p className="mt-2 text-sm text-gray-600">
              Please contact the admin to get verified for voting.
            </p>
          )}
        </CardContent>
      </Card>

      {isVerifiedVoter && (
        <>
          {!isElectionActive && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertDescription>
                Election has not started yet. Please wait for the admin to start the election.
              </AlertDescription>
            </Alert>
          )}

          {hasVoted && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription>
                Thank you for voting! Your vote has been recorded.
              </AlertDescription>
            </Alert>
          )}

          {isElectionActive && !hasVoted && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidates.map((candidate: any) => (
                <Card 
                  key={candidate.id} 
                  className={`cursor-pointer transition-all ${
                    selectedCandidate === candidate.id ? 'ring-2 ring-purple-500' : ''
                  }`} 
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
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
          )}

          {isElectionActive && !hasVoted && selectedCandidate && (
            <div className="flex justify-center mt-6">
              <Button onClick={handleVote} className="px-8">
                Cast Vote
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};