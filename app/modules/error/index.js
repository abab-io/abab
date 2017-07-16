/**
 * Created by bogdanmedvedev on 26.06.16.
 */
'use strict';

var util = require('util');
var log = require('../log');
var config = require('../config');

function PropertyError(message, stopServer) {
    this.name = "Application Error";

    // this.property = property;
    this.message = message;

    if (Error.captureStackTrace) {
        Error.stackTraceLimit = 15;
        Error.captureStackTrace(this, PropertyError);
    } else {
        this.stack = (new Error()).stack;
    }
    log.error('\n' + this.stack);
    if (stopServer)

        setTimeout(()=> {
            process.exit(500);
        }, 100);

}


PropertyError.prototype = Object.create(Error.prototype);
module.exports = PropertyError;