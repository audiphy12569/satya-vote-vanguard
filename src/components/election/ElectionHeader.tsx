import { CardHeader, CardTitle } from "@/components/ui/card";

interface ElectionHeaderProps {
  isLive: boolean;
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  isElectionOver: () => boolean;
}

export const ElectionHeader = ({ isLive, id, startTime, endTime, isElectionOver }: ElectionHeaderProps) => {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.getTime() > 0 ? date.toLocaleString() : "N/A";
  };

  return (
    <CardHeader>
      <CardTitle className="text-lg">
        {isLive ? (
          "Current Election Results"
        ) : (
          <>
            Election #{Number(id)} Results
            <span className="text-sm text-gray-500 block">
              Started: {formatDate(startTime)}
              <br />
              Ended: {formatDate(endTime)}
              {isElectionOver() && <span className="text-red-500 ml-2">(Ended)</span>}
            </span>
          </>
        )}
      </CardTitle>
    </CardHeader>
  );
};