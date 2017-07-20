var config = require('../config');
var mongoose = require('mongoose');
var mongo_db = mongoose.createConnection(config.get('database:mongodb_url'), {
    useMongoClient: true,
    /* other options */
});
var db;
mongo_db.then(function (db_) {
    db = db_;
    db.on('error', function (err) {
        console.error('Connection error [Mongo DB]:', err.message);
    });
    db.once('open', function callback() {
        console.log("Connection to MongoDB... success");
    });
});


var Schema = mongoose.Schema;
var logsAPI_model = new Schema({

    user_id: {
        type: Number,
        index: true
    },
    method: {
        type: String,
        default: null
    },
    param: {
        type: Schema.Types.Mixed,
    },
    response: {
        type: Schema.Types.Mixed,
    },
    error: {
        type: Schema.Types.Mixed,
        default: null,
    },
    user: {
        type: Schema.Types.Mixed,
    },
    latency_ms: {
        type: String,
        default: null
    },

    type_req: {
        type: String,
        default: null
    },
    create_at: {
        type: Date,
        default: Date.now
    }
});

var users = new Schema({

    email: {
        type: String,
        default: null,
        index: true
    },
    phone: {
        type: String,
        default: null,
        index: true
    },
    name: {
        type: String,
        default: null
    },
    surname: {
        type: String,
        default: null
    },
    birthday:{
        type: String,
        default: null
    },
    address:{
        type: String,
        default: null
    },
    last_ip:{
        type: String,
        default: null
    },
    settings:{
        type: Schema.Types.Mixed,
    },
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    }
});

exports.logsAPI = mongoose.model("logsAPI", logsAPI_model);
exports.users = mongoose.model("users", users);

exports.Schema = Schema;
exports.mongoose = mongoose;