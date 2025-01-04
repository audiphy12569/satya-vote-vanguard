import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { checkVoterStatus } from "@/utils/contractUtils";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const VoterDashboard = () => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isVerifiedVoter, setIsVerifiedVoter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      checkVoterEligibility();
    }
  }, [address]);

  const checkVoterEligibility = async () => {
    try {
      setIsLoading(true);
      const isVerified = await checkVoterStatus(address as string);
      setIsVerifiedVoter(isVerified);
    } catch (error) {
      console.error("Failed to check voter status:", error);
      setIsVerifiedVoter(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check voter eligibility. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

              {isVerifiedVoter && (
                <div className="space-y-4">
                  <Alert className="bg-purple-50 border-purple-200">
                    <AlertDescription>
                      Welcome! You can participate in active elections.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center">
                    <Button 
                      onClick={checkVoterEligibility}
                      variant="outline"
                      className="mt-4"
                    >
                      Refresh Status
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};