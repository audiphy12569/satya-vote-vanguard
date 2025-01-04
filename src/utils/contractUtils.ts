import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { sepolia } from "wagmi/chains";

export const getAdminAddress = async () => {
  const data = await readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'admin',
    chainId: sepolia.id,
  });
  return data as string;
};

export const checkVoterStatus = async (address: string) => {
  const data = await readContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'voters',
    args: [address],
    chainId: sepolia.id,
  });
  return Boolean(data);
};