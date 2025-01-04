import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { writeContract, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2, Trash2 } from "lucide-react";
import axios from 'axios';
import { config } from "@/config/web3";

export const CandidateManagement = () => {
  const { toast } = useToast();
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    tagline: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({
    addCandidate: false,
    deleteCandidate: false
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
      const count = await readContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getCandidateCount',
      });

      const candidatesData = [];
      for (let i = 1; i <= Number(count); i++) {
        const candidate = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'getCandidate',
          args: [BigInt(i)],
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
    }
  };

  const handleAddCandidate = async () => {
    try {
      setIsLoading(prev => ({ ...prev, addCandidate: true }));
      if (!selectedFile) {
        throw new Error("Please select a logo file");
      }

      const ipfsHash = await uploadToIPFS(selectedFile);
      
      await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'addCandidate',
        args: [
          candidateForm.name,
          candidateForm.party,
          candidateForm.tagline,
          ipfsHash,
        ],
      });

      toast({
        title: "Candidate Added",
        description: `${candidateForm.name} has been added as a candidate.`
      });
      
      await fetchCandidates();
      setCandidateForm({ name: "", party: "", tagline: "" });
      setSelectedFile(null);
    } catch (error) {
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
      await writeContract(config, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'removeCandidate',
        args: [BigInt(id)],
      });
      toast({
        title: "Candidate Removed",
        description: "The candidate has been removed successfully."
      });
      await fetchCandidates();
    } catch (error) {
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
          <div className="space-y-2">
            {candidatesList.map((candidate) => (
              <div key={candidate.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <p className="font-semibold">{candidate.name}</p>
                  <p className="text-sm text-gray-600">{candidate.party}</p>
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
        </CardContent>
      </Card>
    </>
  );
};