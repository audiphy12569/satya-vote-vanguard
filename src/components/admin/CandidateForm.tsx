import { useState } from "react";
import { useAccount } from "wagmi";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { writeContract, getPublicClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  party: z.string().min(1, "Party is required"),
  tagline: z.string().optional(),
  logo: z.instanceof(File).refine(file => file.size <= 2 * 1024 * 1024, {
    message: "File size must be less than 2MB",
  }),
});

export const CandidateForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: async (data) => {
      try {
        await formSchema.parseAsync(data);
        return { values: data, errors: {} };
      } catch (error) {
        return { values: {}, errors: error.flatten().fieldErrors };
      }
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!address) return;

    try {
      setIsSubmitting(true);
      const ipfsHash = await uploadToIPFS(data.logo[0]);
      
      const result = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'addCandidate',
        args: [data.name, data.party, data.tagline, ipfsHash],
        chain: sepolia,
        account: address,
      });

      const publicClient = await getPublicClient(config);
      await publicClient.waitForTransactionReceipt({ 
        hash: result.hash as `0x${string}` 
      });

      toast({
        title: "Success",
        description: "Candidate added successfully",
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Failed to add candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add candidate",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <label>Name</label>
        <input {...form.register("name")} />
        {form.formState.errors.name && <p>{form.formState.errors.name.message}</p>}
      </div>
      <div>
        <label>Party</label>
        <input {...form.register("party")} />
        {form.formState.errors.party && <p>{form.formState.errors.party.message}</p>}
      </div>
      <div>
        <label>Tagline</label>
        <input {...form.register("tagline")} />
      </div>
      <div>
        <label>Logo</label>
        <input type="file" {...form.register("logo")} />
        {form.formState.errors.logo && <p>{form.formState.errors.logo.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Add Candidate"}
      </button>
    </form>
  );
};
