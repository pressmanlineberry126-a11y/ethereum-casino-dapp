pragma solidity ^0.5.1;

contract HelloWorld {
    event Greeted(address indexed caller, string message);

    function greet() public returns (string memory) {
        emit Greeted(msg.sender, "Hello, world!");
        return "Hello, world!";
    }
}
