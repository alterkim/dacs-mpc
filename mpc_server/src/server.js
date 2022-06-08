const express = require('express');
const server = express();
const port = 3002;
const cors = require('cors');

const execSync = require('child_process').execSync;

const publicToAddress = require('ethereum-public-key-to-address');

const bodyParser = require('body-parser');

const Web3 = require('web3');
const Tx = require('@ethereumjs/tx').Transaction;
const Common = require('@ethereumjs/common').default;
const web3 = new Web3(new Web3.providers.HttpProvider('http://141.223.181.204:8545'));


server.get('/',(_,res) => {
    res.send("MPC backend server");
});

server.get('/keygen', (req,res) => {
    const threshold = 1;
    const number = 3;
    const command = `t=${threshold} && n=${number}; for i in $(seq 1 $n)\n do ~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/tss_cli keygen ~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/keys$i.store $t/$n --addr http://127.0.0.1:8008 &\n sleep 2\n done`;
    const result = execSync(command);

    res.end(result.toString());
});

server.get('/sign', (req,res) => {
    const threshold = 1;
    const number = 3;
    const required = 2;
    const data = req.query.data;
    console.log(data);
    // const data = "fa98e1e91d9cc39925757c5d440d91b8285a610eb48c23c3a6afb352cd4fe310";
    const command = `t=${threshold} && n=${number} && required=${required} && data=${data}; for i in $(seq 1 $required)\n do ~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/tss_cli sign ~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/keys$i.store --addr http://127.0.0.1:8008 $t/$required $data &\n sleep 2\n done`;
    const result = execSync(command);
    const split_res = result.toString().split('\n')[0]
    const obj = JSON.parse(split_res);

    const addressFrom = req.query.from;
    const addressTo = req.query.to;
    const value = req.query.value;
    
    web3.eth.getTransactionCount(addressFrom, function(error, transactionCount) {
        if(error) {
            console.log("Transaction Count error",error);
        } else {
            console.log(transactionCount);

            const customCommon = Common.forCustomChain(
                'mainnet',
                {
                  name: 'private-blockchain',
                  networkId: 20210427,
                  chainId: 20210427
                },
                'istanbul'
            );

            const txData = {
                nonce : web3.utils.toHex(transactionCount),
                gasLimit: web3.utils.toHex(21000),
                gasPrice: web3.utils.toHex(web3.utils.toWei("10","gwei")), 
                to: addressTo,
                chainId: 20210427,
                value: web3.utils.toHex(web3.utils.toWei(value, 'ether')),
                data : ''
            };
              

            const signatureTxdata = {
                ...txData,
                r : "0x" + obj.r,
                s : "0x" + obj.s, 
                v : obj.v + 40420889
            }

            const signedTx = Tx.fromTxData(signatureTxdata,{common:customCommon});

            const from = signedTx.getSenderAddress().toString();
            const rawTransaction = "0x" + signedTx.serialize().toString('hex');
            
        
            console.log("signedTx : " + rawTransaction + "   from : "+ from );
            web3.eth.sendSignedTransaction(rawTransaction, function(error, hash){
              if(error){
                console.log("Transaction error ", error);
              }
              else {
                console.log("Hash: ", hash);
                res.header("Access-Control-Allow-Origin", "*");
                res.send(hash);
              }
            });
        }
    })
})

server.get('/pubkey',(req,res) => {
    const command = "~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/tss_cli pubkey ~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/keys1.store";
    const result = execSync(command);
    const obj = JSON.parse(result.toString());

    var x = obj.x;
    var y = obj.y;

    if (x.length != 64) {
        x = "0" + x;
    }
    
    if (y.length != 64) {
        y = "0" + y;
    }
    
    const pubKey = "04" + x + y;
    
    res.send(pubKey);
})

server.get('/address',(req,res) => {
    const command = "~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/tss_cli pubkey ~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/keys1.store";
    const result = execSync(command);
    const obj = JSON.parse(result.toString());

    var x = obj.x;
    var y = obj.y;

    if (x.length != 64) {
        x = "0" + x;
    }
    
    if (y.length != 64) {
        y = "0" + y;
    }
    
    const pubKey = "04" + x + y;
    const address = publicToAddress(Buffer.from(pubKey,'hex'));
    res.header("Access-Control-Allow-Origin", "*");
    res.send(address);
})

server.get('/balance', (req,res) => {
    const command = "~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/tss_cli pubkey ~/workspace/dacs-mpc/tss-ecdsa-cli/target/release/keys1.store";
    const result = execSync(command);
    const obj = JSON.parse(result.toString());

    var x = obj.x;
    var y = obj.y;

    if (x.length != 64) {
        x = "0" + x;
    }
    
    if (y.length != 64) {
        y = "0" + y;
    }
    
    const pubKey = "04" + x + y;
    const address = publicToAddress(Buffer.from(pubKey,'hex'));
    web3.eth.getBalance(address, function(error, result) {
        if(error) {
            console.log("getBalance error");
        } else {
            console.log(result);
            const balance_ether = Web3.utils.fromWei(result,'ether');
            res.header("Access-Control-Allow-Origin", "*");
            res.send(balance_ether);
        }
    })
})

server.get('/unsignedtx',(req,res) => {
    const addressFrom = req.query.from;
    const addressTo = req.query.to;
    const value = req.query.value;

    web3.eth.getTransactionCount(addressFrom, function(error, transactionCount){
        if(error) {
            res.send(error);
        } else {
            console.log(transactionCount);

            const customCommon = Common.forCustomChain(
                'mainnet',
                {
                  name: 'private-blockchain',
                  networkId: 20210427,
                  chainId: 20210427
                },
                'istanbul'
            );

            const txData = {
                nonce : web3.utils.toHex(transactionCount),
                gasLimit: web3.utils.toHex(21000),
                gasPrice: web3.utils.toHex(web3.utils.toWei("10","gwei")), 
                to: addressTo,
                chainId: 20210427,
                value: web3.utils.toHex(web3.utils.toWei(value, 'ether')),
                data : ''
            };

            const tx = Tx.fromTxData(txData, {common: customCommon});
            const unsignedtx = tx.getMessageToSign();

            console.log("unsigned transaction : ", unsignedtx.toString('hex'));

            res.header("Access-Control-Allow-Origin", "*");
            res.send(unsignedtx.toString('hex'));
        }
    });
})

server.use(cors({ origin: 'http://141.223.181.204:3001'}));
server.use(bodyParser.urlencoded({extended:false}));
server.use(bodyParser.json());

server.listen(port, ()=>{
    console.log("port 3002");
})