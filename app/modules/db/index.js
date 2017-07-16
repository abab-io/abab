var mongoose = require('mongoose');
var config = require('../config');
mongoose.connect(config.get('database.mongodb_url'));
var db = mongoose.connection;

db.on('error', function (err) {
    console.error('Connection error [Mongo DB]:', err.message);
});
db.once('open', function callback() {
    console.log("Connection to MongoDB... success");
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

exports.logsAPI = mongoose.model("logsAPI", logsAPI_model);

exports.Schema = Schema;
exports.mongoose = mongoose;