const random = require('random-node');
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'));
const keythereum = require("keythereum");
module.exports = (API, redis) => {
    API.on('auth_email', (user, param, callback) => {
        if (!param.email)
            return callback && callback(null, {
                    error: 'email param undefined',
                    success: false
                });
        if (!param.password)
            return callback && callback(null, {
                    error: 'password param undefined',
                    success: false
                });

            return callback && callback(null, {
                    error: 'method in developing',
                    success: false
                });

    }, {
        title: 'Login user for email',
        description: 'Login user for email',
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