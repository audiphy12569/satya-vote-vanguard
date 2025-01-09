import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVoteCount } from "@/hooks/useVoteCount";
import { Medal } from "lucide-react";

interface LiveVoteCountProps {
  candidates: {
    id: number;
    name: string;
    party: string;
    logoIPFS?: string;
  }[];
  isLive: boolean;
}

export const LiveVoteCount = ({ candidates, isLive }: LiveVoteCountProps) => {
  const sortedCandidates = [...candidates].sort((a, b) => {
    const aVotes = Number(useVoteCount(a.id, isLive));
    const bVotes = Number(useVoteCount(b.id, isLive));
    return bVotes - aVotes;
  });

  const getPosition = (index: number) => {
    if (index === 0) return { color: "text-yellow-500", label: "1st" };
    if (index === 1) return { color: "text-gray-400", label: "2nd" };
    if (index === 2) return { color: "text-amber-600", label: "3rd" };
    return { color: "text-gray-600", label: `${index + 1}th` };
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Live Vote Count
          <span className="text-xs text-purple-500 animate-pulse">(Updates every 5s)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCandidates.map((candidate, index) => {
            const voteCount = useVoteCount(candidate.id, isLive);
            const position = getPosition(index);
            
            return (
              <div
                key={candidate.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <Medal className={`h-5 w-5 ${position.color}`} />
                  <div className="flex items-center gap-3">
                    {candidate.logoIPFS && (
                      <img
                        src={candidate.logoIPFS.replace(
                          "ipfs://",
                          "https://ipfs.io/ipfs/"
                        )}
                        alt={`${candidate.name}'s logo`}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    )}
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.party}</p>
                    </div>
                  </div>
                </div>
                <p className="font-bold text-lg">
                  {voteCount.toString()} votes
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};