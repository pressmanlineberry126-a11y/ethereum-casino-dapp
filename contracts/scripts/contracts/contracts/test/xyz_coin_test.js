const XYZCoin = artifacts.require('XYZCoin');
const truffleAssert = require('truffle-assertions');

contract('XYZCoin - Comprehensive Test Suite', async accounts => {
    const [creator, recipient, spender, unauthorized] = accounts;
    let coinInstance;

    beforeEach(async () => {
        coinInstance = await XYZCoin.new({ from: creator });
    });

    // ==================== 基础功能测试 (Question 4h) ====================
    it('1. should set token name correctly', async () => {
        const name = await coinInstance.name();
        assert.equal(name, 'XYZCoin', 'Token name mismatch');
    });

    it('2. initial token balance of creator is equal to total token supply', async () => {
        const creatorBal = await coinInstance.balanceOf(creator);
        const total = await coinInstance.totalSupply();
        assert.equal(creatorBal.toNumber(), 1000, 'Creator balance must be 1000');
        assert.equal(creatorBal.toNumber(), total.toNumber(), 'Balance must match total supply');
    });

    it('3. tokens can be transferred using the transfer() function', async () => {
        await coinInstance.transfer(recipient, 200, { from: creator });
        const recipientBal = await coinInstance.balanceOf(recipient);
        const creatorBal = await coinInstance.balanceOf(creator);
        assert.equal(recipientBal.toNumber(), 200, 'Recipient should receive 200 tokens');
        assert.equal(creatorBal.toNumber(), 800, 'Creator balance should decrease to 800');
    });

    it('4. allowance can be set and read', async () => {
        await coinInstance.approve(spender, 350, { from: creator });
        const allowance = await coinInstance.allowance(creator, spender);
        assert.equal(allowance.toNumber(), 350, 'Allowance was not set correctly');
    });

    it('5. accounts can transfer tokens on behalf of other accounts', async () => {
        await coinInstance.approve(spender, 400, { from: creator });
        await coinInstance.transferFrom(creator, recipient, 150, { from: spender });
        const recipientBal = await coinInstance.balanceOf(recipient);
        const remainingAllowance = await coinInstance.allowance(creator, spender);
        assert.equal(recipientBal.toNumber(), 150, 'Recipient did not receive tokens via transferFrom');
        assert.equal(remainingAllowance.toNumber(), 250, 'Allowance should be decremented');
    });

    // ==================== 高级断言与事件测试 (Question 4i) ====================
    it('6. an insufficient balance throws an error when trying to transfer tokens', async () => {
        await truffleAssert.reverts(
            coinInstance.transfer(recipient, 2000, { from: creator }),
            'Insufficient balance'
        );
    });

    it('7. transferring from an account that has not explicitly authorized reverts', async () => {
        await truffleAssert.reverts(
            coinInstance.transferFrom(creator, recipient, 50, { from: unauthorized }),
            'Allowance exceeded'
        );
    });

    it('8. transfer() and transferFrom() must fire the Transfer event (including 0-value)', async () => {
        const txTransfer = await coinInstance.transfer(recipient, 50, { from: creator });
        truffleAssert.eventEmitted(txTransfer, 'Transfer', ev => {
            return ev.from === creator && ev.to === recipient && ev.value.toNumber() === 50;
        });

        // 零值转账事件触发
        const txZero = await coinInstance.transfer(recipient, 0, { from: creator });
        truffleAssert.eventEmitted(txZero, 'Transfer', ev => {
            return ev.from === creator && ev.to === recipient && ev.value.toNumber() === 0;
        });

        // 代理转账事件触发
        await coinInstance.approve(spender, 100, { from: creator });
        const txFrom = await coinInstance.transferFrom(creator, recipient, 100, { from: spender });
        truffleAssert.eventEmitted(txFrom, 'Transfer', ev => {
            return ev.from === creator && ev.to === recipient && ev.value.toNumber() === 100;
        });
    });

    it('9. the approve() function must fire the Approval event', async () => {
        const txApprove = await coinInstance.approve(spender, 500, { from: creator });
        truffleAssert.eventEmitted(txApprove, 'Approval', ev => {
            return ev.owner === creator && ev.spender === spender && ev.value.toNumber() === 500;
        });
    });
});
