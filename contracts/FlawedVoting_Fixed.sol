pragma solidity >=0.5.1 <0.6.0;

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction underflow");
        return a - b;
    }
}

contract FlawedVoting_Fixed {
    using SafeMath for uint256;

    mapping (address => uint256) public remainingVotes;
    uint256[] public candidates;
    address payable public owner;
    bool public hasEnded = false;

    modifier notEnded() {
        require(!hasEnded, "Voting period has already concluded");
        _;
    }

    constructor(uint256 amountOfCandidates) public {
        candidates.length = amountOfCandidates;
        owner = msg.sender;
    }

    function buyVotes() public payable notEnded {
        require(msg.value >= 1 ether, "Minimum deposit is 1 ether");
        uint256 purchasedVotes = msg.value / 1e18;
        remainingVotes[msg.sender] = remainingVotes[msg.sender].add(purchasedVotes);
        uint256 refund = msg.value % 1e18;
        if (refund > 0) {
            msg.sender.transfer(refund);
        }
    }

    // 修复点：移除 0 - 1 导致的 uint256 下溢永真校验，改用前置数值比较与 SafeMath.sub
    function vote(uint256 _candidateID, uint256 _amountOfVotes) public notEnded {
        require(_candidateID < candidates.length, "Invalid candidate index");
        require(remainingVotes[msg.sender] >= _amountOfVotes, "Insufficient voting balance");
        remainingVotes[msg.sender] = remainingVotes[msg.sender].sub(_amountOfVotes);
        candidates[_candidateID] = candidates[_candidateID].add(_amountOfVotes);
    }

    // 修复点：严格遵循 Checks-Effects-Interactions 原则，先扣除票数映射再转账 Ether
    function payoutVotes(uint256 _amount) public notEnded {
        require(remainingVotes[msg.sender] >= _amount, "Insufficient votes to refund");
        remainingVotes[msg.sender] = remainingVotes[msg.sender].sub(_amount);
        msg.sender.transfer(_amount * 1e18);
    }

    function endVoting() public notEnded {
        require(msg.sender == owner, "Only owner can terminate voting");
        hasEnded = true;
        owner.transfer(address(this).balance);
    }

    function displayBalanceInEther() public view returns (uint256) {
        return address(this).balance / 1e18;
    }
}
