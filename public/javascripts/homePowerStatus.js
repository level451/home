var wss // make secure websocket available to everyone
var cs6Info
var navstatus;
var startTime = null;
var secondData = [{"0":{"power":0},"1":{"power":0},"2":{"power":0},"3":{"power":0},"time":new Date()}];

var subscribeEvents = [{"ted": "secondData"}, {"ted": "minuteData"},{"mx60": "realTimeData"}]


import eventify from '/javascripts/eventify.js'
import * as remoteObject from '/javascripts/remoteObject.js'
import * as graphs from '/javascripts/graphs.js'
remoteObject.test()
// code to create eventemiter
var wsEmitter = {}
eventify(wsEmitter) // extends wss class to enable event emitter
function load() {
    console.log('loaded')


}
createEventEmitterObjects(subscribeEvents)

function createEventEmitterObjects(subscribeEvents) {
    //console.log(subscribeEvents, subscribeEvents.length)
    for (var i = 0; i < subscribeEvents.length; ++i) {
        console.log(Object.keys(subscribeEvents[i]))
        window[Object.keys(subscribeEvents[i])] = {}
        eventify(window[Object.keys(subscribeEvents[i])])
    }


}

startWebsocket()



// start websocket connection
function startWebsocket() {
    if (location.protocol === 'https:') {

        window.wss = new WebSocket('wss://' + window.location.hostname + ':' + window.location.port +
            '/?browser=true&sid=' + sid + '&subscribeEvents=' + JSON.stringify(subscribeEvents))
        console.log('Using Secure Websocket')
    } else {
        window.wss = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port +
            '/?browser=true&sid=' + sid)
        //+ '&subscribeEvents=' + JSON.stringify(subscribeEvents))
        console.log('Using Standard Websocket')
    }
    wss=window.wss

    wss.onopen = function () {
        console.log('websocket open')
    subscribeToRemoteObjects(subscribeEvents)
    }
    wss.onmessage = function (evt) {
        let obj = JSON.parse(evt.data)
        if (obj.remoteEmit){
            window[obj.emitter].emit(obj.eventName, ...obj.args)
//            console.log(obj.eventName)
        } else
        if (obj.emitterDefinition){

            console.log(obj)
            remoteObject.createGlobalEmitterObjectFunctions(obj)

            console.log('---------------------')
        }
        else {console.log('-----',obj)}


        // wsEmitter.emit(Object.keys(d)[0],d[Object.keys(d)[0]])
        //  console.log(evt.data)
    }
    wss.onerror = function (err) {
        console.log('websocket error:' + err)
        wss.close();

    }
    wss.onclose = function () {
        console.log('websocket close reconecting websocket')
        setTimeout(function () {
            startWebsocket()
        }, 1000)
    }


}


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

function drawSecondDataGraph() {
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
    drawSecondDataGraph()
    //console.log(new Date(newSecondData.time)-startTime,newSecondData)
})
mx60.on('realTimeData', function (d) {
    let ctx = document.getElementById('powerGaugeCanvas').getContext('2d')
    let powerGaugeCanvas = document.getElementById('powerGaugeCanvas')
    ctx.clearRect(0, 0, powerGaugeCanvas.width, powerGaugeCanvas.height);
    graphs.drawGauge(ctx,50,50,d.B.chargerCurrent,'MX60 B',0,10)
    graphs.drawGauge(ctx,125,50,d.C.chargerCurrent,'MX60 C',0,100)
    graphs.drawGauge(ctx,200,50,d.C.chargerCurrent+d.B.chargerCurrent,'MX60 Total',0,100)
    graphs.drawGauge(ctx,275,50,((d.B.chargerCurrent+d.C.chargerCurrent)*d.B.batteryVoltage)/10,'MX60 Watts',0,100)

    graphs.drawGauge(ctx,350,50,secondData[secondData.length-1][0].power/10,'Power UPL/10',0,100)
    graphs.drawGauge(ctx,425,50,secondData[secondData.length-1][1].power/10,'Inv Out',0,100)
    graphs.drawGauge(ctx,500,50,secondData[secondData.length-1][2].power/10,'Inv In',0,100)

    //console.log((d.B.chargerCurrent+d.C.chargerCurrent)*d.B.batteryVoltage)
})
function subscribeToRemoteObjects(eventsToSubscribeTo){
    wss.send(JSON.stringify({subscribeToObjects:true,eventsToSubscribeTo:eventsToSubscribeTo}))
}
