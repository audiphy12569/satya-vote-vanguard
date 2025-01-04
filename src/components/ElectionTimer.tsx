import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ElectionTimerProps {
  endTime: number;
}

export const ElectionTimer = ({ endTime }: ElectionTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("Election ended");
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardContent className="p-4 text-center">
        <p className="text-sm text-purple-600 font-medium">Time Remaining</p>
        <p className="text-2xl font-bold text-purple-800">{timeLeft}</p>
      </CardContent>
    </Card>
  );
};