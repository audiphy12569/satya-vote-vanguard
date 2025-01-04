import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getElectionStatus } from "@/utils/electionUtils";

interface ElectionTimerProps {
  endTime: number;
}

export const ElectionTimer = ({ endTime }: ElectionTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const updateTimer = async () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("Election ended");
        setIsEnded(true);
        // Check election status to ensure it's properly updated
        await getElectionStatus();
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    // Update immediately
    updateTimer();
    
    // Then update every second
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <Card className={`${isEnded ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'} mb-4`}>
      <CardContent className="p-4 text-center">
        <p className={`text-sm font-medium ${isEnded ? 'text-red-600' : 'text-purple-600'}`}>
          {isEnded ? 'Election Status' : 'Time Remaining'}
        </p>
        <p className={`text-2xl font-bold ${isEnded ? 'text-red-800' : 'text-purple-800'}`}>
          {timeLeft}
        </p>
      </CardContent>
    </Card>
  );
};