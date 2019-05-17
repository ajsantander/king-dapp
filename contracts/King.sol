pragma solidity ^0.5.0;

contract King {

  address payable public king;
  uint256 public prize;
  uint256 public time;

  constructor() public payable {
    require(msg.value == 1 ether, "Contract must be deployed with a 1 ether prize");
    king = msg.sender;
    prize = 1 ether;
    time = now;
  }

  function play() public payable {
    require(time <= time + 2592000, "Allow to play only before one month since creation");
    require(msg.value > prize, "Deposit must be greater than current prize");
    prize = msg.value;
    king.transfer(prize);
    king = msg.sender;
  }

  function() external payable {
    play();
  }

  // TODO: Consider allowing king to withdraw all balance after 1 month.

  function kingExtract() public payable {
    // Check that 30days has passed.
    require(now >= time + 2592000);
    /* require(msg.sender = king); */
    king.transfer(prize);
  }

}
