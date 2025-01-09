import { useEffect, useState } from "react";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { ElectionTimer } from "@/components/ElectionTimer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Vote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardCandidate {
  id: number;
  name: string;
  party: string;
  tagline: string;
  logoIPFS: string;
  voteCount: bigint;
  isActive: boolean;
}

const VoterDashboard = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<DashboardCandidate[]>([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasUserVoted, setHasUserVoted] = useState(false);
  const [endTime, setEndTime] = useState<number>(0);

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const count = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getCandidateCount',
        });

        const candidatesData: DashboardCandidate[] = [];
        for (let i = 1; i <= Number(count); i++) {
          const candidate = await readContract(config, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            functionName: 'candidates',
            args: [BigInt(i)],
          }) as readonly [bigint, bigint, boolean, string, string, string, string];

          if (candidate[2]) {
            candidatesData.push({
              id: i,
              name: candidate[3],
              party: candidate[4],
              tagline: candidate[5],
              logoIPFS: candidate[6],
              voteCount: candidate[1],
              isActive: candidate[2],
            });
          }
        }
        setCandidates(candidatesData);
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      }
    };

    fetchElectionData();
  }, []);

  const onVote = async (candidateId: number) => {
    setIsVoting(true);
    try {
      // Call the voting function here
      // await voteForCandidate(candidateId);
      toast({
        title: "Vote Cast",
        description: `You have voted for candidate ${candidateId}`,
      });
      setHasUserVoted(true);
    } catch (error) {
      console.error("Failed to cast vote:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cast your vote.",
      });
    } finally {
      setIsVoting(false);
    }
  };

  return (
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
              {candidates.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No active candidates currently
                  </AlertDescription>
                </Alert>
              ) : (
                candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-4">
                      {candidate.logoIPFS && (
                        <img
                          src={candidate.logoIPFS.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                          )}
                          alt={`${candidate.name}'s logo`}
                          className="w-12 h-12 rounded-full object-cover bg-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
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
                      onClick={() => onVote(candidate.id)}
                      disabled={isVoting || hasUserVoted}
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
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterDashboard;
