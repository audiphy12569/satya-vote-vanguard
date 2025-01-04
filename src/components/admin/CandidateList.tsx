import { useEffect, useState } from "react";
import { writeContract, getPublicClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { useToast } from "@/hooks/use-toast";

export const CandidateList = () => {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null); // Assume you have a way to get the user's address

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
        });
      }
      setCandidates(candidatesData);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
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
        hash: result.hash as `0x${string}` 
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

  return (
    <div>
      <h2 className="text-lg font-bold">Candidate List</h2>
      <ul>
        {candidates.map(candidate => (
          <li key={candidate.id} className="flex justify-between items-center">
            <div>
              <p>{candidate.name} ({candidate.party})</p>
              <p>{candidate.tagline}</p>
            </div>
            <button 
              onClick={() => handleRemove(candidate.id)} 
              disabled={removingId === candidate.id}
              className="text-red-500"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
