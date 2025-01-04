import { Button } from "@/components/ui/button";

interface VoterListProps {
  voters: string[];
  onApprove: (address: string) => void;
  onRemove: (address: string) => void;
  isLoading: boolean;
}

export const VoterList = ({ voters, onApprove, onRemove, isLoading }: VoterListProps) => {
  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <ul className="space-y-4">
      {voters.map((voter) => (
        <li key={voter} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
          <span className="font-mono text-sm">{voter}</span>
          <div className="space-x-2">
            <Button 
              onClick={() => onApprove(voter)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Approve
            </Button>
            <Button 
              onClick={() => onRemove(voter)} 
              variant="destructive"
              size="sm"
            >
              Remove
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
};