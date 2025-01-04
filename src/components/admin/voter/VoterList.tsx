import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoterListProps {
  voters: string[];
  isLoading: boolean;
  onRemove: (voterAddress: string) => Promise<void>;
}

export const VoterList = ({ voters, isLoading, onRemove }: VoterListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (voters.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No voters found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {voters.map((voter) => (
        <div key={voter} className="p-3 border rounded flex justify-between items-center">
          <span className="font-mono">{voter}</span>
        </div>
      ))}
    </div>
  );
};