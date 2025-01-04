import { VoterManagement } from "@/components/admin/VoterManagement";
import { CandidateManagement } from "@/components/admin/CandidateManagement";
import { ElectionControl } from "@/components/admin/ElectionControl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { ElectionResults } from "@/components/ElectionResults";
import { getElectionStatus, getElectionHistory, getTotalElections } from "@/utils/electionUtils";
import type { ElectionHistory } from "@/utils/electionUtils";

export const AdminDashboard = () => {
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [pastElections, setPastElections] = useState<ElectionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setIsLoading(true);
        const status = await getElectionStatus();
        setIsElectionActive(status.isActive);

        const totalElections = await getTotalElections();
        const elections = [];
        
        // Fetch all past elections
        for (let i = 1; i <= totalElections; i++) {
          try {
            const election = await getElectionHistory(i);
            elections.push(election);
          } catch (error) {
            console.error(`Failed to fetch election #${i}:`, error);
          }
        }
        
        // Sort elections by ID in descending order (newest first)
        setPastElections(elections.sort((a, b) => Number(b.id - a.id)));
      } catch (error) {
        console.error("Failed to fetch election data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectionData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchElectionData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Admin Dashboard</h1>
      
      <Alert className={isElectionActive ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
        <AlertDescription>
          {isElectionActive ? "Election is currently active" : "No active election"}
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
          {isLoading ? (
            <Alert>
              <AlertDescription>
                Loading election history...
              </AlertDescription>
            </Alert>
          ) : pastElections.length === 0 ? (
            <Alert>
              <AlertDescription>
                No past elections found
              </AlertDescription>
            </Alert>
          ) : (
            pastElections.map((election) => (
              <ElectionResults 
                key={String(election.id)} 
                election={election} 
                isLive={isElectionActive && Number(election.id) === pastElections.length}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};