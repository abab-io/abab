/**
 * Created by bogdanmedvedev on 13.07.17.
 */
const os = require('os');
global._path_root = __dirname + '/';

const config = require('./app/modules/config');
const express = require('./app/modules/express');
console.log('\n*Starting...*');

setTimeout(function () {
    console.log('\n*******************************************************');
    console.info('Abab.io Server started.\n\t'+os.cpus()[0].model+' x'+os.cpus().length+'\n\tProcess pid:'+process.pid+'\n\tPlatform OS:'+process.platform+'\n\tNodeJS version: '+process.version+''+'\n\tHTTP port: '+config.get('server:http:port')+'');
    console.log('*******************************************************\n\n');

},300);
