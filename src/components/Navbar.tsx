import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sepolia } from "wagmi/chains";
import { useChainId } from "wagmi";
import { readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/config/contract";

export const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [adminAddress, setAdminAddress] = useState<string | null>(null);
  const [isVerifiedVoter, setIsVerifiedVoter] = useState<boolean>(false);

  const fetchAdminAddress = async () => {
    try {
      const data = await readContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'admin',
        chainId: sepolia.id,
      });
      setAdminAddress(data as string);
    } catch (error) {
      console.error("Failed to fetch admin address:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch admin address from contract",
      });
    }
  };

  const checkVoterEligibility = async () => {
    if (!address) return;
    try {
      const isEligible = await readContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'voters',
        args: [address],
        chainId: sepolia.id,
      });
      setIsVerifiedVoter(Boolean(isEligible));
    } catch (error) {
      console.error("Failed to check voter eligibility:", error);
      setIsVerifiedVoter(false);
    }
  };

  useEffect(() => {
    if (chainId === sepolia.id) {
      fetchAdminAddress();
    }
  }, [chainId]);

  useEffect(() => {
    if (isConnected && address && chainId === sepolia.id) {
      checkVoterEligibility();
    }
  }, [isConnected, address, chainId]);

  useEffect(() => {
    if (isConnected && address && adminAddress) {
      if (chainId !== sepolia.id) {
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: "Please switch to Sepolia network to continue.",
        });
        return;
      }

      if (address.toLowerCase() === adminAddress.toLowerCase()) {
        navigate("/admin");
        toast({
          title: "Welcome Admin",
          description: "You have been redirected to the admin dashboard.",
        });
      } else {
        if (isVerifiedVoter) {
          navigate("/voter");
          toast({
            title: "Welcome Voter",
            description: "You have been verified as an eligible voter.",
          });
        } else {
          navigate("/");
          toast({
            variant: "destructive",
            title: "Not Verified",
            description: "You are not verified to vote. Please contact the admin.",
          });
        }
      }
    }
  }, [isConnected, address, chainId, navigate, adminAddress, isVerifiedVoter]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span 
              className="text-2xl font-bold text-purple-800 dark:text-purple-400 cursor-pointer" 
              onClick={() => navigate("/")}
            >
              Satya Vote
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {chainId !== sepolia.id && (
              <span className="text-sm text-red-500">
                Wrong Network
              </span>
            )}
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
                <Button
                  variant="outline"
                  onClick={() => {
                    disconnect();
                    navigate("/");
                  }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <w3m-button />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};