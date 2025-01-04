import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { getElectionHistory } from "@/utils/contractUtils";

export const ElectionHistory = () => {
  const [elections, setElections] = useState<any[]>([]);

  const fetchElectionHistory = async () => {
    try {
      const totalElections = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getTotalElections',
      });

      const electionResults = [];
      for (let i = 1; i <= Number(totalElections); i++) {
        const election = await getElectionHistory(i);
        if (election.id !== 0n) {
          electionResults.push(election);
        }
      }
      setElections(electionResults);
    } catch (error) {
      console.error("Failed to fetch election history:", error);
    }
  };

  useEffect(() => {
    fetchElectionHistory();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Election History</h1>
      
      <div className="space-y-6">
        {elections.length === 0 ? (
          <p className="text-gray-500 text-center">No past elections found</p>
        ) : (
          elections.map((election: any) => (
            <Card key={String(election.id)} className="shadow-md">
              <CardHeader>
                <CardTitle>Election #{String(election.id)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Time</p>
                    <p>{new Date(Number(election.startTime) * 1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Time</p>
                    <p>{new Date(Number(election.endTime) * 1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Votes</p>
                    <p>{String(election.totalVotes)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Results</p>
                    <div className="space-y-2">
                      {election.results?.map((result: any) => (
                        <div 
                          key={String(result.candidateId)} 
                          className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium">
                            {result.candidateName} 
                            <span className="text-gray-500 text-sm ml-2">
                              ({result.party})
                            </span>
                          </span>
                          <span className="font-bold">
                            {String(result.voteCount)} votes
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};