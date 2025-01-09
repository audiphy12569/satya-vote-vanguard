export interface ElectionResult {
  candidateId: bigint;
  candidateName: string;
  party: string;
  voteCount: bigint;
  logoIPFS?: string;
}

export interface ElectionHistory {
  id: bigint;
  startTime: bigint;
  endTime: bigint;
  totalVotes: bigint;
  results: ElectionResult[];
}

export interface Candidate {
  id: number;
  name: string;
  party: string;
  tagline: string;
  logoIPFS: string;
  voteCount: bigint;
  isActive: boolean;
}

export interface ElectionStatus {
  isActive: boolean;
  startTime: bigint;
  endTime: bigint;
  totalVotes: bigint;
}