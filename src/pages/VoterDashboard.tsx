import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAccount, useChainId } from "wagmi";
import { checkVoterStatus } from "@/utils/contractUtils";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { sepolia } from "wagmi/chains";

export const VoterDashboard = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const [isVerifiedVoter, setIsVerifiedVoter] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkVoterEligibility = async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first");
      setIsLoading(false);
      return;
    }

    if (chainId !== sepolia.id) {
      setError("Please switch to Sepolia network");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const isVerified = await checkVoterStatus(address);
      setIsVerifiedVoter(isVerified);
      
      if (!isVerified) {
        toast({
          variant: "destructive",
          title: "Not Verified",
          description: "You are not verified to vote. Please contact the admin.",
        });
      }
    } catch (err) {
      console.error("Failed to check voter status:", err);
      setError("Failed to check voter eligibility. Please try again later.");
      setIsVerifiedVoter(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      checkVoterEligibility();
    }
  }, [isConnected, address, chainId]);

  if (!isConnected) {
    return (
      <div className="container mx-auto p-4">
        <Card className="w-full max-w-2xl mx-auto">
          <CardContent className="p-6">
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription>
                Please connect your wallet to check your voting eligibility.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center text-purple-800 dark:text-purple-400 mb-8">
        Voter Dashboard
      </h1>
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Voter Eligibility Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Checking eligibility...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className={`p-6 rounded-lg border ${
                isVerifiedVoter 
                  ? "bg-green-50 border-green-200" 
                  : "bg-red-50 border-red-200"
              }`}>
                <div className="flex items-center justify-center gap-3">
                  {isVerifiedVoter ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <span className="text-lg font-medium text-green-700">
                        You are verified to vote
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-red-500" />
                      <span className="text-lg font-medium text-red-700">
                        Not Verified
                      </span>
                    </>
                  )}
                </div>
                
                {!isVerifiedVoter && (
                  <div className="mt-4 text-center text-red-600">
                    You are not verified to vote. Please contact the admin to get verified.
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={checkVoterEligibility}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};