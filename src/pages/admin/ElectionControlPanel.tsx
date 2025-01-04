import { ElectionControl } from "@/components/admin/ElectionControl";
import { ElectionResults } from "@/components/ElectionResults";
import { useState, useEffect } from "react";
import { getElectionStatus } from "@/utils/electionUtils";
import { fetchElectionHistory } from "@/utils/electionHistoryUtils";
import type { ElectionHistory } from "@/types/election";

export const ElectionControlPanel = () => {
  const [electionStatus, setElectionStatus] = useState<any>(null);
  const [pastElections, setPastElections] = useState<ElectionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const status = await getElectionStatus();
        setElectionStatus(status);
        const history = await fetchElectionHistory();
        setPastElections(history);
      } catch (error) {
        console.error("Failed to fetch election data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Election Control
      </h1>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <ElectionControl />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            Election Results
          </h2>
          {pastElections.map((election) => (
            <ElectionResults 
              key={String(election.id)} 
              election={election} 
              isLive={electionStatus?.isActive && Number(election.id) === pastElections.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};