import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sepolia } from "wagmi/chains";
import { useChainId } from "wagmi";
import { getAdminAddress, checkVoterStatus } from "@/utils/contractUtils";
import { Users, UserPlus, Vote } from "lucide-react";

export const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminAddress, setAdminAddress] = useState<string | null>(null);
  const [isVerifiedVoter, setIsVerifiedVoter] = useState<boolean>(false);

  const fetchAdminAddress = async () => {
    try {
      const data = await getAdminAddress();
      setAdminAddress(data);
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
      const isEligible = await checkVoterStatus(address);
      setIsVerifiedVoter(isEligible);
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

      const isAdmin = address.toLowerCase() === adminAddress.toLowerCase();
      const currentPath = location.pathname;
      
      if (isAdmin) {
        if (!currentPath.startsWith('/admin')) {
          navigate("/admin");
          toast({
            title: "Welcome Admin",
            description: "You have been redirected to the admin dashboard.",
          });
        }
      } else {
        if (isVerifiedVoter) {
          if (currentPath !== '/voter') {
            navigate("/voter");
            toast({
              title: "Welcome Voter",
              description: "You have been verified as an eligible voter.",
            });
          }
        } else {
          if (currentPath !== '/') {
            navigate("/");
            toast({
              variant: "destructive",
              title: "Not Verified",
              description: "You are not verified to vote. Please contact the admin.",
            });
          }
        }
      }
    }
  }, [isConnected, address, chainId, navigate, adminAddress, isVerifiedVoter, location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    if (address?.toLowerCase() === adminAddress?.toLowerCase()) {
      navigate(path);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg animate-fade-in border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => navigate("/")}
            >
              <img 
                src="/logo.png" 
                alt="Satya Vote Logo" 
                className="h-8 w-8 mr-2"
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Satya Vote
              </span>
            </div>
            
            {isConnected && adminAddress && address?.toLowerCase() === adminAddress.toLowerCase() && (
              <div className="ml-8 hidden md:flex space-x-4">
                <button 
                  onClick={() => handleNavigation("/admin/voters")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActive("/admin/voters") 
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                >
                  <Users className="w-4 h-4" />
                  <span>Voters</span>
                </button>
                <button 
                  onClick={() => handleNavigation("/admin/candidates")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActive("/admin/candidates") 
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Candidates</span>
                </button>
                <button 
                  onClick={() => handleNavigation("/admin/election")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActive("/admin/election") 
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                >
                  <Vote className="w-4 h-4" />
                  <span>Election</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {chainId !== sepolia.id && (
              <span className="text-sm text-red-500 animate-pulse">
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
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700"
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