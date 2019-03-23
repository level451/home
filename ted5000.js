const request = require('request');
const EventEmitter = require('events');
const tedEmitter = new EventEmitter();

module.exports = tedEmitter;
var secondData = {}

setInterval(function(){Promise.all([go(0),go(1),go(2),go(3)]).then(function(){
    tedEmitter.emit('secondData',secondData)
    secondData={}
})},2000)
function getSecond(MTU) {
    request('http://ted5000/history/rawsecondhistory.raw?MTU='+MTU+'&COUNT=1&INDEX=1', function (error, response, body) {
  //      hrend = process.hrtime(hrstart)

   //     console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)

//    console.log('body:', body); // Print the HTML for the Google homepage.

        let buff = new Buffer.from(body, 'base64');

        var time = new Date(buff[0] + 2000, buff[1] - 1, buff[2], buff[3], buff[4], buff[5])
        //console.log('Power:'+buff.readInt32LE(6,4))
        //console.log('Cost:'+buff.readInt32LE(10,4))
        //console.log('Volt:'+(buff.readInt16LE(14,2)/10))
        console.log(MTU+' '+time.toLocaleString() + ' ' + 'Power:' + buff.readInt32LE(6, 4) + ' ' + 'Volt:' + (buff.readInt16LE(14, 2) / 10))
    tedEmitter.emit('secondData',buff.readInt32LE(6, 4))
    });
}
function go(MTU){
    return new Promise(function(resolve,reject){
        request('http://ted5000/history/rawsecondhistory.raw?MTU='+MTU+'&COUNT=1&INDEX=1', function (err, resp, body) {
            try{
                let buff = new Buffer.from(body, 'base64');
                if (!secondData.time){secondData.time = new Date(buff[0] + 2000, buff[1] - 1, buff[2], buff[3], buff[4], buff[5])}
                secondData[MTU]= {power:buff.readInt32LE(6, 4),volt:(buff.readInt16LE(14, 2) / 10),cost:buff.readInt32LE(10, 4)}

            } catch(err){

            }

            if (err) {
                console.log(err)
                reject(err);
            } else {
                resolve();
            }
//            tedEmitter.emit('secondData',buff.readInt32LE(6, 4))

        })
    }
)}