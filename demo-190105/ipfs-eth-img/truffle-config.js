const path = require("path");

module.exports = {
  // See <https://truffleframework.com/docs/truffle/reference/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    }
  },
   compilers: {
    solc: {
      version: '0.4.24'
    }
  }
};
