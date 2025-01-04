import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Vote } from "lucide-react";
import { ElectionTimer } from "@/components/ElectionTimer";

interface Candidate {
  id: number;
  name: string;
  party: string;
  tagline: string;
  logoIPFS: string;
  voteCount: bigint;
}

interface CurrentElectionVotingProps {
  endTime: number;
  hasUserVoted: boolean;
  candidates: Candidate[];
  isVoting: boolean;
  onVote: (candidateId: number) => Promise<void>;
}

export const CurrentElectionVoting = ({
  endTime,
  hasUserVoted,
  candidates,
  isVoting,
  onVote,
}: CurrentElectionVotingProps) => {
  const isElectionEnded = Date.now() / 1000 > endTime;

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
          ) : isElectionEnded ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription>
                This election has ended
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
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
                        className="w-12 h-12 rounded-full object-cover"
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
                    disabled={isVoting || hasUserVoted || isElectionEnded}
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
  );
};