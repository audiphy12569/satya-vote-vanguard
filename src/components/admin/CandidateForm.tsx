import { useState } from "react";
import { useAccount } from "wagmi";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { writeContract, getPublicClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { uploadToIPFS } from "@/utils/ipfsUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  party: z.string().min(1, "Party is required"),
  tagline: z.string().optional(),
  logo: z.instanceof(File).refine(file => file.size <= 2 * 1024 * 1024, {
    message: "File size must be less than 2MB",
  }),
});

type FormData = z.infer<typeof formSchema>;

export const CandidateForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormData>();

  const handleSubmit = async (data: FormData) => {
    if (!address) return;

    try {
      setIsSubmitting(true);
      const ipfsHash = await uploadToIPFS(data.logo);
      
      const result = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'addCandidate',
        args: [data.name, data.party, data.tagline || "", ipfsHash],
        chain: sepolia,
        account: address,
      });

      const publicClient = await getPublicClient(config);
      await publicClient.waitForTransactionReceipt({ 
        hash: result 
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
    <Card>
      <CardHeader>
        <CardTitle>Add New Candidate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="party">Party</Label>
            <Input id="party" {...form.register("party")} />
            {form.formState.errors.party && (
              <p className="text-sm text-red-500">{form.formState.errors.party.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" {...form.register("tagline")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <Input id="logo" type="file" {...form.register("logo")} />
            {form.formState.errors.logo && (
              <p className="text-sm text-red-500">{form.formState.errors.logo.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Candidate"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};