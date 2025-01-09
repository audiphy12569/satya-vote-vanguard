import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { sepolia } from "wagmi/chains";
import { useChainId } from "wagmi";

export const WalletStatus = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      {chainId !== sepolia.id && (
        <span className="text-xs md:text-sm text-red-500 animate-pulse">
          {t('common.wrongNetwork')}
        </span>
      )}

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
  );
};