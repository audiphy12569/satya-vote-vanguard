import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Medal } from "lucide-react";
import { ElectionResult } from "@/types/election";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ElectionResultCardProps {
  result: ElectionResult;
  index: number;
  isLive: boolean;
  isElectionOver: () => boolean;
}

export const ElectionResultCard = ({ result, index, isLive, isElectionOver }: ElectionResultCardProps) => {
  const getPosition = (index: number) => {
    if (index === 0) return { color: "text-yellow-500", label: "1st" };
    if (index === 1) return { color: "text-gray-400", label: "2nd" };
    if (index === 2) return { color: "text-amber-600", label: "3rd" };
    return { color: "text-gray-600", label: `${index + 1}th` };
  };

  const position = getPosition(index);

  return (
    <div 
      key={String(result.candidateId)} 
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 relative"
    >
      <div className="flex items-center space-x-3">
        <Medal className={`h-5 w-5 ${position.color}`} />
        <div>
          <p className="font-medium">{result.candidateName}</p>
          <p className="text-sm text-gray-500">{result.party}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="font-bold">
            {result.voteCount.toString()} votes
            {isLive && !isElectionOver() && (
              <span className="text-xs text-purple-500 ml-1">(Live)</span>
            )}
          </p>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarImage 
            src={result.logoIPFS} 
            alt={result.candidateName} 
            className="object-cover"
          />
          <AvatarFallback className="bg-purple-100 text-purple-700">
            {result.candidateName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};