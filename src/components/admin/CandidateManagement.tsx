import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { writeContract, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2, Trash2 } from "lucide-react";
import axios from 'axios';
import { config } from "@/config/web3";
import { sepolia } from "wagmi/chains";
import { useAccount } from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CandidateManagement = () => {
  const { toast } = useToast();
  const { address } = useAccount();
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    tagline: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({
    addCandidate: false,
    deleteCandidate: false,
    fetchCandidates: false
  });

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

  const fetchCandidates = async () => {
    try {
      setIsLoading(prev => ({ ...prev, fetchCandidates: true }));
      const count = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getCandidateCount',
        chainId: sepolia.id,
        account: address,
      });

      const candidatesData = [];
      for (let i = 1; i <= Number(count); i++) {
        const candidate = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getCandidate',
          args: [BigInt(i)],
          chainId: sepolia.id,
          account: address,
        });
        candidatesData.push({
          id: i,
          name: candidate[0],
          party: candidate[1],
          tagline: candidate[2],
          logoIPFS: candidate[3],
          voteCount: candidate[4],
        });
      }
      setCandidatesList(candidatesData);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch candidates."
      });
    } finally {
      setIsLoading(prev => ({ ...prev, fetchCandidates: false }));
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleAddCandidate = async () => {
    try {
      setIsLoading(prev => ({ ...prev, addCandidate: true }));
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
        chainId: sepolia.id,
        account: address,
      });

      toast({
        title: "Transaction Submitted",
        description: "Please wait for confirmation...",
        variant: "default",
      });

      // Wait for transaction confirmation
      const provider = await config.getPublicClient();
      await provider.waitForTransactionReceipt({ hash });
      
      toast({
        title: "Transaction Successful",
        description: `Candidate ${candidateForm.name} has been added successfully.`,
        variant: "default",
      });
      
      await fetchCandidates();
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
      setIsLoading(prev => ({ ...prev, addCandidate: false }));
    }
  };

  const handleDeleteCandidate = async (id: number) => {
    try {
      setIsLoading(prev => ({ ...prev, deleteCandidate: true }));
      const { hash } = await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'removeCandidate',
        args: [BigInt(id)],
        chainId: sepolia.id,
        account: address,
      });

      toast({
        title: "Transaction Submitted",
        description: "Please wait for confirmation...",
        variant: "default",
      });

      // Wait for transaction confirmation
      const provider = await config.getPublicClient();
      await provider.waitForTransactionReceipt({ hash });
      
      toast({
        title: "Transaction Successful",
        description: "Candidate has been removed successfully.",
        variant: "default",
      });
      
      await fetchCandidates();
    } catch (error) {
      console.error("Failed to remove candidate:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove candidate."
      });
    } finally {
      setIsLoading(prev => ({ ...prev, deleteCandidate: false }));
    }
  };

  return (
    <>
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
            disabled={isLoading.addCandidate}
          >
            {isLoading.addCandidate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Candidate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Candidates List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading.fetchCandidates ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : candidatesList.length === 0 ? (
            <Alert>
              <AlertDescription>
                No candidates found. Add a candidate to get started.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {candidatesList.map((candidate) => (
                <div key={candidate.id} className="p-3 border rounded flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {candidate.logoIPFS && (
                      <img 
                        src={candidate.logoIPFS.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                        alt={`${candidate.name}'s logo`}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    )}
                    <div>
                      <p className="font-semibold">{candidate.name}</p>
                      <p className="text-sm text-gray-600">{candidate.party}</p>
                      <p className="text-xs text-gray-500">{candidate.tagline}</p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteCandidate(candidate.id)}
                    disabled={isLoading.deleteCandidate}
                  >
                    {isLoading.deleteCandidate ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};