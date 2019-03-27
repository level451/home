var wss // make secure websocket available to everyone
var cs6Info
var navstatus;
var startTime = null;
var secondData = []
import eventify from '/javascripts/eventify.js'

// code to create eventemiter
var wsEmitter = {}
eventify(wsEmitter) // extends wss class to enable event emitter
var subscribeEvents = [{"ted": "secondData"}, {"mx60": "realTimeData"}]
createEventEmitterObjects(subscribeEvents)

function createEventEmitterObjects(subscribeEvents) {
    console.log(subscribeEvents, subscribeEvents.length)
    for (var i = 0; i < subscribeEvents.length; ++i) {
        console.log(Object.keys(subscribeEvents[i]))
        window[Object.keys(subscribeEvents[i])] = {}
        eventify(window[Object.keys(subscribeEvents[i])])
    }


}

startWebsocket()

function load() {
    console.log('loaded')


}

// start websocket connection
function startWebsocket() {
    if (location.protocol === 'https:') {

        wss = new WebSocket('wss://' + window.location.hostname + ':' + window.location.port +
            '/?browser=true&sid=' + sid + '&subscribeEvents=' + JSON.stringify(subscribeEvents))
        console.log('Using Secure Websocket')
    } else {
        wss = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port +
            '/?browser=true&sid=' + sid + '&subscribeEvents=' + JSON.stringify(subscribeEvents))
        console.log('Using Standard Websocket')
    }


    wss.onopen = function () {
        console.log('websocket open')
    }
    wss.onmessage = function (evt) {
        let d = JSON.parse(evt.data)
        window[d.emitter].emit(d.eventName, ...d.args)


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
    secondDataGraphContext.moveTo(0, secondDataGraph.height - (secondData[0][0].power / 10))
    for (var i = 0; i < secondData.length; ++i) {
        if (secondData[i][0]) {
            secondDataGraphContext.lineTo(i, secondDataGraph.height - (secondData[i][0].power / 10))
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
//    console.log(new Date(newSecondData.time)-startTime,newSecondData)
})
mx60.on('realTimeData', function (d) {
    console.log('here:', d)
})