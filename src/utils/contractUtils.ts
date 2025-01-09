import { writeContract, waitForTransaction } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { mainnet } from "@/config/chains";

export const writeContractWithConfirmation = async (functionName: string, args: any[]) => {
  try {
    const { hash } = await writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName,
      args,
      chain: mainnet,
    });

    await waitForTransaction({
      hash: hash as `0x${string}`,
    });

    return hash;
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    throw error;
  }
};
