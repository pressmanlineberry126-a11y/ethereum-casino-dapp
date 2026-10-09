pragma solidity 0.4.22;

import "./oraclizeAPI_0.4.sol";

contract Casino is usingOraclize {
    address public owner;
    uint public minimumBet = 100 finney; // 0.1 ether
    uint public totalBet;
    uint public numberOfBets;
    uint public maxAmountOfBets = 10;
    address[] public players;

    struct Player {
        uint amountBet;
        uint numberSelected;
    }

    mapping(address => Player) public playerInfo;

    function Casino(uint _minimumBet, uint _maxAmountOfBets) public {
        owner = msg.sender;
        if (_minimumBet != 0) minimumBet = _minimumBet;
        if (_maxAmountOfBets != 0) maxAmountOfBets = _maxAmountOfBets;
    }

    function checkPlayerExists(address player) public constant returns(bool) {
        for (uint i = 0; i < players.length; i++) {
            if (players[i] == player) return true;
        }
        return false;
    }

    function bet(uint numberSelected) public payable {
        require(!checkPlayerExists(msg.sender));
        require(numberSelected >= 1 && numberSelected <= 10);
        require(msg.value >= minimumBet);

        playerInfo[msg.sender].amountBet = msg.value;
        playerInfo[msg.sender].numberSelected = numberSelected;
        numberOfBets++;
        players.push(msg.sender);
        totalBet += msg.value;

        if (numberOfBets >= maxAmountOfBets) generateNumberWinner();
    }

    function generateNumberWinner() internal {
        bytes32 queryId = bytes32(block.number);
        oraclize_query("WolframAlpha", "random number between 1 and 10");
    }

    function __callback(bytes32 myid, string result) public {
        require(msg.sender == oraclize_cbAddress());
        distributePrizes(parseInt(result));
    }

    function distributePrizes(uint numberWinner) internal {
        address[100] memory winners;
        uint count = 0;

        for (uint i = 0; i < players.length; i++) {
            address playerAddress = players[i];
            if (playerInfo[playerAddress].numberSelected == numberWinner) {
                winners[count] = playerAddress;
                count++;
            }
            delete playerInfo[playerAddress];
        }

        players.length = 0;
        uint winnerEtherAmount = totalBet / (count > 0 ? count : 1);

        for (uint j = 0; j < count; j++) {
            if (winners[j] != address(0)) winners[j].transfer(winnerEtherAmount);
        }

        totalBet = 0;
        numberOfBets = 0;
    }
}