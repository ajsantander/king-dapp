const King = artifacts.require("./King.sol");
const { shouldFail } = require("openzeppelin-test-helpers");

contract("King", (accounts) => {

  let contract;

  async function getBalanceInEther(account) {
    const balanceWei = await web3.eth.getBalance(account);
    const balanceEther = web3.utils.fromWei(balanceWei, 'ether');
    return parseInt(balanceEther, 10);
  }

  beforeEach(async () => {
    contract = await King.new({
      from: accounts[0],
      value: web3.utils.toWei("1", "ether"),
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
    const oldKingBalance = await getBalanceInEther(oldKing);
    const prizeInEther = 2;
    await contract.play({
      from: accounts[1],
      value: web3.utils.toWei(`${prizeInEther}`, "ether")
    });
    const oldKingNewBalance = await getBalanceInEther(oldKing);
    const actualPrize = oldKingBalance + prizeInEther;
    assert.approximately(
      oldKingNewBalance,
      actualPrize,
      0.01
    );
  });

  it('Should work the fallback function', async () =>{
    await web3.eth.sendTransaction(({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether")
    }));
    const king = await contract.king();
    assert.equal(king, accounts[0]);
  });

  it('Should game over after one month', async () =>{
    const now = (new Date()).getTime() / 1000;
    now = now + 2599000
    await shouldFail.reverting.withMessage(
      contract.play({
        from: accounts[1],
        value: web3.utils.toWei("2", "ether"),
        time: now
      }),
      "Allow to play only before one month since creation"
    );
  });

  it('Should allow king to extract after one month', async () => {
      const king = await contract.king();
      const prizeInEther = await contract.prize();
      const now = (new Date()).getTime() / 1000;
      now = now + 2599000
      await contract.play({
        from: accounts[0],
        value: web3.utils.toWei(`${prizeInEther}`, "ether"),
        time: now
      });
        assert.equal(prizeInEther, 0);
  });
});
