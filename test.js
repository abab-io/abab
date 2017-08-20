const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://52.178.151.150:8545'));
const crypto = require('crypto');


const keythereum = require("keythereum");
const Tx = require('ethereumjs-tx');
const util = require('ethereumjs-util');
const md5 = require('md5');

const _ = require('lodash');
const SolidityFunction = require('web3/lib/web3/function');
const sol_config = require('./config.sol');

var contract = web3.eth.contract(sol_config._abi).at(sol_config._address);
// contract.GetScheduleByIndex.apply(null,['0xa1b1d9551211755165a677c5e9d4b1041f4b5fd6',0,function (error, result) {
//     console.log('result: ', result, error,_.find(sol_config._abi, {name: 'GetScheduleByIndex'}));
// }]);
console.log(_.find(sol_config._abi, {name: 'DateIsFree',statemutability:'view'}));