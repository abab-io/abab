const random = require('random-node');
const db = require('../modules/db');
const error = require('../modules/error/api');
const config = require('../modules/config');
const sol_config = require('../../config.sol');
const path = require('path');

const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(config.get('geth:host')));
const keythereum = require("keythereum");
const Tx = require('ethereumjs-tx');
const util = require('ethereumjs-util');
const md5 = require('md5');

const _ = require('lodash');
const SolidityFunction = require('web3/lib/web3/function');
const request = require('request');
const moment = require('moment');
const async = require('async');


module.exports = (API, redis) => {

    var rateETHUSD = 0;

    var web3_events = {
        NewSchedule: function (event, tx, callback) {
            db.scheduleRoom.update({
                "tx.hash": event.transactionHash
            }, {
                $set: {
                    "tx.status": 3,
                    "_scheduleIndex": +(event.args.scheduleIndex.toString()),
                }
            }, {}).then(function (docs) {
                callback(true);
            }).catch(function () {
                callback('error db $ db.scheduleRoom.findOneAndUpdate');
            });
        },
        NewRoom: function (event, tx, callback) {
            // console.log(event);
            let _roomDescriptionHash = web3.fromDecimal(event.args._roomDescriptionHash);
            db.rooms.findOneAndUpdate({txHash: tx.tx.hash, _hash: _roomDescriptionHash, wallet: event.args.host}, {
                tx: db.mongoose.Types.ObjectId(tx._id),
                _index: event.args.roomIndex,
                status: 3
            }, {new: true}).populate('user').then(function (document) {
                db.scheduleRoom.find({
                    room: db.mongoose.Types.ObjectId(document._doc._id),
                    "tx.status": 1
                }).then(function (documents) {
                    async.mapSeries(documents, function (schedule, callback) {

                        async.parallel({
                            startDateDay: function (dayConvert_callback) {
                                API.emit('public_fn_Timestamp2Daystamp', user, {timestamp: moment.utc(schedule.startDate).unix()}, function (res) {
                                    dayConvert_callback(null, res.result.result);
                                });
                            },
                            endDateDay: function (dayConvert_callback) {
                                API.emit('public_fn_Timestamp2Daystamp', user, {timestamp: moment.utc(schedule.endDate).unix()}, function (res) {
                                    dayConvert_callback(null, res.result.result);
                                });
                            }
                        }, function (err, dayConvert) {
                            // results is now equals to: {one: 1, two: 2}

                            let param_tx = [
                                event.args.roomIndex, //_roomIndex
                                '9999999999',//_scheduleIndex
                                dayConvert.startDateDay,//_from
                                dayConvert.endDateDay,//_to
                                schedule.dayPrice,//_dayPrice
                                +(schedule.dayPrice - (schedule.dayPrice * schedule.discountWeek / 100)).toFixed(8),//_weekPrice
                                +(schedule.dayPrice - (schedule.dayPrice * schedule.discountMonth / 100)).toFixed(8),//_monthPrice
                                3 //_currency (1 abab 2 eth 3 usd 4 rur)
                            ].join(',');

                            console.log({
                                from: document.wallet,
                                function: 'UpsertSchedule',
                                param: param_tx
                            });
                            API.emit('requestFunctionContract', document.user, {
                                from: document.wallet,
                                function: 'UpsertSchedule',
                                param: param_tx
                            }, function (err, res) {
                                db.scheduleRoom.update({
                                    _id: db.mongoose.Types.ObjectId(schedule._id),
                                    "tx.status": 1
                                }, {
                                    $set: {
                                        "tx.status": 2,
                                        "tx.hash": res.result.tx.hash,
                                    }
                                }, {}).then(function (docs) {
                                    console.log(docs);
                                    callback(null, res.result.tx)

                                }).catch(function () {
                                    callback('error db $ db.scheduleRoom.findOneAndUpdate');

                                });
                            });
                        });


                    }, function () {
                        console.log('scheduleRoom public:', arguments)
                    })


                });

                callback && callback(true);
            });

            console.log('blockNumber', event.blockNumber);
            // console.log('transactionHash', event.transactionHash);
            // console.log('host', event.args.host);
            // console.log('roomIndex', +event.args.roomIndex);
            // console.log('_roomDescriptionHash', web3.fromDecimal(event.args._roomDescriptionHash));

            callback && callback();
        }
    };

    API.on('wallet', (user, param, callback) => {
        param.type = 'ETH';
        if (!web3.isConnected()) {
            return callback && callback(null, {
                    error: error.api('Web3 is not connected to geth server. Please try latter you request', 'web3', {
                        pos: 'api/wallet.js(requestFunctionContract):#5',
                        fn_err: 'if (!web3.isConnected()) return err;',
                        param: param
                    }, 10),
                    success: false
                });
        }
        if (param.update) {
            db.wallets.update({
                "user": db.mongoose.Types.ObjectId(user._id),
                "type": param.type,
                "active": true,
            }, {"active": false,}).then((result) => {
                let params = {keyBytes: 32, ivBytes: 16};
                let dk = keythereum.create(params);
                let options = {
                    kdf: "pbkdf2",
                    cipher: "aes-128-ctr",
                    kdfparams: {
                        c: 1024,
                        dklen: 32,
                        prf: "hmac-sha256"
                    }
                };
                let pass_wallet = random.str(8, 12);
                let keyObject = keythereum.dump(pass_wallet, dk.privateKey, dk.salt, dk.iv, options);

                keythereum.exportToFile(keyObject, path.resolve('./wallets'), function (filePath) {
                    let resultWallet = {
                        address: keythereum.privateKeyToAddress(dk.privateKey),
                        privateKey: dk.privateKey.toString('hex'),
                        filePath: filePath.replace('/root/abab', ''),
                        passwordKeystore: pass_wallet
                    };
                    let ETHbalance = 0, ABABCoinBalance = 0, ETHUSDbalance = 0;
                    if (web3.isConnected()) {
                        ETHbalance = +(+web3.eth.getBalance(resultWallet.address) / 1000000000000000000).toFixed(8);
                        // ABABCoinBalance = (+contract.balanceOf(resultWallet.address) / sol_config._contract_fixed).toFixed(2);
                        ETHUSDbalance = ETHbalance * rateETHUSD;
                    }
                    let db_save_ = new db.wallets({
                        user: db.mongoose.Types.ObjectId(user._id),
                        active: true,
                        type: param.type,
                        wallet: {
                            address: resultWallet.address,
                            balance: {
                                eth: ETHbalance,
                                abab: ABABCoinBalance,
                                ethusd: ETHUSDbalance,
                            },
                            KeystoreURL: resultWallet.filePath,
                            PrivateKey: resultWallet.privateKey,
                            passwordKeystore: resultWallet.passwordKeystore
                        }
                    });
                    db_save_.save().then(function (res) {
                        return callback && callback(null, res)
                    }).catch(function (err) {
                        return callback && callback(null, {
                                error: error.api(err.message, 'db', err, 10),
                                success: false
                            });

                    })
                });
            }).catch(function (err) {
                return callback && callback(null, {
                        error: error.api(err.message, 'db', err, 4),
                        success: false
                    });

            });
        } else {


            db.wallets.findOne({
                "user": db.mongoose.Types.ObjectId(user._id),
                "type": param.type,
                "active": true,
            }).then((response_s) => {
                if (!response_s || response_s.length == 0) {
                    let params = {keyBytes: 32, ivBytes: 16};
                    let dk = keythereum.create(params);
                    let options = {
                        kdf: "pbkdf2",
                        cipher: "aes-128-ctr",
                        kdfparams: {
                            c: 1024,
                            dklen: 32,
                            prf: "hmac-sha256"
                        }
                    };
                    let pass_wallet = random.str(8, 12);
                    let keyObject = keythereum.dump(pass_wallet, dk.privateKey, dk.salt, dk.iv, options);
                    keythereum.exportToFile(keyObject, path.resolve('./wallets'), function (filePath) {
                        let resultWallet = {
                            address: keythereum.privateKeyToAddress(dk.privateKey),
                            privateKey: dk.privateKey.toString('hex'),
                            filePath: filePath.replace('/root/wtchatnew', ''),
                            passwordKeystore: pass_wallet
                        };
                        let ETHbalance = 0, ABABCoinBalance = 0, ETHUSDbalance = 0;
                        if (web3.isConnected()) {
                            ETHbalance = +(+web3.eth.getBalance(resultWallet.address) / 1000000000000000000).toFixed(8);
                            // ABABCoinBalance = (+contract.balanceOf(resultWallet.address) / sol_config._contract_fixed).toFixed(2);
                            ETHUSDbalance = ETHbalance * rateETHUSD;
                        }
                        new db.wallets({
                            user: db.mongoose.Types.ObjectId(user._id),
                            active: true,
                            type: param.type,
                            wallet: {
                                address: resultWallet.address,
                                balance: {
                                    eth: ETHbalance,
                                    abab: ABABCoinBalance,
                                    ethusd: ETHUSDbalance,
                                },
                                KeystoreURL: resultWallet.filePath,
                                PrivateKey: resultWallet.privateKey,
                                passwordKeystore: resultWallet.passwordKeystore
                            }
                        }).save().then(function (res) {


                            return callback && callback(null, {
                                    user_id: res.user_id,
                                    active: res.active,
                                    type: res.type,
                                    wallet: {
                                        address: res.wallet.address,
                                        approve: res.wallet.approve,
                                        balance: res.wallet.balance,
                                        KeystoreURL: res.wallet.KeystoreURL,
                                        PrivateKey: res.wallet.PrivateKey,
                                        passwordKeystore: res.wallet.passwordKeystore
                                    }
                                })
                        }).catch(function (err) {
                            return callback && callback(null, {
                                    error: error.api(err.message, 'db', err, 9),
                                    success: false
                                });
                        });

                    });
                } else {
                    let ETHbalance = 0, ABABCoinBalance = 0, ETHUSDbalance = 0, update = {};


                    if (web3.isConnected()) {
                        ETHbalance = +(+web3.eth.getBalance(response_s.wallet.address) / 1000000000000000000).toFixed(8);
                        // ABABCoinBalance = (+contract.balanceOf(response_s.wallet.address) / sol_config._contract_fixed).toFixed(2);
                        ETHUSDbalance = ETHbalance * rateETHUSD;
                        update = {
                            "wallet.balance": {
                                eth: ETHbalance,
                                abab: ABABCoinBalance,
                                ethusd: ETHUSDbalance,
                            }
                        }
                    }

                    db.wallets.findOneAndUpdate({
                        "user": db.mongoose.Types.ObjectId(user._id),
                        "type": param.type,
                        "wallet.address": response_s.wallet.address,
                        "active": true,
                    }, update).then((res) => {

                        let result_data = {
                            user: res.user,
                            active: res.active,
                            type: res.type,
                            wallet: {
                                address: res.wallet.address,
                                balance: {
                                    eth: ETHbalance,
                                    abab: ABABCoinBalance,
                                    ethusd: ETHUSDbalance,
                                }
                            }
                        };
                        if (param.secure) {
                            let timestamp = new Date().getTime();
                            let secret = (timestamp / 1000000 ).toFixed(0);
                            let hash = md5(timestamp + ':' + res.user_id + ':' + res.wallet.address + ':' + secret);
                            result_data.wallet.KeystoreURL = 'https://' + config.get('domain') + '/wallet/KeystoreURL/?passwordKeystore=' + res.wallet.passwordKeystore + '&timestamp=' + timestamp + '&user_id=' + res.user_id + '&address=' + res.wallet.address + '&hash=' + hash;
                            result_data.wallet.PrivateKey = res.wallet.PrivateKey;
                            result_data.wallet.passwordKeystore = res.wallet.passwordKeystore;
                        }
                        callback && callback(null, result_data)
                    }).catch(function (err) {
                        return callback && callback(null, {
                                error: error.api(err.message, 'db', err, 8),
                                success: false
                            });
                    });

                }
            }).catch(function (err) {
                return callback && callback(null, {
                        error: error.api(err.message, 'db', err, 6),
                        success: false
                    });
            });

        }
    }, {
        title: 'Get / create a wallet ',
        description: 'Creates (if the address was not found in the database) or receives the data of the wallet (and also the balance) in the Ethereum system and adds the currency ABAB coin (Private Key, URL: Keystore File (UTC / JSON))',
        param: [
            {
                name: 'type',
                type: "string",
                title: 'Currency',
                necessarily: false,
                default: 'ETH'
            }, {
                name: 'update',
                type: "int",
                title: 'ATTENTION !! To get a new address, all funds on the current balance will be lost (the opportunity will be restored only through support)',
                necessarily: false
            },

        ],
        response: [
            {name: 'success', type: "string", title: 'Успешно ?', default: 'true, false'},
            {
                name: 'address',
                type: "string",
                title: 'Аддрес кашелька',
                default: '0x5EF7D6bCF0Ff2fee823883841a246aB84ffce8A0'
            },
            {
                name: 'KeystoreURL',
                type: "string",
                title: 'Ссылка на скачивание Keystore File (UTC / JSON)',
                default: 'https://telegraf.money/wallets/UTC--2017-06-21T11:22:19.875Z--16be0a7f254b6952d482c6bd20a0843bdcefdab5?user_id=&_id_wallet='
            },
            {
                name: 'PrivateKey',
                type: "string",
                title: 'PrivateKey  ключ для доступа  к аккаунту',
                default: 'c751944bec39bffea06f1d2b33626cfef03b347b9b0364e3cebfd6ec3b32cb11'
            },
            {
                name: 'passwordKeystore',
                type: "string",
                title: 'PrivateKey  ключ для доступа  к аккаунту',
                default: 'c751944bec39bffea06f1d2b33626cfef03b347b9b0364e3cebfd6ec3b32cb11'
            },
            {name: 'error', type: "string", title: '', default: 'ERROR str'},
            {name: 'latency_ms', type: "int(11)", title: 'Время оброботки запроса в  мс', default: '122'}
        ]
    });
    API.on('requestFunctionContract', (user, param, callback) => {

        if (!param.from || typeof param.from !== 'string')return callback && callback(null, {
                error: error.api('Request param "from" incorrect', 'param', {
                    pos: 'api/wallet.js(requestFunctionContract):#1',
                    param: param
                }, 0),
                success: false,

            });
        if (!param.function || typeof param.function !== 'string')return callback && callback(null, {
                error: error.api('Request param "function" incorrect', 'param', {
                    pos: 'api/wallet.js(requestFunctionContract):#2',
                    param: param
                }, 0),
                success: false,

            });
        if (!param.param || typeof param.param !== 'string')return callback && callback(null, {
                error: error.api('Request param "param" incorrect', 'param', {
                    pos: 'api/wallet.js(requestFunctionContract):#3',
                    param: param
                }, 0),
                success: false,

            });

        if (!web3.isAddress(param.from))return callback && callback(null, {
                error: error.api('Request param "from" is not valid Address', 'param', {
                    pos: 'api/wallet.js(requestFunctionContract):#4',
                    param: param
                }, 0),
                success: false
            });


        if (!_.find(sol_config._abi, {name: param.function}) || _.find(sol_config._abi, {name: param.function}).type !== 'function')
            return callback && callback(null, {
                    error: error.api('Request param "function" is not found function contract', 'param', {
                        pos: 'api/wallet.js(requestFunctionContract):#5',
                        param: param
                    }, 0),
                    success: false
                });


        if (!web3.isConnected()) {
            return callback && callback(null, {
                    error: error.api('Web3 is not connected to geth server. Please try latter you request', 'web3', {
                        pos: 'api/wallet.js(requestFunctionContract):#6',
                        fn_err: 'if (!web3.isConnected()) return err;',
                        param: param
                    }, 10),
                    success: false
                });
        }
        param.param = param.param.split(',');
        db.wallets.findOne({
            "user": db.mongoose.Types.ObjectId(user._id),
            "wallet.address": param.from,
        }).then((response_s) => {
            db.tx.find({
                "wallet": response_s.wallet.address,
                "currency": sol_config._symbol,
            }).then(function (res) {
                let nonce = web3.eth.getTransactionCount(response_s.wallet.address);
                for (let k in res) {
                    if (res.hasOwnProperty(k) && nonce < res[k].nonce && +((+new Date().getTime()) - 1000 * 60 ) < +res[k].create_at.getTime())
                        nonce = res[k].nonce;
                }
                let privateKey = new Buffer(response_s.wallet.PrivateKey, 'hex');
                let solidityFunction = new SolidityFunction('', _.find(sol_config._abi, {name: param.function}), '');
                if (solidityFunction._inputTypes.length !== param.param.length) {
                    return callback && callback(null, {
                            error: error.api('invalid req param solidityFunction param: ' + JSON.stringify(solidityFunction._inputTypes), 'param', {
                                pos: 'api/wallet.js(requestFunctionContract):#7',
                                fn_err: 'if (solidityFunction._inputTypes.length !==param.param.length) return err;',
                                param: param
                            }, 0),
                            success: false
                        });
                }

                let payloadData = solidityFunction.toPayload(param.param).data;


                let gasPriceHex = util.bufferToHex(21000000000);
                let gasLimitHex = util.bufferToHex(400000);
                let nonceHex = util.bufferToHex(nonce);
                let tx = new Tx({
                    nonce: nonceHex,
                    gasPrice: gasPriceHex,
                    gasLimit: gasLimitHex,
                    to: sol_config._address,
                    from: response_s.wallet.address,
                    value: '0x00',
                    data: payloadData,
                    chainId: 3 // 3 == testnet ropsten ,1 == original

                });
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

                        new db.tx({
                            user: db.mongoose.Types.ObjectId(user._id),
                            currency: sol_config._symbol,
                            tx: {
                                hash: hash,
                                to: sol_config._address,
                                from: response_s.wallet.address,
                                function: param.function,
                                param: param.param,
                                rawTx: '0x' + serializedTx.toString('hex')
                            },
                            nonce: +nonce + 1,
                            wallet: response_s.wallet.address,
                            callback_url: param.callback_url,
                            status: 1
                        }).save().then(function (res) {
                            callback && callback(null,
                                {
                                    result: res,
                                    success: true
                                });
                        }).catch(function (err) {
                            return callback && callback(null, {
                                    error: error.api(err.message, 'db', err, 3),
                                    success: false
                                });

                        });
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
                    error: error.api(err.message, 'db', err, 6),
                    success: false
                });

        });
    }, {
        title: 'Send transaction to smart contract function ',
        description: 'Send transaction to smart contract function(' + sol_config.sol_config + '):' + sol_config._address,
        param: [{
            name: 'from',
            type: "string",
            title: 'address',
            necessarily: true,
            default: '0x'
        }, {
            name: 'function',
            type: "string",
            title: 'name function',
            necessarily: true,
            default: ''
        }, {
            name: 'param',
            type: "array",
            title: 'param function contract ',
            necessarily: true,
            default: ''
        }, {
            name: 'callback_url',
            type: "string",
            title: 'callback url change status tx',
            necessarily: false,
            default: 'https://'
        }],
        response: [
            {name: 'success', type: "string", title: 'Success ?', default: 'true, false'},
            {
                name: 'txHash',
                type: "string",
                title: 'HASH transaction blockchain',
                default: '0x*******'
            },
            {name: 'error', type: "object", title: '', default: 'ERROR'},
            {name: 'latency_ms', type: "int(11)", title: 'Processing time of the request in ms', default: '122'}
        ]
    });
    API.on('transfer_coin', (user, param, callback) => {
        // transfer abab_coin
        callback && callback(null, {
            error: error.api('This method in development', 'server', {
                pos: 'api/wallet.js(transfer_coin):#1',
                param: param
            }, 0),
            success: false,
        })
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
            {name: 'success', type: "string", title: 'Success ?', default: 'true, false'},
            {
                name: 'txHash',
                type: "string",
                title: 'HASH transaction blockchain',
                default: '0x*******'
            },
            {name: 'error', type: "object", title: '', default: 'ERROR'},
            {name: 'latency_ms', type: "int(11)", title: 'Processing time of the request in ms', default: '122'}
        ]
    });
    API.on('callFunctionContract', true, (user, param, callback) => {

        var contract = web3.eth.contract(sol_config._abi).at(sol_config._address);
        if (!_.find(sol_config._abi, {name: param.function}) || !contract[param.function]) {
            return callback && callback(null, {
                    error: error.api('Call function error function not found', 'param', {
                        param: param,
                        find_fn: _.find(sol_config._abi, {name: param.function})
                    }, 0),
                    success: false
                });
        }
        if (!param.param || typeof param.param !== 'object') {
            return callback && callback(null, {
                    error: error.api('Param type is not array', 'param', {
                        param: param,
                        find_fn: _.find(sol_config._abi, {name: param.function})
                    }, 0),
                    success: false
                });
        }
        if (param.param.length !== _.find(sol_config._abi, {name: param.function}).inputs.length) {
            return callback && callback(null, {
                    error: error.api('Param type is not array', 'param', {
                        param: param,
                        find_fn: _.find(sol_config._abi, {name: param.function})
                    }, 0),
                    success: false
                });
        }
        let paramContract = param.param;
        console.log(param);
        paramContract.push(function (error, result) {
            if (error)
                return callback && callback(null, {
                        error: error.api('Param type is not array', 'contract', {
                            param: param,
                            find_fn: _.find(sol_config._abi, {name: param.function})
                        }, 2),
                        success: false
                    });
            callback && callback(null, result);
            console.log('result: ', result, error);
        });
        contract[param.function].apply(null, paramContract);

    }, {
        title: 'Call function SmartContract',
        description: 'Call function (Read Function, Free)',
        param: [
            {
                name: 'function',
                type: "string",
                title: 'name function',
                necessarily: false,
                default: '0x'
            },
            {
                name: 'param',
                type: "array",
                title: 'array params transfer to function contract',
                necessarily: false,
                default: '[]'
            }

        ],
        response: [
            {name: 'success', type: "string", title: 'Success ?', default: 'true, false'},
            {
                name: 'result',
                type: "object",
                title: 'return is function',
                default: '*'
            },
            {name: 'error', type: "object", title: '', default: 'ERROR'},
            {name: 'latency_ms', type: "int(11)", title: 'Processing time of the request in ms', default: '122'}
        ]
    });

    if (web3.isConnected()) {
        // config.set('geth:lastBlockNumber', 1376000);
        console.log("Web3 connected!\n\tStart synchronization... \n\t Last block:" + config.get('geth:lastBlockNumber'));
        var contract = web3.eth.contract(sol_config._abi).at(sol_config._address);

        var events = contract.allEvents({fromBlock: config.get('geth:lastBlockNumber'), toBlock: 'latest'});
        events.watch(function (error, result) {
            if (result && result.event) {
                if (!web3_events[result.event]) {
                    return console.error('EVENT Error #web3_events not found:\n', result, '\n\t\t- - - - - - -\n');
                }
                db.tx.findOne({"tx.hash": result.transactionHash}).then(function (res) {
                    if (res) {
                        web3_events[result.event](result, res, function () {
                            config.set('geth:lastBlockNumber', result.blockNumber);
                        });
                        if (res.callback_url && res.callback_url !== '')
                            request.post(res.callback_url, {
                                form: {event: result},
                                timeout: 500
                            }, function (error, response,) {
                                console.log('statusCode:', response && response.statusCode);
                            });
                    }

                }).catch(function (err) {
                    return callback && callback(null, {
                            error: error.api(err.message, 'db', err, 3),
                            success: false
                        });

                });
            }

        });

    }
};
