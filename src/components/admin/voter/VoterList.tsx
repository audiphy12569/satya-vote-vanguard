import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, UserX } from "lucide-react";

interface VoterListProps {
  voterList: string[];
  isLoading: boolean;
  onRemove: () => Promise<void>;
}

export const VoterList = ({ voterList, isLoading, onRemove }: VoterListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Approved Voters</h3>
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
          disabled={isLoading || voterList.length === 0}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Remove All Voters
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        {voterList.length === 0 ? (
          <p className="text-center text-sm text-gray-500">No approved voters</p>
        ) : (
          <div className="space-y-2">
            {voterList.map((voter) => (
              <div
                key={voter}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
              >
                <span className="text-sm font-medium">{voter}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};