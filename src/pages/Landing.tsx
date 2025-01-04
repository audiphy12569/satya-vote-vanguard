import { useAccount } from "wagmi";

export const Landing = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-500 animate-fade-in">
        Satya Vote
      </h1>
      <p className="mt-6 text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl animate-fade-in delay-100">
        Secure, Transparent, and Decentralized Voting System
      </p>
      {!isConnected && (
        <p className="mt-8 text-gray-500 animate-fade-in delay-200">
          Please connect your wallet to continue
        </p>
      )}
    </div>
  );
};