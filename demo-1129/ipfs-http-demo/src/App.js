import React, {Component} from 'react';
import './App.css';

var ipfsClient = require('ipfs-http-client');

var ipfs = ipfsClient({
  host: 'localhost',
  port: '5001',
  protocol: 'http'
});

//将Uint8Array转换为string字符串
function Uint8ArrayToStr(array) {
  var dataString = "";
  for (var i = 0; i < array.length; i++) {
    dataString += String.fromCharCode(array[i]);
}
  return dataString
}

class App extends Component {

  //构造函数
  constructor(props) {
    super(props);
    this.state = {
      strHash: null,
      strContent: null
    }
  }

  //把文本数据保存到ipfs上
  saveTextBlobOnIpfs = (blob) => {
    return new Promise(function(resolve, reject) {
      const descBuffer = Buffer.from(blob, 'utf-8');
      ipfs.add(descBuffer).then((response) => {
        console.log(response)
        resolve(response[0].hash);
      }).catch((err) => {
        console.error(err)
        reject(err);
      })
    })
  }

  render() {
    return ( <div className = "App" >
      <h1 > 区块链 北风网 < /h1>
      <input ref = "ipfsContent"
      style = {
        {
          width: 200,
          height: 50
        }
      }/>
      <button onClick = {
        () => {
          // console.log("将数据提交到IPFS");
          let ipfsContent = this.refs.ipfsContent.value;
          console.log(ipfsContent);
          this.saveTextBlobOnIpfs(ipfsContent).then((hash) => {
            console.log(hash);
            this.setState({
              strHash: hash
            });
          });
        }
      }
      style = {
        {
          height: 50
        }
      } > "将数据提交到IPFS" < /button>

      <
      p > {
        this.state.strHash
      } < /p>

      <
      button onClick = {
        () => {
          console.log('从ipfs读取数据。')
          //从IPFS读取数据
          ipfs.cat(this.state.strHash).then((stream) => {
            console.log(stream);
            //stream为Uint8Array类型的数据
            let strContent = Uint8ArrayToStr(stream);
            console.log(strContent);
            this.setState({strContent: strContent});
          });
        }
      } > 读取数据 < /button> <
      h1 > {
        this.state.strContent
      } < /h1> <
      /div>
    );
  }
}

export default App;
