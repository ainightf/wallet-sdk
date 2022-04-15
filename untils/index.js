class TransferTx {
    constructor(nonce,toAddress){
        this.nonce = nonce;
        this.to = toAddress;
    }
}
class EthTransferTX extends TransferTx{
    constructor(nonce,toAddress,gasPrice,gasLimit,ethCount){
        super(nonce,toAddress);
        this.value =ethCount;
        this.gasPrice = gasPrice ;
        this.gasLimit = gasLimit ;
    }
    
}
class ConstractTransferTx extends TransferTx{
    constructor(nonce,toAddress,gasPrice,gasLimit,fromAddress,data){
        super(nonce,toAddress);
        this.from = fromAddress;
        this.gasPrice = gasPrice;
        this.gasLimit = gasLimit;
        this.data = data
    }
}

module.exports = {EthTransferTX,ConstractTransferTx};