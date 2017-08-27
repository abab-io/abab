// const Web3 = require('web3');
// const web3 = new Web3();
// web3.setProvider(new web3.providers.HttpProvider('http://52.178.151.150:8545'));
// const crypto = require('crypto');
//
//
// const keythereum = require("keythereum");
// const Tx = require('ethereumjs-tx');
// const util = require('ethereumjs-util');
// const md5 = require('md5');
//
// const _ = require('lodash');
// const SolidityFunction = require('web3/lib/web3/function');
// const sol_config = require('./config.sol');
//
// var contract = web3.eth.contract(sol_config._abi).at(sol_config._address);
// // contract.GetScheduleByIndex.apply(null,['0xa1b1d9551211755165a677c5e9d4b1041f4b5fd6',0,function (error, result) {
// //     console.log('result: ', result, error,_.find(sol_config._abi, {name: 'GetScheduleByIndex'}));
// // }]);
// console.log(_.find(sol_config._abi, {name: 'DateIsFree',statemutability:'view'}));

var GooglePlaces = require('google-places');

var places = new GooglePlaces("AIzaSyBdhvXM0GiPDf6_-KdeHZmxrtbR4hG8bIc");

const async = require('async');

places.autocomplete({input: 'каfsdgdsagsdgза'}, function (err, response) {
    let result = [];
    async.map(response.predictions, function (data,callback) {
        places.details({reference: data.reference}, function (err, response) {
            let coutry = '';
            let district = null;
            for (let key in response.result.address_components) {
                if (response.result.address_components[key].types[0] === 'country')
                    coutry = response.result.address_components[key].long_name;
                if (response.result.address_components[key].types[0] === 'administrative_area_level_1')
                    district = response.result.address_components[key].long_name;

            }
            if (response.result.types[0] === 'country' || response.result.types[0] === 'locality') {
                console.log("did you mean: ", response.result.name, response.result, coutry);
                callback(null,{city:response.result.name,district:district,coutry:coutry});
            }else{
                callback()
            }
        });
    }, function(err, results) {
        let scan_res = results.filter(function (item) {
            if(item) return true;
            return false;
        });
       console.log(scan_res);
    });

});