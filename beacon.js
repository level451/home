console = require('./common/newConsole/newConsole')

const dgram = require('dgram');
const udpSocket = dgram.createSocket({type:'udp4',reuseAddr:true});
udpSocket.bind(4001,()=>{
    //udpSocket.addMembership('224.1.1.1')
   // udpSocket.addMembership('224.1.1.1','10.6.1.170');
    udpSocket.addMembership('224.1.1.1','10.6.1.2');
  //  udpSocket.addMembership('224.1.1.1','127.0.0.1');

});
udpSocket.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    udpSocket.close();
});

udpSocket.on('message', (msg, rinfo) => {
console.log(msg.toString(),rinfo.address)
})