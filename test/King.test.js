const King = artifacts.require("./King.sol");
const { shouldFail } = require("openzeppelin-test-helpers");

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
    assert(king, accounts[0], "Wrong king.");
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
});
