const request = require('request');
//var hrstart = process.hrtime()

setInterval(function(){getSecond(0)},2000)
setInterval(function(){getSecond(1)},2000)
setInterval(function(){getSecond(2)},2000)
setInterval(function(){getSecond(3)},2000)

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
    });
}