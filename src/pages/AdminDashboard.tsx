import { VoterManagement } from "@/components/admin/VoterManagement";
import { CandidateManagement } from "@/components/admin/CandidateManagement";
import { ElectionControl } from "@/components/admin/ElectionControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { ElectionResults } from "@/components/ElectionResults";
import { ElectionTimer } from "@/components/ElectionTimer";
import { getElectionStatus } from "@/utils/electionUtils";
import { fetchElectionHistory } from "@/utils/electionHistoryUtils";
import type { ElectionHistory } from "@/utils/electionUtils";

export const AdminDashboard = () => {
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [pastElections, setPastElections] = useState<ElectionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [electionStatus, setElectionStatus] = useState<any>(null);

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setIsLoading(true);
        const status = await getElectionStatus();
        setIsElectionActive(status.isActive);
        setElectionStatus(status);

        const elections = await fetchElectionHistory();
        setPastElections(elections);
      } catch (error) {
        console.error("Failed to fetch election data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectionData();
    const interval = setInterval(fetchElectionData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Admin Dashboard</h1>
      
      {isElectionActive && electionStatus?.endTime && (
        <ElectionTimer endTime={Number(electionStatus.endTime)} />
      )}

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