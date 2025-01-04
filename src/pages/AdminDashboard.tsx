import { VoterManagement } from "@/components/admin/VoterManagement";
import { CandidateManagement } from "@/components/admin/CandidateManagement";
import { ElectionControl } from "@/components/admin/ElectionControl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { ElectionResults } from "@/components/ElectionResults";
import { getElectionHistory } from "@/utils/electionUtils";

export const AdminDashboard = () => {
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [pastElections, setPastElections] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getElectionStatus',
        });
        setIsElectionActive(data[0]);

        const totalElections = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getTotalElections',
        });

        const elections = [];
        for (let i = 1; i <= Number(totalElections); i++) {
          const election = await getElectionHistory(i);
          elections.push(election);
        }
        setPastElections(elections);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Admin Dashboard</h1>
      
      <Alert className={isElectionActive ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
        <AlertDescription>
          {isElectionActive ? "Election is currently active" : "Election is not active"}
        </AlertDescription>
      </Alert>
      
      <div className="grid md:grid-cols-2 gap-6">
        <VoterManagement />
        <CandidateManagement />
        <ElectionControl />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Election History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pastElections.length === 0 ? (
            <Alert>
              <AlertDescription>
                No past elections found
              </AlertDescription>
            </Alert>
          ) : (
            pastElections.map((election) => (
              <ElectionResults key={String(election.id)} election={election} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};