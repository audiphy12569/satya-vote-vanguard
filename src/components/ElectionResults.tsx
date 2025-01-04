import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ElectionHistory } from "@/utils/electionUtils";
import { Medal } from "lucide-react";
import { useVoteCount } from "@/hooks/useVoteCount";

interface ElectionResultsProps {
  election: ElectionHistory;
  isLive?: boolean;
}

export const ElectionResults = ({ election, isLive = false }: ElectionResultsProps) => {
  const sortedResults = [...election.results].sort((a, b) => 
    Number(b.voteCount - a.voteCount)
  );

  const getPosition = (index: number) => {
    if (index === 0) return { color: "text-yellow-500", label: "1st" };
    if (index === 1) return { color: "text-gray-400", label: "2nd" };
    if (index === 2) return { color: "text-amber-600", label: "3rd" };
    return { color: "text-gray-600", label: `${index + 1}th` };
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const isElectionOver = () => {
    return !isLive && Number(election.endTime) * 1000 < Date.now();
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">
          {isLive ? (
            "Current Election Results (Live)"
          ) : (
            <>
              Election #{Number(election.id)} Results
              <span className="text-sm text-gray-500 block">
                Started: {formatDate(election.startTime)}
                <br />
                Ended: {formatDate(election.endTime)}
                {isElectionOver() && <span className="text-red-500 ml-2">(Ended)</span>}
              </span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {election.totalVotes === 0n ? (
          <p className="text-center text-gray-500">No votes have been cast yet</p>
        ) : (
          <div className="space-y-4">
            {sortedResults.map((result, index) => {
              const position = getPosition(index);
              const prevVotes = index > 0 ? sortedResults[index - 1].voteCount : null;
              const isTied = prevVotes === result.voteCount;
              const liveVoteCount = isLive ? 
                useVoteCount(Number(result.candidateId), !isElectionOver()) : 
                result.voteCount;

              return (
                <div 
                  key={String(result.candidateId)} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <Medal className={`h-5 w-5 ${position.color}`} />
                    <div>
                      <p className="font-medium">{result.candidateName}</p>
                      <p className="text-sm text-gray-500">{result.party}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {liveVoteCount.toString()} votes
                      {isLive && !isElectionOver() && (
                        <span className="text-xs text-purple-500 ml-1">(Live)</span>
                      )}
                    </p>
                    {isTied && <p className="text-sm text-orange-500">Tied</p>}
                  </div>
                </div>
              );
            })}
            <div className="mt-4 text-sm text-gray-500 text-right">
              Total Votes: {election.totalVotes.toString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};