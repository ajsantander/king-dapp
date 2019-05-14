const King = artifacts.require("./King.sol");
const { shouldFail } = require("openzeppelin-test-helpers");
require('chai/register-should');

contract("King", (accounts) => {

  let contract;

  beforeEach(async () => {
    contract = await King.new({
      from: accounts[0],
      value: web3.utils.toWei("1", "ether")
    });
  });

  it('Should have the deployer as the first king.', async () => {
    const king = await contract.king();
    assert.equal(king, accounts[0], "Wrong king.");
  });

  it('Should fail deployment if value != 1 ether', async () => {
    await shouldFail.reverting.withMessage(
      King.new({
        from: accounts[0],
        value: web3.utils.toWei("0.5", "ether")
      }),
      "Contract must be deployed with a 1 ether prize"
    );
  });

  it('Should allow somebody to become new king', async () => {
    await contract.play({
      from: accounts[1],
      value: web3.utils.toWei("2", "ether")
    });
    const king = await contract.king();
    assert.equal(king, accounts[1]);
  });

  it('Should fail if someone sends less than prize', async () => {
    await shouldFail.reverting.withMessage(
      contract.play({
        from: accounts[1],
        value: web3.utils.toWei("0.5", "ether")
      }),
      "Deposit must be greater than current prize"
    );
  });

  it('Should send the new prize to old king', async () => {
    const oldKing = await contract.king();
    const oldKingBalance = await web3.eth.getBalance(oldKing);
    const prize = web3.utils.toWei("2", "ether");
    await contract.play({
      from: accounts[1],
      value: prize
    });
    const oldKingNewBalance = await web3.eth.getBalance(oldKing);
    console.log(oldKingBalance);
    console.log(oldKingNewBalance);
    console.log(prize);
    const actualPrize = oldKingBalance + prize;
    oldKingNewBalance.should.be.bignumber.equal(actualPrize);
    // assert.approximately(parseInt(oldKingNewBalance), parseInt(actualPrize), parseInt(web3.utils.toWei("0.01", "ether")));
  });
});
