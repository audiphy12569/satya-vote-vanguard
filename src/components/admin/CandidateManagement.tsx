import { useState, useEffect } from "react";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { useAccount } from "wagmi";
import { CandidateForm } from "./CandidateForm";
import { CandidateList } from "./CandidateList";
import { useToast } from "@/hooks/use-toast";
import type { Candidate } from "@/types/election";

export const CandidateManagement = () => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const handleCandidateAdded = () => {
    toast({
      title: "Success",
      description: "Candidate list has been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <CandidateForm onSuccess={handleCandidateAdded} />
      <CandidateList />
    </div>
  );
};