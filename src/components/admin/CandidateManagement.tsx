import { useState, useEffect } from "react";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { useAccount } from "wagmi";
import { CandidateForm } from "./CandidateForm";
import { CandidateList } from "./CandidateList";
import { useToast } from "@/hooks/use-toast";

export const CandidateManagement = () => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCandidates = async () => {
    try {
      setIsLoading(true);
      const count = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getCandidateCount',
        chainId: sepolia.id,
        account: address,
      });

      const candidatesData = [];
      for (let i = 1; i <= Number(count); i++) {
        const candidate = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getCandidate',
          args: [BigInt(i)],
          chainId: sepolia.id,
          account: address,
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
      setCandidatesList(candidatesData);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch candidates."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <>
      <CandidateForm onCandidateAdded={fetchCandidates} />
      <CandidateList 
        candidates={candidatesList}
        isLoading={isLoading}
        onCandidateDeleted={fetchCandidates}
      />
    </>
  );
};