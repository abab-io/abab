"use strict";
var https = require("https");
var async = require("async");

var db = require('../db');
var config = require('../config');

https.maxConnections = Infinity;
https.globalAgent.maxSockets = 1000;
var _q = async.queue(function (options, onResult) {
    var req = https.request(options, function (res) {
        let output = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            output += chunk;
        });
        res.on('end', function () {
            // var obj;
            try {
                let obj = JSON.parse(output);
                onResult(res.statusCode, obj);
            } catch (e) {

                new db.logsAPI({
                    user_id: 0,
                    method: 'bad_request',
                    param: {options: options},
                    response: {status_code: res.statusCode, output: output, err: e},
                    error: e,
                    user: {
                        not_data: true,
                    },
                    latency_ms: 0,
                    type_req: 'request'
                }).save(function (err, res) {
                    console.error('[HTTPS]=>{' + options.path + '}=>getJSON Error: ', e, 'ErrorReportID', res._id);
                });
                onResult(res.statusCode, null);
            }
        });
    });
    if (options.formData !== undefined)
        req.write(options.formData);

    req.on('error', function (err) {
        if (options.failed == 1) {
            console.error('[HTTPS]=>request Error:\n\t\t', err, '\n\tOptions request:\n\t\t', options, '\n\n    ___________________');
        }
        onResult(999, null);
        setTimeout(function () {
            if (options.failed != 1) {
                options.failed = 1;

                _q.push(options, (http_code, resonseJson) => {
                    if (resonseJson != null) {

                        onResult && onResult(http_code, resonseJson);
                    }
                });
            }
        }, 1000);
    });
    req.end();
}, 10);

var logs_getJson = false;
module.exports.getJSON = function (options, onResult) {

    if (logs_getJson) console.log('getJSON', options.path);
    _q.push(options, (http_code, resonseJson) => {
        onResult && onResult(http_code, resonseJson);
    });
};



