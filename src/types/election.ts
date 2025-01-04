export interface ElectionResult {
  candidateId: bigint;
  candidateName: string;
  party: string;
  voteCount: bigint;
}

export interface ElectionHistory {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  totalVotes: bigint;
  results: ElectionResult[];
}