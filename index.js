'use strict';

const EthereumTx = require('ethereumjs-tx').Transaction;
var keythereum = require("keythereum");
const Common = require('ethereumjs-common').default;
var fs = require("fs");
var Web3 = require('web3');

var TransferTx = require('./untils/index')
var Error = require('./untils/errors')

//返回JSon里面的信息和密钥
// 存放json文件目录要在keystore

function GetJsonInfo(address,password,dataDir){
    let keyObject;
    if(address.length == 42){
        keyObject = keythereum.importFromFile(address.slice(2),dataDir);
    }else{
        keyObject = keythereum.importFromFile(address,dataDir);
    }
    let privateKey = keythereum.recover(password, keyObject);
    let jsonInfo = new Object();
    jsonInfo.keyObject = keyObject;
    jsonInfo.privateKey = privateKey;   
    return jsonInfo;
}
module.exports = GetJsonInfo;

// 获取 nonce
async function getNonce(web3,address){
    let nonceCnt = await web3.eth.getTransactionCount(address);
    return nonceCnt;
}
async function customChain(web3,name){
    let networkId = await web3.eth.net.getId();
    let chainId = await web3.eth.getChainId();
    const customCommon = Common.forCustomChain(
        
       'mainnet',
        {
          name: name,
          networkId: networkId,
          chainId: chainId,
        },
        'petersburg',
    )
    return customCommon;
}
// eth签名
async function SignTransfer(web3,name,dataDir,address,password,toAddress,ethCount,gasPrice,gasLimit){
    
    if(!address || address.length !== 42){
        return 'address错误'
    }else if(!toAddress || toAddress.length !== 42){
        return 'toAddress错误'
    }
    // 交易体
    let nonce = await getNonce(web3,address);
    let rawTx = new TransferTx.EthTransferTX(
        nonce,
        toAddress,
        gasPrice > 10 ? web3.utils.toHex(web3.utils.toWei(gasPrice, 'gwei')) : web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
        gasLimit > 21000 ? web3.utils.toHex(gasLimit) : web3.utils.toHex(21000),
        web3.utils.toHex(web3.utils.toWei(ethCount.toString(), 'ether')),
    );
    let customCommon = await customChain(web3,name);
    let tx = new EthereumTx(rawTx,{ common: customCommon });
    let jsonInfo = GetJsonInfo(address.length == 42 ? address.slice(2) : address,password,dataDir);
    let privateKey = jsonInfo.privateKey;
    tx.sign(privateKey);
    let serializedTx = tx.serialize();
    
    return serializedTx; 
}
module.exports = SignTransfer;

// 发送签名交易
async function SendSignedTransfer(web3,serializedTx){
    try {
        let res = await web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'));
        return res;
    } catch (err) {
        return Error(err);
    }
}
module.exports = SendSignedTransfer;


// 创建合约
function createNewContract(web3,dataABI,tokenAddress,gasPrice){
    let myContract = new web3.eth.Contract(JSON.parse(dataABI), tokenAddress.length ==42 ? tokenAddress:'0x'+tokenAddress, {gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice.toString(), 'gwei')),});
    return myContract;
}
// 读取ABI
async function ReadJsonABI(web3,path,format,tokenAddress,toAddress,count,gasPrice){
    let constractABI = await fs.readFileSync(path, format);
    let contract = createNewContract(web3,constractABI,tokenAddress,gasPrice);
    const data = await contract.methods.transfer(toAddress,count).encodeABI();
    return data;
}
module.exports = ReadJsonABI;
// constract签名
async function ConstractSignTransfer(web3,name,dataDir,fromAddress,password,tokenAddress,gasPrice,gasLimit,data){
    if(!fromAddress || fromAddress.length !== 42){
        return 'fromAddress错误'
    }else if(!tokenAddress || tokenAddress.length !== 42){
        return 'tokenAddress错误'
    }
    // 交易体
    let nonce = await getNonce(web3,fromAddress);
    let rawTx = new TransferTx.ConstractTransferTx(
        nonce,
        tokenAddress,
        gasPrice > 10 ? web3.utils.toHex(web3.utils.toWei(gasPrice.toString, 'gwei')) : web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
        gasLimit > 53000 ? web3.utils.toHex(gasLimit) : web3.utils.toHex(53000),
        fromAddress,
        data);
    let customCommon = await customChain(web3,name);
    const tx = new EthereumTx(rawTx,{ common: customCommon });
    let jsonInfo = GetJsonInfo(fromAddress.length == 42 ? fromAddress.slice(2) : fromAddress,password,dataDir);
    let privateKey = jsonInfo.privateKey;
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    return serializedTx;
    
}
module.exports = ConstractSignTransfer;
// 合约交易
async function SendConstractSignedTransfer(web3, serializedTx){
    
    try {
        let res = await web3.eth.sendSignedTransaction('0x'+serializedTx.toString('hex'));
        return res;
    } catch (err) {
        return Error(err);
    }
}

module.exports = SendConstractSignedTransfer;




// async function main(){
//     var web3 = new Web3(Web3.givenProvider || 'https://data-seed-prebsc-1-s1.binance.org:8545/');
//      let res = await SignTransfer(web3,'test','./','0xc3ddA49F98F73004b1ed14d3570bA2a983c0caCe','youjiahua123','0xff423c59177571cbeFe13da643c507BD8fDf3Ec8',0.1)
//      let aa = await SendSignedTransfer(web3,res);
//     // let ress =  await _constractSignTransfer('0xc3ddA49F98F73004b1ed14d3570bA2a983c0caCe','youjiahua123','0xff423c59177571cbeFe13da643c507BD8fDf3Ec8','0x5dbE06a497e459A1078C68C5FAC236EF814D7286',10000,10,100000)
//     let data = await ReadJsonABI(web3,"./erc20.json",'utf-8','0x5dbE06a497e459A1078C68C5FAC236EF814D7286','0xff423c59177571cbeFe13da643c507BD8fDf3Ec8',10000,10)
//     let ress =  await ConstractSignTransfer(web3,'test','./','0xc3ddA49F98F73004b1ed14d3570bA2a983c0caCe','youjiahua123','0x5dbE06a497e459A1078C68C5FAC236EF814D7286',10,100000,data);
//     await SendConstractSignedTransfer(web3,ress);
// }
// main()

