
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://52.178.151.150:8545'));
console.log(web3.toHex({fdsgd:'ggfd',fdsg:{"server": {
    "http": {
        "port": 8000
    },
    "https": {
        "port": 8001
    },
    "ws": {
        "port": 8002
    },
    "url": {
        "path": "/"
    }
}}}));
/**
 * Created by bogdanmedvedev on 23.07.17.
 */
