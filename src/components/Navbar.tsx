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

  const fetchAdminAddress = async () => {
    try {
      const admin = await readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'admin',
      });

      setAdminAddress(admin as string);
    } catch (error) {
      console.error("Failed to fetch admin address:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch admin address from contract",
      });
    }
  };

  useEffect(() => {
    fetchAdminAddress();
  }, []);

  const handleConnect = async () => {
    try {
      if (chainId !== sepolia.id) {
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: "Please switch to Sepolia network to continue.",
        });
        return;
      }

      const connector = connectors[0];
      if (connector) {
        await connect({ connector });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
      });
    }
  };

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
      } else {
        navigate("/voter");
      }
    }
  }, [isConnected, address, chainId, navigate, adminAddress]);

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
              <Button 
                onClick={handleConnect}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};