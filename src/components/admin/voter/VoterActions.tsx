import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface VoterActionsProps {
  onApprove: (address: string) => Promise<void>;
  onRemoveAll: () => Promise<void>;
  isLoading: boolean;
}

export const VoterActions = ({ onApprove, onRemoveAll, isLoading }: VoterActionsProps) => {
  const [voterAddress, setVoterAddress] = useState("");

  const handleApprove = async () => {
    if (!voterAddress) return;
    await onApprove(voterAddress);
    setVoterAddress("");
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-4">
        <Input
          placeholder="Enter voter address"
          value={voterAddress}
          onChange={(e) => setVoterAddress(e.target.value)}
          disabled={isLoading}
        />
        <Button 
          onClick={handleApprove}
          disabled={!voterAddress || isLoading}
        >
          Add Voter
        </Button>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full" disabled={isLoading}>
            Remove All Voters
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove all voters from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onRemoveAll}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};