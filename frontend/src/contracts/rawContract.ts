// factory
// SPDX-License-Identifier: GPL-3.0
// pragma solidity >=0.8.20 <0.9.0;

// import "./DAOShip.sol";

// contract DAOFactory {
//     struct DAOInfo {
//         address dao;
//         address creator;
//         string projectName;
//         uint256 createdAt;
//     }
    
//     mapping(uint256 => DAOInfo) public daos;
//     mapping(string => bool) public repoExists;
//     uint256 public daoCount;
    
//     event DAODeployed(uint256 daoId, address dao, address creator);

//     function createDAO(
//         string memory projectName,
//         string memory githubRepo,
//         string memory tokenName,
//         string memory tokenSymbol,
//         uint256 initialSupply
//     ) external returns (uint256, address) {
//         require(!repoExists[githubRepo] && initialSupply >= 1000e18, "not enough balance");
        
//         DAOShip newDAO = new DAOShip(projectName, githubRepo, tokenName, tokenSymbol, initialSupply);
//         newDAO.transferOwnership(msg.sender);
        
//         daoCount++;
//         daos[daoCount] = DAOInfo(address(newDAO), msg.sender, projectName, block.timestamp);
//         repoExists[githubRepo] = true;
        
//         emit DAODeployed(daoCount, address(newDAO), msg.sender);
//         return (daoCount, address(newDAO));
//     }
    
//     function getDAO(uint256 daoId) external view returns (DAOInfo memory) {
//         return daos[daoId];
//     }
// }


// DAOShip

// SPDX-License-Identifier: GPL-3.0
// pragma solidity >=0.8.20 <0.9.0;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "./GovernanceToken.sol";
// contract DAOShip is Ownable, ReentrancyGuard {
    
//     struct Member {
//         string githubUsername;
//         uint96 reputation;
//         bool isActive;
//     }

//     struct Proposal {
//         address proposer;
//         uint64 stakingDeadline;
//         uint64 votingDeadline;
//         uint128 fundingAmount;
//         uint128 totalStaked;
//         uint128 forVotes;
//         uint128 againstVotes;
//         uint8 status; // 0=STAKING, 1=VOTING, 2=APPROVED, 3=REJECTED, 4=COMPLETED, 5=FAILED
//         bool executed;
//     }

//     GovernanceToken public immutable token;
//     string public projectName;
//     string public githubRepo;
//     uint256 public treasuryBalance;
//     uint256 public totalMembers;
//     uint256 public proposalCount;
    
//     mapping(address => Member) public members;
//     mapping(uint256 => Proposal) public proposals;
//     mapping(uint256 => mapping(address => uint256)) public stakes;
//     mapping(uint256 => mapping(address => bool)) public hasVoted;
//     mapping(uint256 => address[]) public proposalStakers;
//     mapping(uint256 => string) public proposalTitles;
    
//     address[] public memberList;

//     uint256 constant MIN_STAKE = 10e18;
//     uint256 constant STAKING_PERIOD = 3 days;
//     uint256 constant VOTING_PERIOD = 7 days;

//     event DAOCreated(string projectName, address token);
//     event MemberAdded(address member, string githubUsername);
//     event ProposalCreated(uint256 proposalId, string title, address proposer);
//     event TokensStaked(uint256 proposalId, address staker, uint256 amount);
//     event VoteCasted(uint256 proposalId, address voter, bool support);
//     event ProposalExecuted(uint256 proposalId, bool approved);
//     event TokensDistributed(address member, uint256 amount);

//     constructor(
//         string memory _projectName,
//         string memory _githubRepo,
//         string memory _tokenName,
//         string memory _tokenSymbol,
//         uint256 _initialSupply
//     ) Ownable(msg.sender) {
//         projectName = _projectName;
//         githubRepo = _githubRepo;
//         token = new GovernanceToken(_tokenName, _tokenSymbol, _initialSupply, address(this));
//         treasuryBalance = (_initialSupply * 20) / 100;
//         _addMember(msg.sender, "creator");
//         emit DAOCreated(_projectName, address(token));
//     }

//     // ========== MEMBER & TOKEN MANAGEMENT ==========
//     function addMembers(address[] memory addresses, string[] memory githubUsernames) external onlyOwner {
//         require(addresses.length == githubUsernames.length);
//         for(uint i = 0; i < addresses.length; i++) {
//             _addMember(addresses[i], githubUsernames[i]);
//         }
//     }

//     function distributeTokens(address[] memory recipients, uint256[] memory amounts) external onlyOwner {
//         require(recipients.length == amounts.length);
//         for(uint i = 0; i < recipients.length; i++) {
//             require(members[recipients[i]].isActive);
//             token.transfer(recipients[i], amounts[i]);
//             emit TokensDistributed(recipients[i], amounts[i]);
//         }
//     }

//     function _addMember(address memberAddress, string memory githubUsername) internal {
//         if (!members[memberAddress].isActive) {
//             members[memberAddress] = Member(githubUsername, 100, true);
//             memberList.push(memberAddress);
//             totalMembers++;
//             emit MemberAdded(memberAddress, githubUsername);
//         }
//     }

//     // ========== PROPOSAL LIFECYCLE ==========
//     function createProposal(string memory title, uint256 fundingAmount) external returns (uint256) {
//         require(members[msg.sender].isActive);
//         require(fundingAmount <= treasuryBalance);
        
//         proposalCount++;
//         uint256 id = proposalCount;
        
