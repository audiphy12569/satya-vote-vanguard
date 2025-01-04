import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAccount } from "wagmi";

export const VoterDashboard = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [candidates, setCandidates] = useState([]); // Will be populated from contract

  const handleVote = async () => {
    if (!selectedCandidate) return;
    try {
      // Contract interaction will be implemented here
      toast({
        title: "Vote Cast",
        description: "Your vote has been recorded successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cast vote."
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400">Voter Dashboard</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate: any) => (
          <Card key={candidate.id} className={`cursor-pointer transition-all ${
            selectedCandidate === candidate.id ? 'ring-2 ring-purple-500' : ''
          }`} onClick={() => setSelectedCandidate(candidate.id)}>
            <CardHeader>
              <CardTitle>{candidate.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">{candidate.party}</p>
              <p className="text-sm mt-2">{candidate.tagline}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCandidate && (
        <div className="flex justify-center mt-6">
          <Button onClick={handleVote} className="px-8">
            Cast Vote
          </Button>
        </div>
      )}
    </div>
  );
};