module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    live: {
      host: "52.178.151.150", // Random IP for example purposes (do not use)
      port: 8545,
      network_id: 1,        // Ethereum public network
      // optional config values:
      // gas
      // gasPrice
      from: "0x3aD5b3036123035f01938C64152817aD5BefbEC2"
      // provider - web3 provider instance Truffle should use to talk to the Ethereum network.
      //          - if specified, host and port are ignored.
    }
  }
};
