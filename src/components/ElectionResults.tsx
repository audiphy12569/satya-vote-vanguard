import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ElectionHistory } from "@/types/election";
import { useVoteCount } from "@/hooks/useVoteCount";
import { useEffect, useState } from "react";
import { getElectionHistory, getCurrentElectionId } from "@/utils/electionUtils";
import { useToast } from "@/hooks/use-toast";
import { ElectionHeader } from "./election/ElectionHeader";
import { ElectionResultCard } from "./election/ElectionResultCard";

interface ElectionResultsProps {
  election: ElectionHistory;
  isLive?: boolean;
}

export const ElectionResults = ({ election, isLive = false }: ElectionResultsProps) => {
  const [currentResults, setCurrentResults] = useState(election);
  const { toast } = useToast();
  
  useEffect(() => {
    setCurrentResults(election);
    
    const fetchAndUpdateResults = async () => {
      try {
        const currentId = await getCurrentElectionId();
        const updatedResults = await getElectionHistory(Number(currentId));
        
        if (updatedResults.id === 0n) {
          console.error("Invalid election ID received");
          return;
        }
        
        setCurrentResults(updatedResults);
        
        if (updatedResults.totalVotes !== election.totalVotes) {
          toast({
            title: "Election Results Updated",
            description: `Results for Election #${Number(updatedResults.id)} have been updated.`,
          });
        }
      } catch (error) {
        console.error("Failed to update election results:", error);
      }
    };
    
    if (isLive) {
      fetchAndUpdateResults();
      const timer = setInterval(fetchAndUpdateResults, 5000);
      return () => clearInterval(timer);
    }
  }, [election, isLive, toast]);

  const sortedResults = [...currentResults.results].sort((a, b) => 
    Number(b.voteCount - a.voteCount)
  );

  const isElectionOver = () => {
    return Date.now() / 1000 > Number(currentResults.endTime);
  };

  if (currentResults.id === 0n) {
    return null;
  }

  return (
    <Card className="mb-4">
      <ElectionHeader 
        isLive={isLive}
        id={currentResults.id}
        startTime={currentResults.startTime}
        endTime={currentResults.endTime}
        isElectionOver={isElectionOver}
      />
      <CardContent>
        {currentResults.totalVotes === 0n ? (
          <Alert>
            <AlertDescription>No votes have been cast yet</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {sortedResults.map((result, index) => (
              <ElectionResultCard
                key={String(result.candidateId)}
                result={result}
                index={index}
                isLive={isLive}
                isElectionOver={isElectionOver}
              />
            ))}
            <div className="mt-4 text-sm text-gray-500 text-right">
              Total Votes: {currentResults.totalVotes.toString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};