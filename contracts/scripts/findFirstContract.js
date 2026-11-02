// findFirstContract.js
const Web3 = require('web3');
require('dotenv').config();

// 支持通过环境变量注入，亦可在本地直接替换为你的 Infura Project ID
const INFURA_KEY = process.env.INFURA_API_KEY || 'YOUR_INFURA_PROJECT_ID';
const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${INFURA_KEY}`));

async function locateFirstContractCreation() {
    try {
        console.log('Connecting to Ethereum Mainnet via Infura gateway...');
        const latestBlock = await web3.eth.getBlockNumber();
        console.log(`Current synchronized block height: ${latestBlock}`);

        // 在以太坊主网历史上，Frontier 创世于 Block 0，首个合约创建发生在 Block 46,147
        const startBlock = 0;
        const endBlock = 50000;

        console.log(`Commencing targeted search between blocks ${startBlock} and ${endBlock}...`);
        for (let b = startBlock; b <= endBlock; b++) {
            const block = await web3.eth.getBlock(b, true); // true 代表拉取完整交易详情
            if (block && block.transactions && block.transactions.length > 0) {
                for (const tx of block.transactions) {
                    // 合约创建交易的核心特征：接收方地址为空 (tx.to === null)
                    if (tx.to === null) {
                        console.log('\n========================================================');
                        console.log('SUCCESS: First Smart Contract Creation Transaction Found!');
                        console.log(`Block Number     : ${block.number}`);
                        console.log(`Block Hash       : ${block.hash}`);
                        console.log(`Timestamp        : ${new Date(block.timestamp * 1000).toUTCString()}`);
                        console.log(`Transaction Hash : ${tx.hash}`);
                        console.log(`Deployer (From)  : ${tx.from}`);
                        console.log(`Gas Used         : ${tx.gas}`);
                        console.log('========================================================\n');
                        return block.number;
                    }
                }
            }
            if (b % 5000 === 0 && b > 0) {
                console.log(`Scanned ${b} blocks... No contract creations detected yet.`);
            }
        }
    } catch (error) {
        console.error('Error querying blockchain data:', error.message);
    }
}

locateFirstContractCreation();
