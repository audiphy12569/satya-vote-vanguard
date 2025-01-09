import { writeContract, waitForTransaction, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";

export const writeContractWithConfirmation = async (functionName: string, args: any[]) => {
  try {
    const result = await writeContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName,
      args,
      chain: sepolia
    });

    await waitForTransaction(config, {
      hash: result,
    });

    return result;
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    throw error;
  }
};

export const getVoterChoice = async (address: string, electionId: bigint) => {
  try {
    const events = await readContract(config, {
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'getVoterChoice',
      args: [address, electionId]
    });
    return events;
  } catch (error) {
    console.error("Error getting voter choice:", error);
    throw error;
  }
};