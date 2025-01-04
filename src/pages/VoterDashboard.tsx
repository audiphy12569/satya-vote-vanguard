import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { checkVoterStatus } from "@/utils/contractUtils";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Vote } from "lucide-react";
import { sepolia } from "wagmi/chains";
import { ElectionTimer } from "@/components/ElectionTimer";
import { ElectionResults } from "@/components/ElectionResults";
import { getElectionStatus, hasVoted, getElectionHistory } from "@/utils/electionUtils";
import { writeContract, getPublicClient, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";

interface Candidate {
  id: number;
  name: string;
  party: string;
  tagline: string;
  logoIPFS: string;
  voteCount: bigint;
}

export const VoterDashboard = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [isVerifiedVoter, setIsVerifiedVoter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [electionActive, setElectionActive] = useState(false);
  const [endTime, setEndTime] = useState<number>(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [pastElections, setPastElections] = useState<any[]>([]);
  const [isVoting, setIsVoting] = useState(false);

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

      const status = await getElectionStatus();
      setElectionActive(status.isActive);
      setEndTime(Number(status.endTime));

      if (status.isActive && isVerified) {
        const voted = await hasVoted(address);
        setHasUserVoted(voted);
        await fetchCandidates();
      }

      await fetchPastElections();
    } catch (err) {
      console.error("Failed to check voter status:", err);
      setError("Failed to check voter eligibility. Please try again later.");
      setIsVerifiedVoter(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const count = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getCandidateCount',
      });

      const candidatesData = [];
      for (let i = 1; i <= Number(count); i++) {
        const candidate = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getCandidate',
          args: [BigInt(i)],
        });
        candidatesData.push({
          id: i,
          name: candidate[0],
          party: candidate[1],
          tagline: candidate[2],
          logoIPFS: candidate[3],
          voteCount: candidate[4],
        });
      }
      setCandidates(candidatesData);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
    }
  };

  const fetchPastElections = async () => {
    try {
      const totalElections = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getTotalElections',
      });

      const elections = [];
      for (let i = 1; i <= Number(totalElections); i++) {
        const election = await getElectionHistory(i);
        elections.push(election);
      }
      setPastElections(elections);
    } catch (error) {
      console.error("Failed to fetch past elections:", error);
    }
  };

  const handleVote = async (candidateId: number) => {
    try {
      setIsVoting(true);
      const { hash } = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'vote',
        args: [BigInt(candidateId)],
        chain: sepolia,
        account: address,
      }) as { hash: `0x${string}` };

      toast({
        title: "Vote Submitted",
        description: "Please wait for confirmation...",
        variant: "default",
      });

      const publicClient = await getPublicClient(config);
      await publicClient.waitForTransactionReceipt({ hash });
      
      setHasUserVoted(true);
      await fetchCandidates();
      
      toast({
        title: "Vote Successful",
        description: "Your vote has been recorded.",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to vote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cast vote."
      });
    } finally {
      setIsVoting(false);
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
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Voter Eligibility Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Checking eligibility...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className={`p-6 rounded-lg border ${
                isVerifiedVoter 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center justify-center gap-3">
                  {isVerifiedVoter ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <span className="text-lg font-medium text-green-700">
                        You are verified to vote
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-red-500" />
                      <span className="text-lg font-medium text-red-700">
                        Not Verified
                      </span>
                    </>
                  )}
                </div>
                
                {!isVerifiedVoter && (
                  <div className="mt-4 text-center text-red-600">
                    You are not verified to vote. Please contact the admin to get verified.
                  </div>
                )}
              </div>

              {isVerifiedVoter && electionActive && (
                <div className="space-y-4">
                  <ElectionTimer endTime={endTime} />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Election</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {hasUserVoted ? (
                        <Alert className="bg-green-50 border-green-200">
                          <AlertDescription>
                            You have already voted in this election
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          {candidates.map((candidate) => (
                            <div key={candidate.id} className="p-4 border rounded-lg flex justify-between items-center">
                              <div className="flex items-center space-x-4">
                                {candidate.logoIPFS && (
                                  <img 
                                    src={candidate.logoIPFS.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                                    alt={`${candidate.name}'s logo`}
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                    }}
                                  />
                                )}
                                <div>
                                  <p className="font-semibold">{candidate.name}</p>
                                  <p className="text-sm text-gray-600">{candidate.party}</p>
                                  <p className="text-xs text-gray-500">{candidate.tagline}</p>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleVote(candidate.id)}
                                disabled={isVoting}
                                className="ml-4"
                              >
                                {isVoting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Vote className="h-4 w-4 mr-2" />
                                    Vote
                                  </>
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex justify-center">
                <Button 
                  onClick={checkVoterEligibility}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                endTime: BigInt(0),
                totalVotes: BigInt(0),
                results: candidates.map(c => ({
                  candidateId: BigInt(c.id),
                  candidateName: c.name,
                  party: c.party,
                  voteCount: c.voteCount
                }))
              }}
              isLive={true}
            />
          ) : pastElections.length === 0 ? (
            <Alert>
              <AlertDescription>
                No past elections found
              </AlertDescription>
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
