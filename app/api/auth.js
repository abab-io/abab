const random = require('random-node');
const passwordHash = require('password-hash');
const db = require('../modules/db');

const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'));
const keythereum = require("keythereum");
module.exports = (API, redis) => {
    API.on('auth_email', true, (user, param, callback) => {
        if (!param.email)
            return callback && callback(null, {
                    error: 'email param undefined',
                    success: false
                });
        if (!param.name)
            return callback && callback(null, {
                    error: 'name param undefined',
                    success: false
                });
        if (!param.surname)
            return callback && callback(null, {
                    error: 'surname param undefined',
                    success: false
                });
        if (!param.password)
            return callback && callback(null, {
                    error: 'password param undefined',
                    success: false
                });

        param.password = passwordHash.generate(param.password);
        db.users({

            email: param.email,
            phone: null,
            name: param.name,
            surname: param.surname,
            password: param.password,
            birthday: '00.00.0000',
            address: '',
            last_ip: '0.0.0.0',
            api: {
                key: random.key(5, 5, 5, 8) + '-' + (new Date().getTime()),
                secret: random.str(20, 25),
                white_ip: '*.*.*.*',
                status: false
            },
            settings: {},
            activate:false
        }).save(function (err,res) {
            return callback && callback(null, {
                    error: 'method in developing',
                    success: false
                });
        });


    }, {
        title: 'Login user for email',
        description: 'Login user for email method send verify message to "email" from smtp smtp',
        param: [
            {
                name: 'email',
                type: "string",
                title: 'user Email',
                necessarily: true
            }, {
                name: 'password',
                type: "string",
                title: 'user password',
                necessarily: true
            }, {
                name: 'name',
                type: "string",
                title: 'user name',
                necessarily: true
            }, {
                name: 'surname',
                type: "string",
                title: 'user name',
                necessarily: true
            },

        ],
        response: [
            {name: 'success', type: "string", title: 'Status request method', default: 'true, false'},
            {name: 'user_id', type: "string", title: 'user id', default: '12345'},
            {name: 'error', type: "string", title: '', default: 'Example: Error code'},
            {name: 'latency_ms', type: "int(11)", title: 'Request processing time in ms', default: '122'}
        ]
    });
};