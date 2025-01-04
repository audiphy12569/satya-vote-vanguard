import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { writeContract, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";
import { Loader2, Trash2 } from "lucide-react";
import axios from 'axios';

export const AdminDashboard = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [voterAddress, setVoterAddress] = useState("");
  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
    tagline: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [electionDuration, setElectionDuration] = useState("");
  const [isElectionActive, setIsElectionActive] = useState(false);
  const [votersList, setVotersList] = useState<string[]>([]);
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState({
    approveVoter: false,
    addCandidate: false,
    startElection: false,
    deleteCandidate: false
  });

  useEffect(() => {
    fetchElectionStatus();
    fetchVotersList();
    fetchCandidates();
  }, []);

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

  const fetchElectionStatus = async () => {
    try {
      const data = await readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getElectionStatus',
      });
      setIsElectionActive(data[0]);
    } catch (error) {
      console.error("Failed to fetch election status:", error);
    }
  };

  const fetchVotersList = async () => {
    try {
      const data = await readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getAllVoters',
      });
      setVotersList(data as string[]);
    } catch (error) {
      console.error("Failed to fetch voters list:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const count = await readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getCandidateCount',
      });

      const candidatesData = [];
      for (let i = 1; i <= Number(count); i++) {
        const candidate = await readContract({
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

  const handleApproveVoter = async () => {
    try {
      setIsLoading(prev => ({ ...prev, approveVoter: true }));
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'approveVoter',
        args: [voterAddress as `0x${string}`],
      });
      toast({
        title: "Voter Approved",
        description: `Address ${voterAddress} has been approved to vote.`
      });
      await fetchVotersList();
      setVoterAddress("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve voter."
      });
    } finally {
      setIsLoading(prev => ({ ...prev, approveVoter: false }));
    }
  };

  const handleAddCandidate = async () => {
    try {
      setIsLoading(prev => ({ ...prev, addCandidate: true }));
      if (!selectedFile) {
        throw new Error("Please select a logo file");
      }

      const ipfsHash = await uploadToIPFS(selectedFile);
      
      await writeContract({
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
      await writeContract({
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

  const handleStartElection = async () => {
    try {
      setIsLoading(prev => ({ ...prev, startElection: true }));
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'startElection',
        args: [BigInt(Number(electionDuration))],
      });
      toast({
        title: "Election Started",
        description: `Election has been started for ${electionDuration} minutes.`
      });
      setIsElectionActive(true);
      setElectionDuration("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start election."
      });
    } finally {
      setIsLoading(prev => ({ ...prev, startElection: false }));
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Admin Dashboard</h1>
      
      <Alert className={isElectionActive ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
        <AlertDescription>
          {isElectionActive ? "Election is currently active" : "Election is not active"}
        </AlertDescription>
      </Alert>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Voter Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Voter Address"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
            />
            <Button 
              onClick={handleApproveVoter} 
              className="w-full"
              disabled={isLoading.approveVoter}
            >
              {isLoading.approveVoter && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve Voter
            </Button>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Approved Voters</h3>
              <div className="max-h-40 overflow-y-auto">
                {votersList.map((voter, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {voter}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

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
            <CardTitle>Election Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isElectionActive ? (
              <>
                <Input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={electionDuration}
                  onChange={(e) => setElectionDuration(e.target.value)}
                />
                <Button 
                  onClick={handleStartElection} 
                  className="w-full"
                  disabled={isLoading.startElection}
                >
                  {isLoading.startElection && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Start Election
                </Button>
              </>
            ) : (
              <Alert>
                <AlertDescription>
                  Election is in progress. Wait for it to end or contact support to end it manually.
                </AlertDescription>
              </Alert>
            )}
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
      </div>
    </div>
  );
};