// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    // Reentrancy guard
    bool private locked;
    modifier noReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    struct Candidate {
        uint96 id; // Reduced from uint256 to uint96 since we won't have that many candidates
        uint96 voteCount; // Reduced from uint256
        bool isActive;
        string name;
        string party;
        string tagline;
        string logoIPFS;
    }

    struct ElectionResult {
        uint96 candidateId;
        uint96 voteCount;
        string candidateName;
        string party;
    }

    struct ElectionHistory {
        uint96 id;
        uint96 totalVotes;
        uint128 startTime;
        uint128 endTime;
        ElectionResult[] results;
    }

    struct Election {
        uint96 id;
        uint96 totalVotes;
        uint128 startTime;
        uint128 endTime;
        bool isActive;
        mapping(address => bool) hasVoted;
    }

    address public immutable admin;
    mapping(address => bool) public approvedVoters;
    address[] public voterList;
    mapping(uint256 => Candidate) public candidates;
    uint96 public candidateCount;
    uint96 public currentElectionId;
    mapping(uint256 => Election) public elections;
    mapping(uint256 => ElectionHistory) public electionHistories;
    uint96 public totalElections;

    event VoterApproved(address indexed voter);
    event VoterRemoved(address indexed voter);
    event AllVotersRemoved();
    event CandidateAdded(uint256 indexed id, string name, string party);
    event CandidateRemoved(uint256 indexed id);
    event ElectionStarted(uint256 indexed electionId, uint256 startTime, uint256 endTime);
    event ElectionEnded(uint256 indexed electionId, uint256 endTime, uint256 totalVotes);
    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 indexed electionId);

    // Custom Errors
    error OnlyAdmin();
    error OnlyApprovedVoter();
    error ElectionNotActive();
    error ElectionHasEnded();
    error AlreadyVoted();
    error InvalidCandidate();
    error MinimumCandidatesRequired();
    error ElectionAlreadyActive();
    error InvalidDuration();
    error PreviousElectionNotEnded();
    error VoterNotFound();
    error VoterAlreadyApproved();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert OnlyAdmin();
        _;
    }

    modifier onlyApprovedVoter() {
        if (!approvedVoters[msg.sender]) revert OnlyApprovedVoter();
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function approveVoter(address _voter) external onlyAdmin noReentrant {
        if (approvedVoters[_voter]) revert VoterAlreadyApproved();
        approvedVoters[_voter] = true;
        voterList.push(_voter);
        emit VoterApproved(_voter);
    }

    function removeAllVoters() external onlyAdmin noReentrant {
        uint256 length = voterList.length; // Cache array length
        for (uint256 i; i < length;) {
            approvedVoters[voterList[i]] = false;
            unchecked { ++i; }
        }
        delete voterList;
        emit AllVotersRemoved();
    }

    function addCandidate(
        string calldata _name,
        string calldata _party,
        string calldata _tagline,
        string calldata _logoIPFS
    ) external onlyAdmin noReentrant {
        unchecked {
            ++candidateCount;
        }
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name,
            party: _party,
            tagline: _tagline,
            logoIPFS: _logoIPFS,
            voteCount: 0,
            isActive: true
        });
        emit CandidateAdded(candidateCount, _name, _party);
    }

    function removeCandidate(uint256 _id) external onlyAdmin noReentrant {
        if (_id == 0 || _id > candidateCount) revert InvalidCandidate();
        if (!candidates[_id].isActive) revert InvalidCandidate();
        candidates[_id].isActive = false;
        emit CandidateRemoved(_id);
    }

    function startElection(uint256 _durationInMinutes) external onlyAdmin noReentrant {
        if (_durationInMinutes == 0) revert InvalidDuration();
        if (getActiveCandidateCount() < 2) revert MinimumCandidatesRequired();
        
        // Check and end previous election if exists
        if (currentElectionId > 0) {
            Election storage currentElection = elections[currentElectionId];
            if (currentElection.isActive) {
                if (block.timestamp <= currentElection.endTime) {
                    revert ElectionAlreadyActive();
                }
                _endElection(currentElectionId);
            }
        }
        
        // Reset all candidate vote counts
        for (uint256 i = 1; i <= candidateCount;) {
            if (candidates[i].isActive) {
                candidates[i].voteCount = 0;
            }
            unchecked { ++i; }
        }
        
        unchecked {
            ++currentElectionId;
            ++totalElections;
        }
        
        uint128 startTime = uint128(block.timestamp);
        uint128 endTime = uint128(startTime + (_durationInMinutes * 1 minutes));
        
        Election storage newElection = elections[currentElectionId];
        newElection.id = currentElectionId;
        newElection.startTime = startTime;
        newElection.endTime = endTime;
        newElection.isActive = true;
        newElection.totalVotes = 0;
        
        emit ElectionStarted(currentElectionId, startTime, endTime);
    }

    function _endElection(uint256 _electionId) private {
        Election storage election = elections[_electionId];
        ElectionHistory storage history = electionHistories[_electionId];
        
        history.id = uint96(_electionId);
        history.startTime = election.startTime;
        history.endTime = election.endTime;
        history.totalVotes = election.totalVotes;
        
        // Store results for each active candidate
        for (uint256 i = 1; i <= candidateCount;) {
            if (candidates[i].isActive) {
                history.results.push(ElectionResult({
                    candidateId: uint96(i),
                    candidateName: candidates[i].name,
                    party: candidates[i].party,
                    voteCount: candidates[i].voteCount
                }));
            }
            unchecked { ++i; }
        }
        
        election.isActive = false;
        emit ElectionEnded(_electionId, election.endTime, election.totalVotes);
    }

    function vote(uint256 _candidateId) external onlyApprovedVoter noReentrant {
        Election storage election = elections[currentElectionId];
        
        // Check if election has ended based on time
        if (block.timestamp > election.endTime && election.isActive) {
            _endElection(currentElectionId);
            revert ElectionHasEnded();
        }
        
        if (!election.isActive) revert ElectionNotActive();
        if (election.hasVoted[msg.sender]) revert AlreadyVoted();
        if (_candidateId == 0 || _candidateId > candidateCount) revert InvalidCandidate();
        if (!candidates[_candidateId].isActive) revert InvalidCandidate();

        election.hasVoted[msg.sender] = true;
        unchecked {
            ++candidates[_candidateId].voteCount;
            ++election.totalVotes;
        }
        
        emit VoteCast(msg.sender, _candidateId, currentElectionId);
    }

    function getActiveCandidateCount() public view returns (uint256 count) {
        for (uint256 i = 1; i <= candidateCount;) {
            if (candidates[i].isActive) {
                unchecked {
                    ++count;
                }
            }
            unchecked { ++i; }
        }
    }

    function getCandidateCount() external view returns (uint256) {
        return candidateCount;
    }

    function getCandidate(uint256 _id) external view returns (
        string memory name,
        string memory party,
        string memory tagline,
        string memory logoIPFS,
        uint256 voteCount
    ) {
        if (_id == 0 || _id > candidateCount) revert InvalidCandidate();
        Candidate memory candidate = candidates[_id];
        return (
            candidate.name,
            candidate.party,
            candidate.tagline,
            candidate.logoIPFS,
            candidate.voteCount
        );
    }

    function getElectionStatus() external view returns (
        bool isActive,
        uint256 startTime,
        uint256 endTime,
        uint256 totalVotes
    ) {
        Election storage election = elections[currentElectionId];
        bool isCurrentlyActive = election.isActive;
        
        // Check if election has ended based on time
        if (isCurrentlyActive && block.timestamp > election.endTime) {
            isCurrentlyActive = false;
        }
        
        return (
            isCurrentlyActive,
            election.startTime,
            election.endTime,
            election.totalVotes
        );
    }

    function getElectionHistory(uint256 _electionId) external view returns (
        uint256 id,
        uint256 startTime,
        uint256 endTime,
        uint256 totalVotes,
        ElectionResult[] memory results
    ) {
        ElectionHistory storage history = electionHistories[_electionId];
        return (
            history.id,
            history.startTime,
            history.endTime,
            history.totalVotes,
            history.results
        );
    }

    function getAllVoters() external view returns (address[] memory) {
        return voterList;
    }

    function hasVoted(address _voter) external view returns (bool) {
        return elections[currentElectionId].hasVoted[_voter];
    }

    function getTotalElections() external view returns (uint256) {
        return totalElections;
    }
}
