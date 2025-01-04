import { Button } from "@/components/ui/button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import { injected } from "wagmi/connectors";

export const Navbar = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-purple-800 dark:text-purple-400 cursor-pointer" onClick={() => navigate("/")}>
              Satya Vote
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected && (
              <div className="hidden md:flex space-x-4">
                <Button variant="ghost" onClick={() => navigate("/admin")}>
                  Admin
                </Button>
                <Button variant="ghost" onClick={() => navigate("/voter")}>
                  Vote
                </Button>
                <Button variant="ghost" onClick={() => navigate("/history")}>
                  History
                </Button>
              </div>
            )}
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </span>
                <Button
                  variant="outline"
                  onClick={() => disconnect()}
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