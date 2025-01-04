import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { checkVoterStatus } from "@/utils/contractUtils";
import { sepolia } from "wagmi/chains";
import { ElectionResults } from "@/components/ElectionResults";
import { VoterEligibilityStatus } from "@/components/voter/VoterEligibilityStatus";
import { CurrentElectionVoting } from "@/components/voter/CurrentElectionVoting";
import { useElectionData } from "@/hooks/useElectionData";

export const VoterDashboard = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [isVerifiedVoter, setIsVerifiedVoter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    electionActive,
    endTime,
    candidates,
    hasUserVoted,
    pastElections,
    isVoting,
    handleVote,
    updateElectionStatus,
  } = useElectionData(address);

  const checkVoterEligibility = async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first");
      setIsLoading(false);
      return;
    }

    if (chainId !== sepolia.id) {
      setError("Please switch to Sepolia network");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const isVerified = await checkVoterStatus(address);
      setIsVerifiedVoter(isVerified);
      
      if (!isVerified) {
        toast({
          variant: "destructive",
          title: "Not Verified",
          description: "You are not verified to vote. Please contact the admin.",
        });
      }

      await updateElectionStatus(address);
    } catch (err) {
      console.error("Failed to check voter status:", err);
      setError("Failed to check voter eligibility. Please try again later.");
      setIsVerifiedVoter(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      checkVoterEligibility();
    }
  }, [isConnected, address, chainId]);

  if (!isConnected) {
    return (
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-6">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription>
                Please connect your wallet to check your voting eligibility.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center text-purple-800 dark:text-purple-400 mb-8">
        Voter Dashboard
      </h1>

      <VoterEligibilityStatus
        isLoading={isLoading}
        error={error}
        isVerifiedVoter={isVerifiedVoter}
        onRefresh={checkVoterEligibility}
      />

      {isVerifiedVoter && electionActive && (
        <CurrentElectionVoting
          endTime={endTime}
          hasUserVoted={hasUserVoted}
          candidates={candidates}
          isVoting={isVoting}
          onVote={handleVote}
        />
      )}

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Election Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {electionActive ? (
            <ElectionResults
              election={{
                id: BigInt(0),
                startTime: BigInt(0),
                endTime: BigInt(endTime),
                totalVotes: BigInt(0),
                results: candidates.map((c) => ({
                  candidateId: BigInt(c.id),
                  candidateName: c.name,
                  party: c.party,
                  voteCount: c.voteCount,
                })),
              }}
              isLive={true}
            />
          ) : pastElections.length === 0 ? (
            <Alert>
              <AlertDescription>No past elections found</AlertDescription>
            </Alert>
          ) : (
            pastElections.map((election) => (
              <ElectionResults key={String(election.id)} election={election} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};