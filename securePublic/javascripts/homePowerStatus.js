var wss // make secure websocket available to everyone
var cs6Info
var navstatus;
var startTime = null;
var secondData = [{"0":{"power":0},"1":{"power":0},"2":{"power":0},"3":{"power":0},"time":new Date()}];

const  subscribeEvents = [{"ted": "secondData"}, {"mx60": "realTimeData"},{"httpServer":"test"}]
//var subscribeEvents = [{"httpServer":"test"}]

// import eventify from '/javascripts/eventify.mjs'
// import * as remoteObject from '/javascripts/remoteObject.mjs'
import * as graphs from '/javascripts/graphs.mjs'
import * as ws from '/javascripts/webSocket.mjs'

// code to create eventemiter
//var wsEmitter = {}
//eventify(wsEmitter) // extends wss class to enable event emitter
function load() {
    console.log('loaded')


}

ws.startWebsocket(subscribeEvents);

ws.on('open',function (s) {
    console.log('wow',s)
})

function openNav() {
    if (navstatus == "open") {
        closeNav();
        return;
    }
    document.getElementById("mySidenav").style.width = "225px";
    document.getElementById("mySidenav").style.opacity = 1;
    document.getElementById("unitInfo").style.marginLeft = "225px";
    navstatus = "open"
}

function closeNav() {
    document.getElementById("mySidenav").style.width = 0;
    document.getElementById("mySidenav").style.opacity = 0;
    document.getElementById("unitInfo").style.marginLeft = "0px";
    navstatus = "closed";
}

function drawSecondDataGraph(secondData) {
    let secondDataGraph = document.getElementById('secondGraph')
    let secondDataGraphContext = document.getElementById('secondGraph').getContext("2d")
    secondDataGraphContext.clearRect(0, 0, secondDataGraph.width, secondDataGraph.height);
    secondDataGraphContext.beginPath();
    secondDataGraphContext.moveTo(0, secondDataGraph.height - (secondData[0][0].power / 20))
    for (var i = 0; i < secondData.length; ++i) {
        if (secondData[i][0]) {
            secondDataGraphContext.lineTo(i, secondDataGraph.height - (secondData[i][0].power / 20))
        } else {
            // console.log('No data',secondData[i])
        }

    }
    secondDataGraphContext.stroke()
    secondDataGraphContext.beginPath();
    secondDataGraphContext.moveTo(0, secondDataGraph.height - (secondData[0][1].power / 5))
    for (var i = 0; i < secondData.length; ++i) {
        if (secondData[i][0]) {
            secondDataGraphContext.lineTo(i, secondDataGraph.height - (secondData[i][1].power / 5))
        } else {
            // console.log('No data',secondData[i])
        }

    }
    secondDataGraphContext.stroke()

}

// recieve Ted second data -
ted.on('secondData', function (newSecondData) {
    if (!startTime) {
        startTime = new Date(newSecondData.time);
    }
    secondData.push(newSecondData)
    drawSecondDataGraph(secondData)
    //console.log(new Date(newSecondData.time)-startTime,newSecondData)
})
mx60.on('realTimeData', function (d) {
    let ctx = document.getElementById('powerGaugeCanvas').getContext('2d')
    let powerGaugeCanvas = document.getElementById('powerGaugeCanvas')
    ctx.clearRect(0, 0, powerGaugeCanvas.width, powerGaugeCanvas.height);
    graphs.drawGauge(ctx,50,50,d.B.chargerCurrent,'MX60 B',10)
    graphs.drawGauge(ctx,125,50,d.C.chargerCurrent,'MX60 C',30)
    graphs.drawGauge(ctx,200,50,d.C.chargerCurrent+d.B.chargerCurrent,'MX60 Total',40)
    graphs.drawGauge(ctx,275,50,Math.round(((d.B.chargerCurrent+d.C.chargerCurrent)*d.B.batteryVoltage)),'MX60 Watts',2000)
    graphs.drawGauge(ctx,350,50,d.B.batteryVoltage,'Battery Volts',59,48,
        [[100,'#ff0000'],[55,'#00ff00'],[0,'#ffff00']])

    graphs.drawGauge(ctx,425,50,secondData[secondData.length-1][0].power,'Power UPL',2000)
    graphs.drawGauge(ctx,500,50,secondData[secondData.length-1][1].power,'Inv Out',1000)
    graphs.drawGauge(ctx,575,50,secondData[secondData.length-1][2].power,'Inv In',1000)

    //console.log((d.B.chargerCurrent+d.C.chargerCurrent)*d.B.batteryVoltage)
})
