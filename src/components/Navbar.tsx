import { useAccount } from "wagmi";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sepolia } from "wagmi/chains";
import { useChainId } from "wagmi";
import { getAdminAddress, checkVoterStatus } from "@/utils/contractUtils";
import { LanguageSwitcher } from "./navbar/LanguageSwitcher";
import { WalletConnection } from "./navbar/WalletConnection";
import { AdminNavigation } from "./navbar/AdminNavigation";
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminAddress, setAdminAddress] = useState<string | null>(null);
  const [isVerifiedVoter, setIsVerifiedVoter] = useState<boolean>(false);
  const { t } = useTranslation();

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
            title: t('common.welcome.admin'),
            description: t('admin.redirected'),
          });
        }
      } else {
        if (isVerifiedVoter) {
          if (currentPath !== '/voter') {
            navigate("/voter");
            toast({
              title: t('common.welcome.voter'),
              description: t('voter.status.verified'),
            });
          }
        } else {
          if (currentPath !== '/') {
            navigate("/");
            toast({
              variant: "destructive",
              title: t('voter.status.notVerified'),
              description: t('voter.status.contactAdmin'),
            });
          }
        }
      }
    }
  }, [isConnected, address, chainId, navigate, adminAddress, isVerifiedVoter, location.pathname]);

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
              <AdminNavigation onNavigate={handleNavigation} />
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {chainId !== sepolia.id && (
              <span className="text-sm text-red-500 animate-pulse">
                {t('common.wrongNetwork')}
              </span>
            )}

            <LanguageSwitcher />
            <WalletConnection />
          </div>
        </div>
      </div>
    </nav>
  );
};
