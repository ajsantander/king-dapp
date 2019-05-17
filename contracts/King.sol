pragma solidity ^0.5.0;

contract King {

  address payable public king;
  uint256 public prize;
  uint256 public gameStartTime;
  uint256 public constant GAME_DURATION = 2592000;

  constructor() public payable {
    require(msg.value == 1 ether, "Contract must be deployed with a 1 ether prize");
    king = msg.sender;
    prize = 1 ether;
    gameStartTime = now;
  }

  function play() public payable {
    require(!gameIsOver(), "Allow to play only before one month since creation");
    require(msg.value > prize, "Deposit must be greater than current prize");
    prize = msg.value;
    king.transfer(prize);
    king = msg.sender;
  }

  function() external payable {
    play();
  }

  // TODO: Consider allowing king to withdraw all balance after 1 month.

  function kingExtract() public {
    require(gameIsOver(), "Cannot extract until game is over");
    king.transfer(address(this).balance);
    // selfdestruct(king); // Too dangerous!
  }

  function gameIsOver() internal returns(bool) {
    return now > gameStartTime + GAME_DURATION;
  }
}
