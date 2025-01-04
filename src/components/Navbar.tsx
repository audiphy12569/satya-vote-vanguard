import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import { useNavigate } from "react-router-dom";
import { walletConnect } from "wagmi/connectors";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { sepolia } from "wagmi/chains";

const ADMIN_ADDRESS = "0x123..."; // Replace with your actual admin address

export const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      if (chain && chain.id !== sepolia.id) {
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: "Please switch to Sepolia network to continue.",
        });
        switchNetwork?.(sepolia.id);
        return;
      }

      await connect({ 
        connector: walletConnect({ 
          projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID 
        })
      });
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
    if (isConnected && address) {
      if (chain && chain.id !== sepolia.id) {
        toast({
          variant: "destructive",
          title: "Wrong Network",
          description: "Please switch to Sepolia network to continue.",
        });
        switchNetwork?.(sepolia.id);
        return;
      }

      // Check if connected address is admin
      if (address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
        navigate("/admin");
      } else {
        navigate("/voter");
      }
    }
  }, [isConnected, address, chain, navigate, switchNetwork]);

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
            {chain && chain.id !== sepolia.id && (
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