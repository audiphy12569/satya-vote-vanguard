import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ElectionHistory } from "@/utils/electionUtils";
import { Medal } from "lucide-react";
import { useVoteCount } from "@/hooks/useVoteCount";
import { useEffect, useState } from "react";
import { getElectionHistory, getCurrentElectionId } from "@/utils/electionUtils";
import { useToast } from "@/hooks/use-toast";

interface ElectionResultsProps {
  election: ElectionHistory;
  isLive?: boolean;
}

export const ElectionResults = ({ election, isLive = false }: ElectionResultsProps) => {
  const [currentResults, setCurrentResults] = useState(election);
  const { toast } = useToast();
  
  useEffect(() => {
    setCurrentResults(election);
    
    // Set up timer to check if election has ended
    if (isLive) {
      const checkElectionEnd = async () => {
        const now = Date.now() / 1000;
        const endTime = Number(election.endTime);
        
        if (now >= endTime) {
          try {
            // Get the current election ID to ensure we're getting the right results
            const currentId = await getCurrentElectionId();
            const updatedResults = await getElectionHistory(Number(currentId));
            
            if (updatedResults.id === 0n) {
              console.error("Invalid election ID received");
              return;
            }
            
            setCurrentResults(updatedResults);
            
            // Notify user that results have been updated
            toast({
              title: "Election Results Updated",
              description: `Results for Election #${Number(updatedResults.id)} have been finalized.`,
            });
          } catch (error) {
            console.error("Failed to update election results:", error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to update election results. Please try again.",
            });
          }
        }
      };
      
      // Check immediately and then set up interval
      checkElectionEnd();
      const timer = setInterval(checkElectionEnd, 5000); // Check every 5 seconds
      return () => clearInterval(timer);
    }
  }, [election, isLive, toast]);

  const sortedResults = [...currentResults.results].sort((a, b) => 
    Number(b.voteCount - a.voteCount)
  );

  const getPosition = (index: number) => {
    if (index === 0) return { color: "text-yellow-500", label: "1st" };
    if (index === 1) return { color: "text-gray-400", label: "2nd" };
    if (index === 2) return { color: "text-amber-600", label: "3rd" };
    return { color: "text-gray-600", label: `${index + 1}th` };
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.getTime() > 0 ? date.toLocaleString() : "N/A";
  };

  const isElectionOver = () => {
    return Date.now() / 1000 > Number(currentResults.endTime);
  };

  // Don't show results if the election ID is 0 (invalid)
  if (currentResults.id === 0n) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">
          {isLive ? (
            "Current Election Results"
          ) : (
            <>
              Election #{Number(currentResults.id)} Results
              <span className="text-sm text-gray-500 block">
                Started: {formatDate(currentResults.startTime)}
                <br />
                Ended: {formatDate(currentResults.endTime)}
                {isElectionOver() && <span className="text-red-500 ml-2">(Ended)</span>}
              </span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentResults.totalVotes === 0n ? (
          <p className="text-center text-gray-500">No votes have been cast yet</p>
        ) : (
          <div className="space-y-4">
            {sortedResults.map((result, index) => {
              const position = getPosition(index);
              const prevVotes = index > 0 ? sortedResults[index - 1].voteCount : null;
              const isTied = prevVotes === result.voteCount;
              const liveVoteCount = isLive && !isElectionOver() ? 
                useVoteCount(Number(result.candidateId), true) : 
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
              Total Votes: {currentResults.totalVotes.toString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};