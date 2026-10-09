pragma solidity 0.4.22;

contract OraclizeI {
    address public cbAddress;
    function query(uint _timestamp, string _datasource, string _arg) external payable returns (bytes32 _id);
    function getPrice(string _datasource) public returns (uint _dschecksum);
}

contract OraclizeAddrResolverI {
    function getAddress() public returns (address _addr);
}

contract usingOraclize {
    OraclizeI oraclize;
    OraclizeAddrResolverI OAR;

    modifier oraclizeAPI {
        if ((address(OAR) == 0) || (OAR.getAddress() == 0))
            oraclize = OraclizeI(0x51efaf4c8b3c9afbd5aB9F4bbC82784Ab6ef8fAA);
        else oraclize = OraclizeI(OAR.getAddress());
        _;
    }

    function oraclize_query(string datasource, string arg) internal oraclizeAPI returns (bytes32 id) {
        uint price = oraclize.getPrice(datasource);
        if (price > 1 ether + tx.gasprice * 200000) return 0;
        return oraclize.query.value(price)(0, datasource, arg);
    }

    function oraclize_cbAddress() internal view returns (address) {
        return msg.sender;
    }

    function parseInt(string _a) internal pure returns (uint) {
        bytes memory bresult = bytes(_a);
        uint mint = 0;
        for (uint i = 0; i < bresult.length; i++) {
            if ((bresult[i] >= 48) && (bresult[i] <= 57)) {
                mint *= 10;
                mint += uint(bresult[i]) - 48;
            }
        }
        return mint;
    }

    function __callback(bytes32 myid, string result) public {
        myid; result;
    }
}