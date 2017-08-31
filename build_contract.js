//TODO import all    import "./zeppelin-solidity/ownership/Ownable.sol";
//TODO change all    pragma solidity ^0.4.11;   to   pragma solidity ^0.4.17;
//TODO compile
//TODO deploy
//TODO verification
//
// if (process.argv.length < 3) {
//     console.log('Usage: node ' + process.argv[1] + ' FILENAME -i -p=0.4.17');
//     process.exit(1);
// }


const inputFileName = './contracts/contracts/Abab.sol';
const pragma = '^0.4.11';
const ContractName = 'Abab';
const account_address = '0xa1b1d9551211755165a677c5e9d4b1041f4b5fd6';
const account_private = 'df03891cdfb422bf856717211fb09733962e8feff9e7284e1304e1b1f2d55082';

global._path_root = __dirname + '/';

const config = require('./app/modules/config');
const sol_config = require('./config.sol');
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.get('geth:host')));
const util = require('ethereumjs-util');
const Tx = require('ethereumjs-tx');

const fs = require('fs');
const path = require('path');
const shelljs = require('shelljs');
var solc = require('solc');
var argv = require('minimist')(process.argv.slice(2));
const importFile = [];
function readFile(fileName) {
    console.log('Import: ' + fileName,);
    if (importFile.indexOf(fileName) !== -1) {
        return ''
    }

    importFile.push(fileName);
    let dirname__ = path.dirname(fileName);
    let inputFile = fs.readFileSync(fileName, 'utf8');
    let result = '';
    let inputFileArr = inputFile.split(/\r?\n/);
    for (let i in inputFileArr) {
        let inputLine = inputFileArr[i];
        let resultLine = inputLine;
        let prepareLine = inputLine.trim().replace(new RegExp(" +", 'g'), " ");
        // console.log(line);
        if (resultLine.startsWith('import')) {
            let modulerel = resultLine.trim().split('"')[1] || resultLine.trim().split("'")[1];
            let modulePath = path.resolve(dirname__, modulerel);
            resultLine = readFile(modulePath);//Проверить, что файл с таким именем ещё не импортировался
        }
        if (resultLine.startsWith('pragma')) {
            resultLine = '';
        }
        result += resultLine + '\n';
    }

    return result;


}
function compile(pragma, inputFileName) {
    let source = '';
    source += 'pragma solidity ' + pragma + ';';
    source += readFile(inputFileName);
    return source;
}


var source = compile(pragma, inputFileName);
function deploy(source, cb) {

    solc.loadRemoteVersion('latest', function (err, solcSnapshot) {
        console.log('Your current Solidity version is:\n\t', solcSnapshot.version());
        var output = solcSnapshot.compile(source, 1);

        var browser_untitled_sol_ababContract = web3.eth.contract(JSON.parse(output.contracts[':Abab'].interface));


        let nonce = web3.eth.getTransactionCount(account_address);
        let privateKey = new Buffer(account_private, 'hex');
        let payloadData = '0x' + output.contracts[':Abab'].bytecode;


        let gasPriceHex = util.bufferToHex(21000000000);
        let gasLimitHex = util.bufferToHex(4000000);
        let nonceHex = util.bufferToHex(nonce);
        let tx = new Tx({
            nonce: nonceHex,
            gasPrice: gasPriceHex,
            gasLimit: gasLimitHex,
            to: '',
            from: account_address,
            value: '0x00',
            data: payloadData,
            chainId: 3 // 3 == testnet ropsten ,1 == original

        });
        tx.sign(privateKey);
        let serializedTx = tx.serialize();

        web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
            console.log('Contract send tx:' + hash);
            console.log('Wait confirm transaction... (1 - 5 min)');
            let checkTx = setInterval(function () {
                let txData = web3.eth.getTransactionReceipt(hash);
                if (!txData) {
                    console.log('Tx check.');
                    return false;
                }
                cb && cb(txData, output.contracts[':Abab'].interface, output.contracts[':Abab'].bytecode, source, solcSnapshot.version());
                clearInterval(checkTx);


            }, 10000);

        });
    });
}
deploy(source, function (tx, _interface, _bytecode, source, solc_version) {
    console.log('Updating config.sol.js and source.sol ....');
    fs.writeFileSync("./source.sol", source);
    fs.writeFileSync("./config.sol.js", 'const _address = "' + tx.contractAddress + '"; // smart contract address\n' +
        'const _contract_fixed = 100000000;\n' +
        'const _name = "' + ContractName + '";\n' +
        'const _symbol = "ABC";\n' +
        'const _abi = ' + _interface + ';\n' +
        'const _bytecode = "' + _bytecode + '";\n' +
        'const _version = "' + solc_version + '";\n' +
        'module.exports = {_address: _address,_contract_fixed: _contract_fixed,_name: _name,_symbol: _symbol,_abi: _abi,_bytecode:_bytecode,_version:_version};');
    console.log('Deploy Contract Success:\n\tAddress: ' + tx.contractAddress + '\n\tBlockHash: ' + tx.blockHash + '\n\tblockNumber: ' + tx.blockNumber);
    console.log('== END ==');

    process.exit(0);
});
// console.log(output.contracts[':Abab'].bytecode);
// console.log(output.contracts[':Abab'].interface);

