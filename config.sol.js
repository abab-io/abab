const _address = '0x95408930d6323ac7aa69e6c2cbfe58774d565fa8'; // smart contract address
const _contract_fixed = 100000000;
const _name = "AbabCoin";
const _symbol = "ABC";
const _abi = [
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "success", "type": "bool"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_disable", "type": "bool"}],
        "name": "disableTransfers",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "MiningRewardPerETHBlock",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_from", "type": "address"}, {"name": "_to", "type": "address"}, {
            "name": "_value",
            "type": "uint256"
        }],
        "name": "transferFrom",
        "outputs": [{"name": "success", "type": "bool"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_amount", "type": "uint256"}],
        "name": "ChangeMiningReward",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "version",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "standard",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_token", "type": "address"}, {"name": "_to", "type": "address"}, {
            "name": "_amount",
            "type": "uint256"
        }],
        "name": "withdrawTokens",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "acceptOwnership",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_to", "type": "address"}, {"name": "_amount", "type": "uint256"}],
        "name": "issue",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [{"name": "", "type": "address"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_from", "type": "address"}, {"name": "_amount", "type": "uint256"}],
        "name": "destroy",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "transfer",
        "outputs": [{"name": "success", "type": "bool"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "transfersEnabled",
        "outputs": [{"name": "", "type": "bool"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [],
        "name": "TransferMinersReward",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "newOwner",
        "outputs": [{"name": "", "type": "address"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [{"name": "", "type": "address"}, {"name": "", "type": "address"}],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": true,
        "inputs": [],
        "name": "lastBlockRewarded",
        "outputs": [{"name": "", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }, {
        "constant": false,
        "inputs": [{"name": "_newOwner", "type": "address"}],
        "name": "transferOwnership",
        "outputs": [],
        "payable": false,
        "type": "function"
    }, {
        "inputs": [{"name": "_name", "type": "string"}, {"name": "_symbol", "type": "string"}, {
            "name": "_decimals",
            "type": "uint8"
        }], "payable": false, "type": "constructor"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "name": "_token", "type": "address"}],
        "name": "DebitCoinTokenGenesis",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "name": "_amount", "type": "uint256"}],
        "name": "Issuance",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "name": "_amount", "type": "uint256"}],
        "name": "Destruction",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "name": "_amount", "type": "uint256"}],
        "name": "MiningRewardChanged",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "name": "_from", "type": "address"}, {
            "indexed": true,
            "name": "_to",
            "type": "address"
        }, {"indexed": false, "name": "_value", "type": "uint256"}],
        "name": "MiningRewardSent",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "name": "_prevOwner", "type": "address"}, {
            "indexed": false,
            "name": "_newOwner",
            "type": "address"
        }],
        "name": "OwnerUpdate",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "name": "_from", "type": "address"}, {
            "indexed": true,
            "name": "_to",
            "type": "address"
        }, {"indexed": false, "name": "_value", "type": "uint256"}],
        "name": "Transfer",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "name": "_owner", "type": "address"}, {
            "indexed": true,
            "name": "_spender",
            "type": "address"
        }, {"indexed": false, "name": "_value", "type": "uint256"}],
        "name": "Approval",
        "type": "event"
    }
]; // ABI Contract
module.exports = {
    _address: _address,
    _contract_fixed: _contract_fixed,
    _name: _name,
    _symbol: _symbol,
    _abi: _abi,
};
const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3();
// web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'));

var source = fs.readFileSync('./contracts/contracts/Abab.sol').toString();
console.log(source);
var compiled = web3.eth.compile.solidity(source);
// console.log(compiled);