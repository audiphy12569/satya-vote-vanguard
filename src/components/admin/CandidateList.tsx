import { useEffect, useState } from "react";
import { writeContract, getPublicClient, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Candidate } from "@/types/election";
import { useAccount } from "wagmi";

export const CandidateList = () => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCandidates = async () => {
    try {
      const count = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getCandidateCount',
      });

      const candidatesData = [];
      for (let i = 1; i <= Number(count); i++) {
        const candidate = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getCandidate',
          args: [BigInt(i)],
        });
        candidatesData.push({
          id: i,
          name: candidate[0],
          party: candidate[1],
          tagline: candidate[2],
          logoIPFS: candidate[3],
          voteCount: candidate[4],
          isActive: true,
        });
      }
      setCandidates(candidatesData);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch candidates",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleRemove = async (id: number) => {
    if (!address) return;
    
    try {
      setRemovingId(id);
      const result = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'removeCandidate',
        args: [BigInt(id)],
        chain: sepolia,
        account: address,
      });

      const publicClient = await getPublicClient(config);
      await publicClient.waitForTransactionReceipt({ 
        hash: result 
      });

      toast({
        title: "Success",
        description: "Candidate removed successfully",
      });

      fetchCandidates();
    } catch (error) {
      console.error("Failed to remove candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove candidate",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const formatIPFSUrl = (ipfsUrl: string) => {
    if (!ipfsUrl) return '';
    // Convert IPFS URL to HTTP gateway URL
    return ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidate List</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate List</CardTitle>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <p className="text-center text-gray-500">No candidates added yet</p>
        ) : (
          <div className="space-y-4">
            {candidates.map(candidate => (
              <div key={candidate.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-4">
                  {candidate.logoIPFS && (
                    <img 
                      src={formatIPFSUrl(candidate.logoIPFS)} 
                      alt={`${candidate.name}'s logo`}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{candidate.name}</h3>
                    <p className="text-sm text-gray-500">{candidate.party}</p>
                    {candidate.tagline && (
                      <p className="text-sm text-gray-600 mt-1">{candidate.tagline}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="destructive"
                  onClick={() => handleRemove(candidate.id)} 
                  disabled={removingId === candidate.id}
                  className="ml-4"
                >
                  {removingId === candidate.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Remove'
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