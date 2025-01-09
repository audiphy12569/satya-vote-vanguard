import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sepolia } from "wagmi/chains";
import { useChainId } from "wagmi";
import { getAdminAddress, checkVoterStatus } from "@/utils/contractUtils";
import { Users, UserPlus, Vote, Menu } from "lucide-react";
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    if (address?.toLowerCase() === adminAddress?.toLowerCase()) {
      navigate(path);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg animate-fade-in border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
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
              <>
                {/* Desktop Navigation */}
                <div className="ml-8 hidden md:flex space-x-4">
                  <button 
                    onClick={() => handleNavigation("/admin/voters")}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                      ${isActive("/admin/voters") 
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{t('nav.voters')}</span>
                  </button>
                  <button 
                    onClick={() => handleNavigation("/admin/candidates")}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                      ${isActive("/admin/candidates") 
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('nav.candidates')}</span>
                  </button>
                  <button 
                    onClick={() => handleNavigation("/admin/election")}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                      ${isActive("/admin/election") 
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                  >
                    <Vote className="w-4 h-4" />
                    <span>{t('nav.election')}</span>
                  </button>
                </div>

                {/* Mobile Navigation */}
                <div className="ml-4 md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[240px] sm:w-[280px]">
                      <div className="flex flex-col space-y-4 mt-6">
                        <button 
                          onClick={() => {
                            handleNavigation("/admin/voters");
                          }}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                            ${isActive("/admin/voters") 
                              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                        >
                          <Users className="w-4 h-4" />
                          <span>{t('nav.voters')}</span>
                        </button>
                        <button 
                          onClick={() => {
                            handleNavigation("/admin/candidates");
                          }}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                            ${isActive("/admin/candidates") 
                              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>{t('nav.candidates')}</span>
                        </button>
                        <button 
                          onClick={() => {
                            handleNavigation("/admin/election");
                          }}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                            ${isActive("/admin/election") 
                              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"}`}
                        >
                          <Vote className="w-4 h-4" />
                          <span>{t('nav.election')}</span>
                        </button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {chainId !== sepolia.id && (
              <span className="text-xs md:text-sm text-red-500 animate-pulse">
                {t('common.wrongNetwork')}
              </span>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {t('common.language')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('hi')}>
                  हिंदी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isConnected ? (
              <div className="flex flex-col md:flex-row items-center gap-2">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 truncate max-w-[100px] md:max-w-[150px]">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => {
                    disconnect();
                    navigate("/");
                  }}
                >
                  {t('common.disconnect')}
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
