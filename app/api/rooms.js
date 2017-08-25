/**
 * Created by bogdanmedvedev on 24.07.17.
 */
const db = require('../modules/db');
const error = require('../modules/error/api');
const aws = require('../modules/aws-amazon-s3');
const crypto = require('crypto');
var moment = require('moment');
module.exports = (API, redis) => {
    API.on('GetRooms', true, (user, param, callback) => {
        let findPram = {};
        if (param.find && typeof param.find === 'object') findPram = param.find;
        try {
            if (findPram._id) findPram._id = db.mongoose.Types.ObjectId(findPram._id);
        } catch (e) {
            return callback && callback(null, {
                    error: error.api('param.find._id is not valid', 'param', e, 0),
                    success: false
                });
        }
        db.rooms.find(findPram).then(function (documents) {


            return callback && callback(null, {
                    rooms: documents,
                    success: true
                });
        }).catch(function (err) {
            return callback && callback(null, {
                    error: error.api(err.message, 'db', err, 5),
                    success: false
                });

        });

    }, {}, {
        title: 'Get Rooms',
        description: 'Get all Rooms',
        param: [],
        response: []
    });
    API.on('UpsertRoom', (user, param, callback) => {
        if (param.dateRanges && typeof param.dateRanges !== 'string' && typeof param.dateRanges !== 'object') {
            return callback && callback(null, {
                    error: error.api('Request param "dateRanges" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#1',
                        param: param
                    }, 0),

                    success: false
                });
        }

        if (param.photo && typeof param.photo !== 'string' && typeof param.photo !== 'object') {
            return callback && callback(null, {
                    error: error.api('Request param "photo" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#2',
                        param: param
                    }, 0),

                    success: false
                });
        }
        if (param.title && typeof param.title !== 'string') {
            return callback && callback(null, {
                    error: error.api('Request param "title" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#3',
                        param: param
                    }, 0),

                    success: false
                });
        }

        if (param.description && typeof param.description !== 'string') {
            return callback && callback(null, {
                    error: error.api('Request param "description" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#4',
                        param: param
                    }, 0),

                    success: false
                });
        }
        if (param.address_country && typeof param.address_country !== 'string') {
            return callback && callback(null, {
                    error: error.api('Request param "address_country" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#5',
                        param: param
                    }, 0),

                    success: false
                });
        }
        if (param.address_country && typeof param.address_country !== 'string') {
            return callback && callback(null, {
                    error: error.api('Request param "address_country" incorrect', 'param', {
                        pos: 'api/rooms.js(UpsertRoom):#6',
                        param: param
                    }, 0),

                    success: false
                });
        }
        if (!param.facilities) param.facilities = [];
        try {
            if (param.dateRanges && typeof param.dateRanges === 'string')
                param.dateRanges = JSON.parse(param.dateRanges);
            if (param.photo && typeof param.photo === 'string')
                param.photo = JSON.parse(param.photo);
            if (param.facilities && typeof param.facilities === 'string')
                param.facilities = JSON.parse(param.facilities);

        } catch (e) {
            return callback && callback(null, {
                    error: error.api('Error parse param dateRanges or photo or facilities not array', 'param', e, 0),
                    success: false
                });
        }

        if (param.dateRanges) {
            for (let i in param.dateRanges) {
                param.dateRanges[i].txHash = null;
                param.dateRanges[i].txStatus = 1;
            }
        }
        if (!param._id && !param._index) {
            new db.rooms({

                user: db.mongoose.Types.ObjectId(user._id),
                title: param.title,
                description: param.description,
                photo: param.photo,
                wallet: param.wallet,
                bathroom: param.bathroom,
                bathroom_count: param.bathroom_count,
                bed_count: param.bed_count,
                bedroom_count: param.bedroom_count,
                children_count: param.children_count,
                limit_time_min: param.limit_time_min,
                limit_time_max: param.limit_time_max,
                people_count: param.people_count,
                startTimeCheckIn: param.startTimeCheckIn,
                startTimeCheckOut: param.startTimeCheckOut,
                endTimeCheckIn: param.endTimeCheckIn,
                endTimeCheckOut: param.endTimeCheckOut,
                // dateRanges: param.dateRanges,
                address: {
                    country: param.address_country,
                    state: param.address_state,
                    city: param.address_city,
                    street: param.address_street,
                    address: param.address_address,
                    index: param.address_index,
                },
                facilities: param.facilities,
                location: [param.location_latitude, param.location_longitude],
                txHash: null,
                status: param.status //0 - draft , 1 - wait confirm, 2 - send to blockchain, 3 -success public
            }).save().then(function (document) {

                for (let i in  param.dateRanges) {


                    new db.scheduleRoom({
                        room: db.mongoose.Types.ObjectId(document._doc._id),
                        _scheduleIndex: null,
                        startDate: moment.utc(param.dateRanges[i].startDate, 'DD.MM.YY').toDate(),
                        endDate: moment.utc(param.dateRanges[i].endDate, 'DD.MM.YY').toDate(),
                        dayPrice: +(+param.dateRanges[i].priceDay).toFixed(8),
                        weekPrice: +(param.dateRanges[i].priceDay - (param.dateRanges[i].priceDay * param.dateRanges[i].discountWeek / 100)).toFixed(8),
                        monthPrice: +(param.dateRanges[i].priceDay - (param.dateRanges[i].priceDay * param.dateRanges[i].discountMonth / 100)).toFixed(8),
                        discountWeek: 1 * (1 * param.dateRanges[i].discountWeek).toFixed(8),
                        discountMonth: 1 * (1 * param.dateRanges[i].discountMonth).toFixed(8),
                        intervalDate: null,
                        tx: {
                            status: 1,
                            hash: null,
                        }
                    }).save();

                }
                // bathroom
                // bathroom_count
                // bed_count
                // bedroom_count
                // children_count
                // dateRanges
                // endTimeCheckIn
                // endTimeCheckOut
                // facilities
                // limit_time_max
                // limit_time_min
                // people_count
                // startTimeCheckIn
                // startTimeCheckOut
                return callback && callback(null, {
                        room: filterObject(document._doc, [
                            '_id',
                            '_index',
                            '_hash',
                            'bathroom',
                            'bathroom_count',
                            'bed_count',
                            'bedroom_count',
                            'children_count',
                            'endTimeCheckIn',
                            'endTimeCheckOut',
                            'startTimeCheckIn',
                            'startTimeCheckOut',
                            'facilities',
                            'people_count',
                            'limit_time_min',
                            'limit_time_max',
                            'title',
                            'description',
                            'photo',
                            'wallet',
                            'dateRanges',
                            'address',
                            'location',
                            'status',
                            'update_at',
                        ]),
                        success: true
                    });
            }).catch(function (err) {
                return callback && callback(null, {
                        error: error.api(err.message, 'db', err, 5),
                        success: false
                    });

            });
        } else {


            if (param._id && typeof param._id === 'string') {
                db.rooms.findOne({_id: db.mongoose.Types.ObjectId(param._id)}).then(function (document) {
                    if (!document) {
                        return callback && callback(null, {
                                error: error.api('room not found', 'param', {pos: 'rooms.js#10'}, 0),
                                success: true
                            });
                    }
                    if (param.status && +param.status === 2) {
                        let _document = filterObject(document._doc, [
                            '_id',
                            'title',
                            'bathroom',
                            'bathroom_count',
                            'bed_count',
                            'bedroom_count',
                            'children_count',
                            'endTimeCheckIn',
                            'endTimeCheckOut',
                            'startTimeCheckIn',
                            'startTimeCheckOut',
                            'facilities',
                            'people_count',
                            'limit_time_min',
                            'limit_time_max',
                            'description',
                            'photo',
                            'wallet',
                            'address',
                            'location',
                            'update_at',
                        ]);
                        let _hash = '0x' + crypto.createHash('sha1').update(JSON.stringify(_document)).digest('hex');
                        aws.upload_json(_hash + '.json', _document, function () {
                            API.emit('requestFunctionContract', user, {
                                from: document.wallet,
                                function: 'UpsertRoomFromHost',
                                param: "999999999," + _hash + ",0x0,0,1,0"
                            }, function (err, res) {
                                if (res.success === false) {
                                    return callback && callback(null, res);
                                }
                                db.rooms.findOneAndUpdate({_id: db.mongoose.Types.ObjectId(param._id)}, {
                                    txHash: res.result.tx.hash,
                                    tx: db.mongoose.Types.ObjectId(res.result._id),
                                    _hash: _hash,
                                    status: 2
                                }, {new: true}).then(function (document) {
                                    return callback && callback(null, {
                                            room: filterObject(document._doc, [
                                                '_id',
                                                '_index',
                                                '_hash',
                                                'title',
                                                'bathroom',
                                                'bathroom_count',
                                                'bed_count',
                                                'bedroom_count',
                                                'children_count',
                                                'endTimeCheckIn',
                                                'endTimeCheckOut',
                                                'startTimeCheckIn',
                                                'startTimeCheckOut',
                                                'facilities',
                                                'people_count',
                                                'limit_time_min',
                                                'limit_time_max',
                                                'description',
                                                'photo',
                                                'wallet',
                                                'dateRanges',
                                                'address',
                                                'location',
                                                'status',
                                                'txHash',
                                                'update_at',
                                            ]),
                                            document: document,
                                            success: true
                                        });
                                }).catch(function (err) {
                                    return callback && callback(null, {
                                            error: error.api(err.message, 'db', err, 5),
                                            success: false
                                        });
                                });
                            });
                        });
                    } else
                        return callback && callback(null, {
                                room: document,
                                success: true
                            });


                }).catch(function (err) {
                    return callback && callback(null, {
                            error: error.api(err.message, 'db', err, 5),
                            success: false
                        });
                });

            }


            if (param._index && typeof param._index === 'string') {
                return callback && callback(null, {
                        error: error.api('api in develoment', 'server', {pos: 'rooms.js#11'}, 0),
                        success: true
                    });
            }
        }
    }, {
        title: 'Create or update Room',
        description: 'if transfer param _id or _index update room other create new room and return _id room ',
        param: [
            {name: '_id', type: "string", title: '_id room ', default: ''},
            {name: '_index', type: "string", title: '_index room of blockchain if status >2', default: ''},

            {name: 'title', type: "string", title: 'title room', default: ''},
            {name: 'description', type: "string", title: 'description room', default: ''},
            {name: 'photo', type: "Array", title: 'photo room array hash', default: '[]'},
            {name: 'wallet', type: "string", title: 'address creater', default: '0x'},
            {
                name: 'dateRanges',
                type: "Array",
                title: 'Date range array ',
                default: '[{from:Date,to:Date,price:0},...]'
            },
            {name: 'address_country', type: "string", title: 'country', default: ''},
            {name: 'address_state', type: "string", title: 'state', default: ''},
            {name: 'address_city', type: "string", title: 'city', default: ''},
            {name: 'address_street', type: "string", title: 'street', default: ''},
            {name: 'address_address', type: "string", title: 'address', default: ''},
            {
                name: 'status',
                type: "int",
                title: '0 - draft , 1 - wait confirm, 2 - send to blockchain, 3 -success publick',
                default: '0'
            },
            {name: 'location_latitude', type: "int", title: 'coordinates latitude', default: '0'},
            {name: 'location_longitude', type: "int", title: 'coordinates longitude', default: '0'},

        ],
        response: [
            {name: '_id', type: "string", title: '_id room ', default: ''},
            {name: '_index', type: "string", title: '_index room of blockchain', default: ''},
            {name: 'title', type: "string", title: 'title room', default: ''},
            {name: 'description', type: "string", title: 'description room', default: ''},
            {name: 'photo', type: "Array", title: 'photo room array', default: '[]'},
            {name: 'wallet', type: "string", title: 'address creater', default: '0x'},
            {
                name: 'dateRanges',
                type: "Array",
                title: 'Date range array ',
                default: '[{from:Date,to:Date,price:0},...]'
            },
            {name: 'address_country', type: "string", title: 'country', default: ''},
            {name: 'address_state', type: "string", title: 'state', default: ''},
            {name: 'address_city', type: "string", title: 'city', default: ''},
            {name: 'address_street', type: "string", title: 'street', default: ''},
            {name: 'address_address', type: "string", title: 'address', default: ''},
            {
                name: 'status',
                type: "int",
                title: '0 - draft , 1 - wait confirm, 2 - send to blockchain, 3 -success publick',
                default: '0'
            },
            {name: 'location_latitude', type: "int", title: 'coordinates latitude', default: '0'},
            {name: 'location_longitude', type: "int", title: 'coordinates longitude', default: '0'},
            {name: 'success', type: "string", title: 'Success ?', default: 'true, false'},
            {
                name: 'txHash',
                type: "string",
                title: 'HASH transaction blockchain if status >2 else null',
                default: '0x*******'
            },
            {name: 'error', type: "object", title: '', default: 'ERROR'},
            {name: 'latency_ms', type: "int(11)", title: 'Processing time of the request in ms', default: '122'}
        ]
    });

    API.on('Booking', (user, param, callback) => {
        let findPram = {};
        if (!findPram._id){

        }
        if (findPram._id) findPram._id = db.mongoose.Types.ObjectId(findPram._id);

        try {
        } catch (e) {
            return callback && callback(null, {
                    error: error.api('param.find._id is not valid', 'param', e, 0),
                    success: false
                });
        }
        db.rooms.find(findPram).then(function (documents) {


            return callback && callback(null, {
                    rooms: documents,
                    success: true
                });
        }).catch(function (err) {
            return callback && callback(null, {
                    error: error.api(err.message, 'db', err, 5),
                    success: false
                });

        });

    }, {
        title: 'Booking Room',
        description: 'Booking room',
        param: [
            {name: '_id', type: "string", title: '_id or _roomIndex', default: ''},
            {name: '_roomIndex', type: "string", title: '_roomIndex or _id', default: ''},
            {name: 'wallet', type: "string", title: 'address creater', default: '0x'},

            {name: 'from', type: "int", title: 'date from', default: '0'},
            {name: 'to', type: "int", title: 'date to', default: '0'},

        ],
        response: [
            {name: 'success', type: "string", title: 'Success ?', default: 'true, false'},
            {
                name: 'txHash',
                type: "string",
                title: 'HASH transaction blockchain if status >2 else null',
                default: '0x*******'
            },
            {name: 'error', type: "object", title: '', default: 'ERROR'},
            {name: 'latency_ms', type: "int(11)", title: 'Processing time of the request in ms', default: '122'}
        ]
    });


};