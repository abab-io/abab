
var request = require('../modules/request');

module.exports = (API, redis) => {

    API.on('get_testnet_eth', true,(user, param, callback) => {
        let option = {
            rejectUnauthorized: false,
            host: 'ropsten.faucet.b9lab.com',
            port: 443,
            path: '/tap',
            method: 'POST',
            formData: '{"toWhom":"'+param.address+'"}',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        request.getJSON(option, (statusCode, response) => {
            callback && callback(null, {response:response,statusCode:statusCode,address:param.address});
        });
    }, {
        title: 'Get eth testnet coin ropsten',
        description: 'Get eth testnet coin ropsten (1eth) limit: 1 req in 1 min and (max 4 eth for  1 address)',
        param: [
            {
                name: 'address',
                type: "string",
                title: 'address',
                necessarily: false,
                default: '0x'
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
};