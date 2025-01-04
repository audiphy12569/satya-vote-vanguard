import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

interface VoterEligibilityStatusProps {
  isLoading: boolean;
  error: string | null;
  isVerifiedVoter: boolean;
  onRefresh: () => void;
}

export const VoterEligibilityStatus = ({
  isLoading,
  error,
  isVerifiedVoter,
  onRefresh,
}: VoterEligibilityStatusProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Voter Eligibility Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Checking eligibility...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div
              className={`p-6 rounded-lg border transition-all duration-300 ${
                isVerifiedVoter
                  ? "bg-green-50 border-green-200 hover:bg-green-100"
                  : "bg-red-50 border-red-200 hover:bg-red-100"
              }`}
            >
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
                  You are not verified to vote. Please contact the admin to get
                  verified.
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={onRefresh} 
                variant="outline" 
                className="gap-2 btn-hover"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Status
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};