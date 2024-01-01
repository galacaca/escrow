// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Escrow {
	address public arbiter;
	address public beneficiary;
	address public depositor;

	bool public isApproved;
	uint256 public counter;

	struct HistoryList {
        address arbiter;
        address depositor;
	    address beneficiary;
        uint balance;
    }

	mapping(uint256 => HistoryList) public escrowHistory;

	constructor(address _arbiter, address _beneficiary) payable {
		arbiter = _arbiter;
		beneficiary = _beneficiary;
		depositor = msg.sender;
	}

	event Approved(uint);

	function approve() external {
		require(msg.sender == arbiter);
		uint balance = address(this).balance;
		(bool sent, ) = payable(beneficiary).call{value: balance}("");
 		require(sent, "Failed to send Ether");

		escrowHistory[counter].arbiter = arbiter;
        escrowHistory[counter].depositor = depositor;
        escrowHistory[counter].beneficiary = beneficiary;
        escrowHistory[counter].balance = balance;

		counter = counter + 1;
		emit Approved(balance);
		isApproved = true;


	}
}
