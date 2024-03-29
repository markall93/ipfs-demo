import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';

var ipfsClient = require('ipfs-http-client');
var ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' });

let saveImageOnIpfs = (reader) => {
  return new Promise(function(resolve, reject) {
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer).then((response) => {
      console.log(response);
      resolve(response[0].hash);
    }).catch((err) => {
      console.error(err);
      reject(err);
    })
  })
}

class App extends Component {
  //构造函数
  constructor(props) {
    super(props)
    this.state = {
      imgSrc: null
    }
  }
  render() {
    return (
      <div className="App">
        <h2>上传图片到IPFS:</h2>
        <div>
          <label id="file">Choose file to upload</label>
          <input type="file" ref="file" id="file" name="file" multiple="multiple"/>
        </div>
        <div>
          <button onClick={() => {
            var file = this.refs.file.files[0];
            console.log(file);
            var reader = new FileReader();
            // reader.readAsDataURL(file);
            reader.readAsArrayBuffer(file)
            reader.onloadend = (e) => {
              console.log(reader);
              //上传图片到IPFS
              saveImageOnIpfs(reader).then((hash) => {
                console.log(hash);
                this.setState({imgSrc: hash})
              });
            }
          }}>Submit</button>
        </div>
        {
          this.state.imgSrc
            ? <div>
                <h2>{"http://localhost:8080/ipfs/" + this.state.imgSrc}</h2>
                <img alt="区块链部落" style={{width:100}} src={"http://localhost:8080/ipfs/" + this.state.imgSrc}/>
              </div>
            : <img alt=""/>
        }
      </div>);
  }
}

export default App;
