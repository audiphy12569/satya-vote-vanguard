import { readContract, writeContract, getPublicClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";

export const getAdminAddress = async () => {
  try {
    return await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'admin',
    });
  } catch (error) {
    console.error("Error getting admin address:", error);
    throw error;
  }
};

export const checkVoterStatus = async (address: string) => {
  try {
    return await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'approvedVoters',
      args: [address as `0x${string}`],
    });
  } catch (error) {
    console.error("Error checking voter status:", error);
    throw error;
  }
};

export const writeContractWithConfirmation = async (
  functionName: "addCandidate" | "approveVoter" | "removeAllVoters" | "removeCandidate" | "removeVoter" | "startElection" | "vote",
  args: Parameters<typeof CONTRACT_ABI[number]>[number],
  account: `0x${string}` | undefined
) => {
  const { hash } = await writeContract(config, {
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName,
    args,
    chain: sepolia,
    account,
  });

  const publicClient = await getPublicClient(config);
  await publicClient.waitForTransactionReceipt({ hash });
  
  return hash;
};