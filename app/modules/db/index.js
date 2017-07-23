var config = require('../config');
var mongoose = require('mongoose');
var mongo_db = mongoose.createConnection(config.get('database:mongodb_url'), {
    useMongoClient: true,
    /* other options */
});
var db;


var Schema = mongoose.Schema;
var schemas = {
    logsAPI: new Schema({

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
    }),
    users: new Schema({

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
        activate_hash: {
            type: String,
            default: null
        },
        password: {
            type: String,
            default: null
        },
        birthday: {
            type: String,
            default: null
        },
        address: {
            type: String,
            default: null
        },
        last_ip: {
            type: String,
            default: null
        },
        api: {
            key: {
                type: String,
                default: null
            },
            secret: {
                type: String,
                default: null
            },
            white_ip: {
                type: String,
                default: '*.*.*.*'
            },
            status: {
                type: Boolean,
                default: false
            }
        },
        settings: {
            type: Schema.Types.Mixed,
        },
        activate: {
            type: Boolean,
            default: false
        },
        create_at: {
            type: Date,
            default: Date.now
        },
        update_at: {
            type: Date,
            default: Date.now
        }
    }),
    wallets: new Schema({

        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },

        active: {
            type: Boolean,
            default: true
        },
        type: {
            type: String,
            default: 'ETH'
        },
        wallet: {
            type: Schema.Types.Mixed,
            default: {},
        },
        create_at: {
            type: Date,
            default: Date.now
        },
        update_at: {
            type: Date,
            default: Date.now
        }
    }),
    tx: new Schema({

        user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },

        currency: {
            type: String,
            default: 'USD',
        },
        tx: {
            type: Schema.Types.Mixed,
            default: {},
        },
        wallet: {
            type: String,
            default: '0x',
        },
        callback_url: {
            type: String,
            default: null,
        },
        nonce: {
            type: Number,
            default: 1
        },
        status: {
            type: Number,
            default: 0 //0- send tx to geth , 1 - wait confirm, 2 -confirm
        },
        create_at: {
            type: Date,
            default: Date.now
        },
        update_at: {
            type: Date,
            default: Date.now
        }
    })
};

module.exports.open = mongo_db;
mongo_db.then(function (db_) {
    db = db_;
    db.on('error', function (err) {
        console.error('Connection error [Mongo DB]:', err.message);
    });

    for (let name in schemas) {
        if (schemas.hasOwnProperty(name)) {
            module.exports[name] = db.model(name, schemas[name]);

        }
    }


    module.exports.Schema = Schema;
    module.exports.mongoose = mongoose;
});