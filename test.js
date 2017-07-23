
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://52.178.151.150:8545'));
const Tx = require('ethereumjs-tx');
const util = require('ethereumjs-util');
const md5 = require('md5');

const _ = require('lodash');
const SolidityFunction = require('web3/lib/web3/function');
console.log(web3.toHex({photo1:'https://gfdshsg.gsdg/gsdfgsdgdsfgfsdg.png'}));

/**
 * Created by bogdanmedvedev on 23.07.17.
 */
