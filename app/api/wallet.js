const random = require('random-node');
const db = require('../modules/db');
const error = require('../modules/error/api');
const config = require('../modules/config');
const sol_config = require('../../config.sol');

const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.get('geth:host')));
const keythereum = require("keythereum");
const Tx = require('ethereumjs-tx');
const _ = require('lodash');
const SolidityFunction = require('web3/lib/web3/function');
module.exports = (API, redis) => {
    let solidityFunction = new SolidityFunction('', _.find(sol_config._abi, {name: 'GetRoomsCount'}), '0x283684994b56861DabBfF1eE012dA9BcabAb6c62');
    var hash = web3.sha3("Some string to be hashed");
    console.log(hash); // "0xed973b234cf2238052c9ac87072c71bcf33abc1bbd721018e0cca448ef79b379"

    var hashOfHash = web3.toHex("Some string to be hashed");
    console.log(hashOfHash);
    API.on('test_smartContract', true, (user, param, callback) => {

        callback && callback(null, {ok: 1});
    }, {
        title: 'Demo function',
        description: 'Demo function',
        param: [],
        response: []
    });
    API.on('transfer_coin', (user, param, callback) => {
        if (!param.from)return callback && callback(null, {
                error: error.api('Request param "from" incorrect', 'param', {
                    pos: 'api/auth.js(transfer_coin):#1',
                    param: param
                }, 0),
                success: false,

            });
        if (!param.to)return callback && callback(null, {
                error: error.api('Request param "to" incorrect', 'param', {
                    pos: 'api/auth.js(transfer_coin):#2',
                    param: param
                }, 0),
                success: false

            });

        if (!param.amount)return callback && callback(null, {
                error: error.api('Request param "amount" incorrect', 'param', {
                    pos: 'api/auth.js(transfer_coin):#3',
                    param: param
                }, 0),
                success: false
            });
        if (isNaN(+param.amount)) {
            callback && callback(null,
                {
                    error: error.api('Request param "amount" incorrect', 'param', {
                        pos: 'api/auth.js(transfer_coin):#4',
                        param: param
                    }, 0),
                    success: false
                });
        }

        db.wallets.findOne({
            "user": db.mongoose.Types.ObjectId(user._id),
            "wallet.address": param.from,
        }).then((response_s) => {
            if (!response_s) {
                callback && callback(null,
                    {
                        error: error.api('wallets not found', 'param', {
                            pos: 'api/auth.js(transfer_coin):#1',
                            param: param
                        }, 0),
                        success: false
                    });
                return false;
            }

            db.tx.find({
                "wallet": response_s.wallet.address,
                "currency": sol_config._symbol,
            }).then(function (res) {
                let nonce = web3.eth.getTransactionCount(response_s.wallet.address);
                for (let k in res) {
                    if (res.hasOwnProperty(k) && nonce < res[k].nonce)
                        nonce = res[k].nonce;
                }
                let privateKey = new Buffer(response_s.wallet.PrivateKey, 'hex');
                let solidityFunction = new SolidityFunction('', _.find(sol_config._abi, {name: 'transfer'}), '');
                let payloadData = solidityFunction.toPayload([param.to, (+param.amount * sol_config._contract_fixed)]).data;
                let gasPrice = web3.eth.gasPrice;
                let gasPriceHex = web3.toHex(21000000000);
                let gasLimitHex = web3.toHex(80000);
                let nonceHex = web3.toHex(nonce);
                let tx = new Tx({
                    nonce: nonceHex,
                    gasPrice: gasPriceHex,
                    gasLimit: gasLimitHex,
                    to: sol_config._address,
                    from: response_s.wallet.address,
                    value: '0x00',
                    data: payloadData
                });
                console.log(gasPrice);

                tx.sign(privateKey);

                let serializedTx = tx.serialize();

                web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'), function (err, hash) {
                    if (err) {
                        console.log('Error sendRawTransaction:', err);
                        callback && callback(null,
                            {
                                error: error.api('Error send TX', 'web3', err, 0),
                                success: false
                            });
                    }
                    else {
                        callback && callback(null,
                            {
                                txHash: hash,
                                success: true
                            });
                        new db.tx({
                            user_id: user.webtransfer_id,
                            currency: sol_config._symbol,
                            tx: {
                                to: param.to,
                                from: response_s.wallet.address,
                                value: +param.amount,
                                hash: hash
                            },
                            nonce: +nonce + 1,
                            wallet: response_s.wallet.address,
                            callback_url: param.callback_url,
                            status: 1
                        }).save();
                    }
                });
            }).catch(function (err) {
                return callback && callback(null, {
                        error: error.api(err.message, 'db', err, 5),
                        success: false
                    });

            });
        }).catch(function (err) {
            return callback && callback(null, {
                    error: error.api(err.message, 'db', err, 5),
                    success: false
                });

        });

    }, {
        title: 'Transfer ERC20 TOKEN',
        description: 'Transfer smart token fund ERC20 TOKEN (sol function transfer)',
        param: [
            {
                name: 'from',
                type: "string",
                title: 'address',
                necessarily: false,
                default: '0x'
            },
            {
                name: 'to',
                type: "string",
                title: 'address',
                necessarily: false,
                default: '0x'
            },
            {
                name: 'amount',
                type: "int",
                title: 'Сумма',
                necessarily: false,
                default: '0.000'
            }

        ],
        response: [
            {name: 'success', type: "string", title: 'Успешно ?', default: 'true, false'},
            {
                name: 'txHash',
                type: "string",
                title: 'хеш транзакции',
                default: '0x*******'
            },
            {name: 'error', type: "string", title: '', default: 'ERROR account not approve'},
            {name: 'latency_ms', type: "int(11)", title: 'Время оброботки запроса в  мс', default: '122'}
        ]
    });
};