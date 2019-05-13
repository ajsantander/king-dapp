pragma solidity ^0.5.0;

contract King {

  address payable public king;
  uint256 public prize;

  constructor() public payable {
    require(msg.value == 1 ether, "Contract must be deployed with a 1 ether prize");
    king = msg.sender;
    prize = 1 ether;
  }

  function play() public payable {
    require(msg.value > prize, "Deposit must be greater than current prize.");
    prize = msg.value;
    king.transfer(prize);
    king = msg.sender;
  }

  // TODO: Consider allowing king to withdraw all balance after 1 month.

  function() external payable {
    play();
  }
}
