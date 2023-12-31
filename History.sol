// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract History {
	
	
    struct HistoryList {
        address arbiter;
        address depositor;
	    address beneficiary;
        uint balance;
    }

    mapping(address => HistoryList) public escrowHistory;

    function addEntry(address _arbiter, address _beneficiary, address _depositor, uint _balance) external {
        escrowHistory[msg.sender].arbiter = _arbiter;
        escrowHistory[msg.sender].depositor = _beneficiary;
        escrowHistory[msg.sender].beneficiary = _depositor;
        escrowHistory[msg.sender].balance = _balance;
    }

	

}