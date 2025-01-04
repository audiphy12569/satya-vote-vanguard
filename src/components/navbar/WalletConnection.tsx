import { Button } from "@/components/ui/button";
import { useAccount, useDisconnect } from "wagmi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!isConnected) {
    return <w3m-button />;
  }

  return (
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
        {t('common.disconnect')}
      </Button>
    </div>
  );
};