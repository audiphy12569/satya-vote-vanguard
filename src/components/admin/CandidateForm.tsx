import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { writeContract, getPublicClient } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2 } from "lucide-react";
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { useAccount } from "wagmi";
import axios from 'axios';

export const CandidateForm = ({ onCandidateAdded }: { onCandidateAdded: () => Promise<void> }) => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    tagline: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const uploadToIPFS = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
          'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY,
        },
      });

      return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw new Error('Failed to upload image to IPFS');
    }
  };

  const handleAddCandidate = async () => {
    try {
      setIsLoading(true);
      if (!selectedFile) {
        throw new Error("Please select a logo file");
      }

      const ipfsHash = await uploadToIPFS(selectedFile);
      
      const { hash } = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'addCandidate',
        args: [
          candidateForm.name,
          candidateForm.party,
          candidateForm.tagline,
          ipfsHash,
        ],
        chain: sepolia,
        account: address,
      }) as { hash: `0x${string}` };

      toast({
        title: "Transaction Submitted",
        description: "Please wait for confirmation...",
        variant: "default",
      });

      const publicClient = await getPublicClient(config);
      await publicClient.waitForTransactionReceipt({ hash });
      
      toast({
        title: "Transaction Successful",
        description: `Candidate ${candidateForm.name} has been added successfully.`,
        variant: "default",
      });
      
      await onCandidateAdded();
      setCandidateForm({ name: "", party: "", tagline: "" });
      setSelectedFile(null);
    } catch (error) {
      console.error("Failed to add candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add candidate."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Candidate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Name"
          value={candidateForm.name}
          onChange={(e) => setCandidateForm({...candidateForm, name: e.target.value})}
        />
        <Input
          placeholder="Party"
          value={candidateForm.party}
          onChange={(e) => setCandidateForm({...candidateForm, party: e.target.value})}
        />
        <Input
          placeholder="Tagline"
          value={candidateForm.tagline}
          onChange={(e) => setCandidateForm({...candidateForm, tagline: e.target.value})}
        />
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="cursor-pointer"
        />
        <Button 
          onClick={handleAddCandidate} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Candidate
        </Button>
      </CardContent>
    </Card>
  );
};
