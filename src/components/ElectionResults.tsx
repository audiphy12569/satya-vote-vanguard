import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ElectionHistory } from "@/types/election";
import { useEffect, useState } from "react";
import { getElectionHistory, getCurrentElectionId, getElectionStatus, hasVoted } from "@/utils/electionUtils";
import { useToast } from "@/hooks/use-toast";
import { ElectionHeader } from "./election/ElectionHeader";
import { ElectionResultCard } from "./election/ElectionResultCard";
import { useAccount } from "wagmi";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";

interface ElectionResultsProps {
  election: ElectionHistory;
  isLive?: boolean;
}

export const ElectionResults = ({ election, isLive = false }: ElectionResultsProps) => {
  const [currentResults, setCurrentResults] = useState(election);
  const [voterChoice, setVoterChoice] = useState<string>("");
  const { address } = useAccount();
  const { toast } = useToast();
  
  useEffect(() => {
    setCurrentResults(election);
    
    const fetchVoterChoice = async () => {
      if (!address || !election.id) return;
      
      try {
        // First check if the voter voted in this election
        const voted = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'hasVoted',
          args: [address],
        });

        if (voted) {
          // Find the candidate they voted for by checking the VoteCast events
          const publicClient = await config.publicClient;
          const events = await publicClient.getContractEvents({
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: CONTRACT_ABI,
            eventName: 'VoteCast',
            fromBlock: 0n,
            toBlock: 'latest',
            args: {
              voter: address,
              electionId: election.id
            }
          });

          if (events && events.length > 0) {
            const votedCandidateId = events[0].args.candidateId;
            const candidate = currentResults.results.find(
              r => r.candidateId === votedCandidateId
            );
            if (candidate) {
              setVoterChoice(`You voted for ${candidate.candidateName} (${candidate.party})`);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch voter choice:", error);
      }
    };

    if (!isLive && address) {
      fetchVoterChoice();
    }
    
    const fetchAndUpdateResults = async () => {
      try {
        const status = await getElectionStatus();
        const currentId = await getCurrentElectionId();
        
        if (currentId === Number(election.id)) {
          if (status.endTime && Date.now() / 1000 > Number(status.endTime)) {
            const updatedResults = await getElectionHistory(Number(currentId));
            
            if (updatedResults.id === 0n) {
              console.error("Invalid election ID received");
              return;
            }
            
            setCurrentResults(updatedResults);
            
            if (updatedResults.totalVotes !== election.totalVotes) {
              toast({
                title: "Election Results Updated",
                description: `Final results for Election #${Number(updatedResults.id)} are now available.`,
              });
            }
          }
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
  }, [election, isLive, toast, address]);

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
            {voterChoice && !isLive && (
              <Alert className="bg-purple-50 border-purple-200 mb-4">
                <AlertDescription className="text-purple-700">
                  {voterChoice}
                </AlertDescription>
              </Alert>
            )}
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