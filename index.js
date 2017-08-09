/**
 * Created by bogdanmedvedev on 13.07.17.
 */
const os = require('os');
global._path_root = __dirname + '/';

const config = require('./app/modules/config');
const db = require('./app/modules/db');
const mail = require('./app/modules/mail');
global.filterObject = function (obj,filterArr) {
    let result = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key) && +filterArr.indexOf(key) !== -1) {
            result[key] = obj[key];
        }
    }
    return result;
};

db.open.then(function () {
    console.log('\n*******************************************************');
    console.info('Abab.io Server started.\n\t' + os.cpus()[0].model + ' x' + os.cpus().length + '\n\tProcess pid:' + process.pid + '\n\tPlatform OS:' + process.platform + '\n\tNodeJS version: ' + process.version + '' + '\n\tHTTP port: ' + config.get('server:http:port') + '\n\tMongoDB: ' + 'Connected.' + '');
    console.log('*******************************************************\n\n');


    const express = require('./app/modules/express');
});