//         proposals[id] = Proposal({
//             proposer: msg.sender,
//             stakingDeadline: uint64(block.timestamp + STAKING_PERIOD),
//             votingDeadline: uint64(block.timestamp + STAKING_PERIOD + VOTING_PERIOD),
//             fundingAmount: uint128(fundingAmount),
//             totalStaked: 0,
//             forVotes: 0,
//             againstVotes: 0,
//             status: 0,
//             executed: false
//         });
        
//         proposalTitles[id] = title;
//         emit ProposalCreated(id, title, msg.sender);
//         return id;
//     }

//     function stakeAndVote(uint256 proposalId, uint256 stakeAmount, bool voteSupport) external nonReentrant {
//         require(members[msg.sender].isActive);
//         Proposal storage p = proposals[proposalId];
        
//         // Handle staking if in staking period
//         if (block.timestamp <= p.stakingDeadline && stakeAmount > 0) {
//             require(stakeAmount >= MIN_STAKE);
//             token.transferFrom(msg.sender, address(this), stakeAmount);
            
//             if (stakes[proposalId][msg.sender] == 0) {
//                 proposalStakers[proposalId].push(msg.sender);
//             }
//             stakes[proposalId][msg.sender] += stakeAmount;
//             p.totalStaked += uint128(stakeAmount);
//             emit TokensStaked(proposalId, msg.sender, stakeAmount);
//         }
        
//         // Handle voting if in voting period
//         if (block.timestamp > p.stakingDeadline && block.timestamp <= p.votingDeadline && !hasVoted[proposalId][msg.sender]) {
//             if (p.status == 0) p.status = 1; // Update to VOTING
            
//             hasVoted[proposalId][msg.sender] = true;
//             uint256 votingPower = token.getVotes(msg.sender);
            
//             if (voteSupport) {
//                 p.forVotes += uint128(votingPower);
//             } else {
//                 p.againstVotes += uint128(votingPower);
//             }
//             emit VoteCasted(proposalId, msg.sender, voteSupport);
//         }
//     }

//     function executeProposal(uint256 proposalId) external {
//         require(proposalId <= proposalCount);
//         Proposal storage p = proposals[proposalId];
//         require(block.timestamp > p.votingDeadline && !p.executed);
        
//         p.executed = true;
//         bool approved = p.forVotes > p.againstVotes;
        
//         if (approved) {
//             p.status = 2; // APPROVED
//             if (p.fundingAmount > 0) {
//                 treasuryBalance -= p.fundingAmount;
//                 token.transfer(p.proposer, p.fundingAmount);
//             }
//             _distributeRewards(proposalId, true);
//         } else {
//             p.status = 3; // REJECTED
//             _distributeRewards(proposalId, false);
//         }
        
//         emit ProposalExecuted(proposalId, approved);
//     }

//     function _distributeRewards(uint256 proposalId, bool success) internal {
//         Proposal storage p = proposals[proposalId];
//         if (p.totalStaked == 0) return;
        
//         address[] memory stakers = proposalStakers[proposalId];
//         uint256 bonusPool = success ? (p.fundingAmount * 5) / 100 : 0;
//         uint256 penaltyRate = success ? 0 : 5;
        
//         for (uint i = 0; i < stakers.length; i++) {
//             address staker = stakers[i];
//             uint256 staked = stakes[proposalId][staker];
            
//             if (staked > 0) {
//                 uint256 bonus = success ? (bonusPool * staked) / p.totalStaked : 0;
//                 uint256 penalty = success ? 0 : (staked * penaltyRate) / 100;
//                 uint256 returnAmount = staked + bonus - penalty;
                
//                 token.transfer(staker, returnAmount);
//                 treasuryBalance += penalty;
                
//                 // Update reputation
//                 if (success) {
//                     members[staker].reputation += 10;
//                 } else if (members[staker].reputation > 5) {
//                     members[staker].reputation -= 5;
//                 }
                
//                 stakes[proposalId][staker] = 0;
//             }
//         }
//     }

//     // ========== VIEW FUNCTIONS ==========
//     function getProposal(uint256 proposalId) external view returns (
//         address proposer, string memory title, uint256 fundingAmount, 
//         uint256 totalStaked, uint256 forVotes, uint256 againstVotes, 
//         uint8 status, bool executed
//     ) {
//         Proposal memory p = proposals[proposalId];
//         return (p.proposer, proposalTitles[proposalId], p.fundingAmount, 
//                 p.totalStaked, p.forVotes, p.againstVotes, p.status, p.executed);
//     }

//     function getMember(address addr) external view returns (string memory, uint96, bool) {
//         Member memory m = members[addr];
//         return (m.githubUsername, m.reputation, m.isActive);
//     }

//     function getStats() external view returns (uint256, uint256, uint256, uint256) {
//         return (totalMembers, proposalCount, treasuryBalance, token.totalSupply());
//     }

//     // ========== ADMIN ==========
//     function emergencyWithdraw() external onlyOwner {
//         token.transfer(owner(), token.balanceOf(address(this)));
//     }
// }



// token 

// SPDX-License-Identifier: GPL-3.0
// pragma solidity >=0.8.20 <0.9.0;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

// contract GovernanceToken is ERC20, ERC20Votes, Ownable {
//     constructor(string memory name, string memory symbol, uint256 initialSupply, address dao) 
//         ERC20(name, symbol)
//         EIP712(name, "1")
//         Ownable(dao) {
//             _mint(dao, initialSupply);
//     }

//     function mint(address to, uint256 amount) external onlyOwner {
//         _mint(to, amount);
//     }

//     function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
//         super._update(from, to, value);
//     }
// }