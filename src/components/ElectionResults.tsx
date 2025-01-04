import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ElectionHistory } from "@/utils/electionUtils";
import { Medal } from "lucide-react";

interface ElectionResultsProps {
  election: ElectionHistory;
}

export const ElectionResults = ({ election }: ElectionResultsProps) => {
  const sortedResults = [...election.results].sort((a, b) => 
    Number(b.voteCount - a.voteCount)
  );

  const getPosition = (index: number) => {
    if (index === 0) return { color: "text-yellow-500", label: "1st" };
    if (index === 1) return { color: "text-gray-400", label: "2nd" };
    if (index === 2) return { color: "text-amber-600", label: "3rd" };
    return { color: "text-gray-600", label: `${index + 1}th` };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Election #{Number(election.id)} Results
          <span className="text-sm text-gray-500 block">
            {new Date(Number(election.startTime) * 1000).toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {election.totalVotes === 0n ? (
          <p className="text-center text-gray-500">No votes were cast in this election</p>
        ) : (
          <div className="space-y-4">
            {sortedResults.map((result, index) => {
              const position = getPosition(index);
              const prevVotes = index > 0 ? sortedResults[index - 1].voteCount : null;
              const isTied = prevVotes === result.voteCount;

              return (
                <div key={String(result.candidateId)} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Medal className={`h-5 w-5 ${position.color}`} />
                    <div>
                      <p className="font-medium">{result.candidateName}</p>
                      <p className="text-sm text-gray-500">{result.party}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{result.voteCount.toString()} votes</p>
                    {isTied && <p className="text-sm text-orange-500">Tied</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};