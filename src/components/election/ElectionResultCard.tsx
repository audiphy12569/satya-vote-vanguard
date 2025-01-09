import { Medal } from "lucide-react";
import { ElectionResult } from "@/types/election";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { readContract } from "@wagmi/core";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { useVoteCount } from "@/hooks/useVoteCount";

interface ElectionResultCardProps {
  result: ElectionResult;
  index: number;
  isLive: boolean;
  isElectionOver: () => boolean;
  electionId: bigint;
}

export const ElectionResultCard = ({ 
  result, 
  index, 
  isLive, 
  isElectionOver,
  electionId 
}: ElectionResultCardProps) => {
  const { address } = useAccount();
  const [voterChoice, setVoterChoice] = useState<string>("");
  const liveVoteCount = useVoteCount(Number(result.candidateId), isLive && !isElectionOver());

  const getPosition = (index: number) => {
    if (index === 0) return { color: "text-yellow-500", label: "1st" };
    if (index === 1) return { color: "text-gray-400", label: "2nd" };
    if (index === 2) return { color: "text-amber-600", label: "3rd" };
    return { color: "text-gray-600", label: `${index + 1}th` };
  };

  useEffect(() => {
    const checkVoterChoice = async () => {
      if (!address || !electionId || isLive) return;
      
      try {
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        });

        const events = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          eventName: 'VoteCast',
          fromBlock: 0n,
          toBlock: 'latest',
          args: {
            voter: address as `0x${string}`,
            electionId: electionId
          }
        });

        if (events && events.length > 0) {
          const votedCandidateId = events[0].args.candidateId;
          if (votedCandidateId === result.candidateId) {
            setVoterChoice(`You voted ${result.party}`);
          }
        }
      } catch (error) {
        console.error("Error checking voter choice:", error);
      }
    };

    checkVoterChoice();
  }, [address, electionId, result, isLive]);

  const position = getPosition(index);
  const displayVoteCount = isLive && !isElectionOver() ? liveVoteCount : result.voteCount;

  return (
    <div 
      key={String(result.candidateId)} 
      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
    >
      <div className="flex items-center space-x-3">
        <Medal className={`h-5 w-5 ${position.color}`} />
        <div>
          <p className="font-medium">{result.candidateName}</p>
          <p className="text-sm text-gray-500">{result.party}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        {voterChoice && (
          <span className="text-xs text-purple-600 font-medium mb-1">
            {voterChoice}
          </span>
        )}
        <p className="font-bold">
          {displayVoteCount.toString()} votes
          {isLive && !isElectionOver() && (
            <span className="text-xs text-purple-500 ml-1">(Live)</span>
          )}
        </p>
      </div>
    </div>
  );
};