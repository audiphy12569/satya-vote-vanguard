import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

export const ElectionHistory = () => {
  const [elections, setElections] = useState([]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Election History</h1>
      
      <div className="space-y-6">
        {elections.map((election: any) => (
          <Card key={election.id}>
            <CardHeader>
              <CardTitle>Election #{election.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Start Time</p>
                  <p>{new Date(election.startTime * 1000).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Time</p>
                  <p>{new Date(election.endTime * 1000).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Votes</p>
                  <p>{election.totalVotes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Results</p>
                  <div className="space-y-2">
                    {election.results?.map((result: any) => (
                      <div key={result.candidateId} className="flex justify-between">
                        <span>{result.candidateName} ({result.party})</span>
                        <span>{result.voteCount} votes</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};