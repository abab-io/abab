const _ = require('lodash');
const sol_config = require('../../config.sol');
const error = require('../modules/error/api');

module.exports = (API, redis) => {

    let contractFn = _.filter(sol_config._abi, {type: 'function', statemutability: 'view'});
    if (contractFn && typeof contractFn === 'object' && contractFn.length > 0) {
        for (let key in contractFn) {
            let docs = {
                title: contractFn[key].name + 'Export function in ABI ',
                description: 'Export  in ABI statemutability view, type function method validate param and output json  ',
                param: [],
                response: [
                    {name: 'success', type: "string", title: 'Success ?', default: 'true, false'},
                    {name: 'error', type: "object", title: '', default: 'ERROR'},
                    {name: 'latency_ms', type: "int(11)", title: 'Processing time of the request in ms', default: '122'}
                ]
            };
            for (let i1 in contractFn[key].inputs) {
                let name_param = contractFn[key].inputs[i1].name;
                if (!name_param || name_param === '') name_param = 'param_' + i1;
                docs.param.push({
                    name: name_param,
                    type: contractFn[key].inputs[i1].type,
                    title: 'return in contract func',
                    default: '',
                    necessarily: true
                })

            }
            for (let i2 in contractFn[key].outputs) {
                docs.response.push({
                    name: 'result.' + contractFn[key].outputs[i2].name,
                    type: contractFn[key].outputs[i2].type,
                    title: 'return in contract func',
                    default: '0'
                })
            }
            API.on('fn_' + contractFn[key].name, true, (user, param, callback) => {
                let method = param.method.split('_fn_')[1];
                let contractABI = _.find(sol_config._abi, {name: method});
                if (!contractABI || contractABI.type !== 'function') {
                    return callback && callback(null, {
                            error: error.api('Request function is not found function contract', 'param', {
                                pos: 'api/contract.js(' + param.method + '):#autogenerate_API_function :1',
                                param: param
                            }, 0),
                            success: false
                        });
                }
                let callParam = [];
                for (let i_in in contractABI.inputs) {
                    let name_param = contractABI.inputs[i_in].name;
                    if (!name_param || name_param === '') name_param = 'param_' + i_in;
                    if (!param[name_param]) {
                        return callback && callback(null, {
                                error: error.api('Request param is not found', 'param', {
                                    pos: 'api/contract.js(' + param.method + '):#autogenerate_API_function :2',
                                    param: param,
                                    param_name_err: name_param,
                                    contractABI_param: contractABI.inputs[i_in],
                                }, 0),
                                success: false
                            });
                    }
                    callParam.push(param[name_param]);
                }

                API.emit('public_callFunctionContract', user, {
                    function: method,
                    param: callParam
                }, function (err, res) {
                    let response = {};
                    for (let i_out in  contractABI.outputs) {
                        let name_param = contractABI.outputs[i_out].name;
                        if (name_param === '') name_param = 'index_' + i_out;
                        if (!res[i_out])
                            response[name_param] = res.toString();
                        else
                            response[name_param] = res[i_out].toString();
                    }

                    callback && callback(null, {success: true,result:response});
                });
            }, docs);

        }
    }
};
