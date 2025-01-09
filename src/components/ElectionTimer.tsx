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
        await getElectionStatus();
        return;
      }

      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <Card className={`${isEnded ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'} mb-4 w-full max-w-full overflow-hidden`}>
      <CardContent className="p-4 text-center">
        <p className={`text-sm font-medium ${isEnded ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'}`}>
          {isEnded ? 'Election Status' : 'Time Remaining'}
        </p>
        <p className={`text-xl md:text-2xl font-bold ${isEnded ? 'text-red-800 dark:text-red-200' : 'text-purple-800 dark:text-purple-200'}`}>
          {timeLeft}
        </p>
      </CardContent>
    </Card>
  );
};