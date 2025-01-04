import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { writeContract, getPublicClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2, Trash2 } from "lucide-react";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { useAccount } from "wagmi";

interface Candidate {
  id: number;
  name: string;
  party: string;
  tagline: string;
  logoIPFS: string;
  voteCount: bigint;
}

interface CandidateListProps {
  candidates: Candidate[];
  isLoading: boolean;
  onCandidateDeleted: () => Promise<void>;
}

export const CandidateList = ({ candidates, isLoading, onCandidateDeleted }: CandidateListProps) => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const handleDeleteCandidate = async (id: number) => {
    try {
      setIsDeletingId(id);
      const { hash } = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'removeCandidate',
        args: [BigInt(id)],
        chain: sepolia,
        account: address,
      }) as { hash: `0x${string}` };

      toast({
        title: "Transaction Submitted",
        description: "Please wait for confirmation...",
        variant: "default",
      });

      const publicClient = await getPublicClient(config);
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast({
        title: "Transaction Successful",
        description: "Candidate has been removed successfully.",
        variant: "default",
      });
      
      await onCandidateDeleted();
    } catch (error) {
      console.error("Failed to remove candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove candidate."
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidates List</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : candidates.length === 0 ? (
          <Alert>
            <AlertDescription>
              No candidates found. Add a candidate to get started.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="p-3 border rounded flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {candidate.logoIPFS && (
                    <img 
                      src={candidate.logoIPFS.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                      alt={`${candidate.name}'s logo`}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  )}
                  <div>
                    <p className="font-semibold">{candidate.name}</p>
                    <p className="text-sm text-gray-600">{candidate.party}</p>
                    <p className="text-xs text-gray-500">{candidate.tagline}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteCandidate(candidate.id)}
                  disabled={isDeletingId === candidate.id}
                >
                  {isDeletingId === candidate.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
