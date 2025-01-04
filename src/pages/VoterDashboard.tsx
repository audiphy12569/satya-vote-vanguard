import { useState, useEffect } from "react";
import { ElectionTimer } from "@/components/ElectionTimer";
import { getElectionStatus } from "@/utils/electionUtils";

export const VoterDashboard = () => {
  const [electionStatus, setElectionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElectionStatus = async () => {
      try {
        const status = await getElectionStatus();
        setElectionStatus(status);
      } catch (error) {
        console.error("Failed to fetch election status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElectionStatus();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchElectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">
        Voter Dashboard
      </h1>

      {electionStatus?.isActive && (
        <ElectionTimer endTime={Number(electionStatus.endTime)} />
      )}

      {isLoading ? (
        <p>Loading election status...</p>
      ) : (
        <p>{electionStatus?.isActive ? "Election is active" : "No active election"}</p>
      )}
    </div>
  );
};
