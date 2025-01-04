import { useEffect, useState } from "react";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

export const VoterList = () => {
  const [voters, setVoters] = useState<string[]>([]);

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const data = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getAllVoters',
        }) as string[];
        setVoters(data);
      } catch (error) {
        console.error("Failed to fetch voters:", error);
      }
    };

    fetchVoters();
  }, []);

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <ScrollArea className="h-[200px] rounded-md border p-4">
          {voters.map((voter, index) => (
            <div
              key={voter}
              className="flex items-center py-2 border-b last:border-0"
            >
              <span className="text-sm font-medium truncate hover:text-clip">
                {voter}
              </span>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};