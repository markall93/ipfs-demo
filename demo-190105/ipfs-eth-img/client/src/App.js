import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./utils/getWeb3";

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import "./App.css";

const ipfsClient = require('ipfs-http-client');
const ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' });


const contract = require('truffle-contract');
const simpleStorage = contract(SimpleStorageContract);
let account; //合约调用者账户
let contractInstance; //合约实例

//保存图片到IPFS
let saveImageOnIpfs = (reader) => {
  return new Promise(function(resolve, reject) {
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer).then((response) => {
      console.log(response);
      resolve(response[0].hash);
    }).catch((err) => {
      console.log(err);
      reject(err);
    })
  })
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      blockChainHash: null,
      web3: null,
      address: null,
      imgHash: null,
      isWriteSuccess: false
    }
  }

  componentWillMount() {
    //ipfs集群节点
    ipfs.swarm.peers(function(err,res) {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
      }
    });

    //获取web3实例
    getWeb3.then((results) => {
      this.setState({web3:results.web3});

      //Instantiate contract once web3 provided.
      this.instantiateContract()
    }).catch(() => {
      console.log("Error finding web3.");
    })
  }

  instantiateContract = () => {
    simpleStorage.setProvider(this.state.web3.currentProvider);
    this.state.web3.eth.getAccounts((error, accounts) => {
      account = accounts[0];
      //这个地方可以修改
      simpleStorage.deployed().then((instance) => {
        console.log(instance.address);
        contractInstance = instance;
        this.setState({address: contractInstance.address});
      });
    })
  };

  render() {
    return (
      <div className="App">
        {
          this.state.address
            ? <h1>合约地址:{this.state.address}</h1>
            : <div> </div>
        }
        <h2>上传图片到IPFS:</h2>
        <div>
          <label id="file">Choose file to upload</label>
          <input type="file" ref="file" id="file" name="file" multiple="multiple"/>
        </div>
        <div>
            <button onClick={() => {
                var file = this.refs.file.files[0];
                var reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onloadend = function (e) {
                    console.log(reader);
                    saveImageOnIpfs(reader).then((hash) => {
                        console.log(hash);
                        this.setState({imgHash: hash})
                    });
                }.bind(this);
            }}>将图片上传到IPFS并返回图片hash</button>
        </div>

        {
            this.state.imgHash
                ? <div>
                    <h2>imgHash:{this.state.imgHash}</h2>
                    <button onClick={() => {
                        contractInstance.set(this.state.imgHash, {from:account}).then(() => {
                            console.log("图片的hash已经写入到区块链中!");
                            this.setState({isWriteSuccess: true});
                        })
                    }}>将图片hash写到区块链:conttractInstance.set(imgHash)</button>
                  </div>
                : <div> </div>
        }
        {
            this.state.isWriteSuccess
                ? <div>
                    <h1>图片的hsah已经写入到区块链中!</h1>
                    <button onClick={() => {
                        contractInstance.get({from:account}).then((data) => {
                            console.log(data);
                            this.setState({blockChainHash: data});
                        })
                    }}>从区块链读取图片hash:contractInstance.get()</button>
                  </div>
                : <div> </div>
        }
        {
            this.state.blockChainHash
                ? <div>
                    <h3>从区块链读取到的hash值:{this.state.blockChainHash}</h3>
                  </div>
                : <div> </div>
        }
        {
            this.state.blockChainHash
                ? <div>
                    <h2>浏览器访问:{"http://localhost:/8080/ipfs" + this.state.imgHash}</h2>
                    <img src={"http://localhost:/8080/ipfs" + this.state.imgHash} alt="" style={{width: 800}}/>
                  </div>
                : <img alt=""/>
        }

      </div>);
  }
}

export default App;
