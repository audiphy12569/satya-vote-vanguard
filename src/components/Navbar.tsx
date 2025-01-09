import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { sepolia } from "wagmi/chains";
import { useChainId } from "wagmi";
import { getAdminAddress, checkVoterStatus } from "@/utils/contractUtils";
import { useTranslation } from 'react-i18next';
import { WalletStatus } from "./navbar/WalletStatus";
import { AdminNav } from "./navbar/AdminNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [adminAddress, setAdminAddress] = useState<string | null>(null);
  const [isVerifiedVoter, setIsVerifiedVoter] = useState<boolean>(false);
  const { t, i18n } = useTranslation();

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
          title: t('common.wrongNetwork'),
          description: t('common.switchNetwork'),
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
              description: t('voter.status.eligible'),
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
  }, [isConnected, address, chainId, navigate, adminAddress, isVerifiedVoter, location.pathname, t]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
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
              <span className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                {t('nav.title')}
              </span>
            </div>
            
            {isConnected && adminAddress && address?.toLowerCase() === adminAddress.toLowerCase() && (
              <AdminNav />
            )}
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {t('common.language')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-900">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('hi')}>
                  हिंदी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <WalletStatus />
          </div>
        </div>
      </div>
    </nav>
  );
};