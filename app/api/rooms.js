/**
 * Created by bogdanmedvedev on 24.07.17.
 */

module.exports = (API, redis) => {
    API.on('CreateRoom', true,(user, param, callback) => {

    }, {
        title: '',
        description: '',
        param: [
            {
                name: 'from',
                type: "string",
                title: 'address',
                necessarily: false,
                default: '0x'
            },
            {
                name: '_roomIndex',
                type: "string",
                title: 'address',
                necessarily: false,
                default: '0x'
            },

        ],
        response: [
            {name: 'success', type: "string", title: 'Success ?', default: 'true, false'},
            {name: 'txHash', type: "string", title: 'HASH transaction blockchain', default: '0x*******'},
            {name: 'error', type: "object", title: '', default: 'ERROR'},
            {name: 'latency_ms', type: "int(11)", title: 'Processing time of the request in ms', default: '122'}
        ]
    });

};