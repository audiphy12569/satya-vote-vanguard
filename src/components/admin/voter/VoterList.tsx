import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, UserX } from "lucide-react";

interface VoterListProps {
  voterList: string[];
  isLoading: boolean;
  onRemove: () => Promise<void>;
}

export const VoterList = ({ voterList, isLoading, onRemove }: VoterListProps) => {
  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      {voterList.length === 0 ? (
        <p className="text-center text-gray-500">No voters found</p>
      ) : (
        <div className="space-y-4">
          {voterList.map((voter, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <span className="font-mono text-sm">{voter}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={onRemove}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserX className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
};