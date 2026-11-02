pragma solidity ^0.5.1;
import './ERC20.sol';

contract XYZCoin is ERC20 {
    string public constant name = 'XYZCoin';
    string public constant symbol = 'XYZ';
    uint8 public constant decimals = 0;
    uint256 private _totalSupply = 1000;

    mapping (address => uint256) public balances;
    mapping (address => mapping (address => uint256)) public allowed;

    constructor() public {
        balances[msg.sender] = _totalSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address who) external view returns (uint256) {
        return balances[who];
    }

    function allowance(address owner, address spender) external view returns (uint256) {
        return allowed[owner][spender];
    }

    function transfer(address to, uint256 value) external returns (bool) {
        require(to != address(0), 'Cannot transfer to zero address');
        require(balances[msg.sender] >= value, 'Insufficient balance');
        balances[msg.sender] -= value;
        balances[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        require(spender != address(0), 'Cannot approve zero address');
        allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        require(to != address(0), 'Cannot transfer to zero address');
        require(balances[from] >= value, 'Insufficient balance');
        require(allowed[from][msg.sender] >= value, 'Allowance exceeded');
        balances[from] -= value;
        allowed[from][msg.sender] -= value;
        balances[to] += value;
        emit Transfer(from, to, value);
        return true;
    }
}
