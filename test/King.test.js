const King = artifacts.require("./King.sol");
const KingAttack = artifacts.require("./KingAttack.sol");
const { shouldFail, time } = require("openzeppelin-test-helpers");

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

  it('The fallback function should redirect to the play function', async () =>{
    const tx = await web3.eth.sendTransaction(({
      from: accounts[1],
      to: contract.address,
      value: web3.utils.toWei("2", "ether")
    }));
    const king = await contract.king();
    assert.equal(king, accounts[1]);
  });

  it('Should not allow anyone to play after 1 month', async () =>{
    const moreThanAMonth = 2599000;
    await time.increase(moreThanAMonth);
    await shouldFail.reverting.withMessage(
      contract.play({
        from: accounts[1],
        value: web3.utils.toWei("2", "ether")
      }),
      "Allow to play only before one month since creation"
    );
  });

  it('Should not allow king to extract before one month', async () => {
    await shouldFail.reverting.withMessage(
      contract.kingExtract({
        from: accounts[0]
      }),
      "Cannot extract until game is over"
    );
  });

  it('Should allow king to extract after one month', async () => {
    const moreThanAMonth = 2599000;
    await time.increase(moreThanAMonth);
    await contract.kingExtract({
      from: accounts[0]
    });
    const balance = await getBalanceInEther(contract.address);
    assert.equal(balance, 0);
  });

  // Not actually a test, just trying to expose a vulnerability in King.sol.
  it('Should be lockable by an attacker', async () => {

    const attacker = await KingAttack.new();
    await attacker.attack(contract.address, {
      from: accounts[0],
      value: web3.utils.toWei("2", "ether")
    });
    assert(await contract.king(), attacker);

    await contract.play({
      from: accounts[1],
      value: web3.utils.toWei("3", "ether")
    });
  });
});
