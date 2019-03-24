var wss // make secure websocket available to everyone
var cs6Info
var navstatus;
var startTime = null;
var secondData = []

// code to create eventemiter
wsEmitter = {}
eventify(wsEmitter) // extends wss class to enable event emitter


startWebsocket()

function load() {
    console.log('loaded')


}

// start websocket connection
function startWebsocket(){
    if (location.protocol === 'https:') {

        wss = new WebSocket('wss://' + window.location.hostname + ':' + window.location.port +
            '/?browser=true&sid=' + sid + '&subscribeEvents=[{"ted":"secondData"}]')
        console.log('Using Secure Websocket')
    }else{
        wss = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port +
            '/?browser=true&sid=' + sid + '&subscribeEvents=[{"ted":"secondData"}]')
        console.log('Using Standard Websocket')
    }


    wss.onopen = function(){
        console.log('websocket open')
    }
    wss.onmessage = function(evt){
        data = JSON.parse(evt.data)
        wsEmitter.emit(Object.keys(data)[0],data[Object.keys(data)[0]])
        //console.log(evt.data)
    }
    wss.onerror = function(err){
        console.log('websocket error:'+err)
        wss.close();

    }
    wss.onclose = function (){
        console.log('websocket close reconecting websocket')
        setTimeout(function(){startWebsocket()},1000)
    }


}






function openNav() {
    if(navstatus =="open"){
       closeNav();
       return;
    }
    document.getElementById("mySidenav").style.width = "225px";
    document.getElementById("mySidenav").style.opacity=1;
    document.getElementById("unitInfo").style.marginLeft = "225px";
    navstatus = "open"
}

function closeNav() {
    document.getElementById("mySidenav").style.width = 0;
    document.getElementById("mySidenav").style.opacity=0;
    document.getElementById("unitInfo").style.marginLeft = "0px";
    navstatus = "closed";
}

function eventify (self)  {
    self.events = {}

    self.on = function (event, listener) {
        if (typeof self.events[event] !== 'object') {
            self.events[event] = []
        }

        self.events[event].push(listener)
    }

    self.removeListener = function (event, listener) {
        let idx

        if (typeof self.events[event] === 'object') {
            idx = self.events[event].indexOf(listener)

            if (idx > -1) {
                self.events[event].splice(idx, 1)
            }
        }
    }

    self.emit = function (event) {
        var i, listeners, length, args = [].slice.call(arguments, 1);

        if (typeof self.events[event] === 'object') {
            listeners = self.events[event].slice()
            length = listeners.length

            for (i = 0; i < length; i++) {
                listeners[i].apply(self, args)
            }
        }
    }

    self.once = function (event, listener) {
        self.on(event, function g () {
            self.removeListener(event, g)
            listener.apply(self, arguments)
        })
    }
}

// recieve Ted second data -
wsEmitter.on('secondData',function(newSecondData) {
    if (!startTime) {
        startTime = new Date(newSecondData.time);
    }
    secondData.push(newSecondData)
    drawSecondDataGraph()
//    console.log(new Date(newSecondData.time)-startTime,newSecondData)
})
function drawSecondDataGraph(){
    secondDataGraph = document.getElementById('secondGraph')
    secondDataGraphContext = document.getElementById('secondGraph').getContext("2d")
    secondDataGraphContext.clearRect(0, 0, secondDataGraph.width, secondDataGraph.height);
    secondDataGraphContext.beginPath();
    secondDataGraphContext.moveTo(0,secondDataGraph.height-(secondData[0][0].power/4))
    for (var i = 0;i< secondData.length;++i){
        if (secondData[i][0]){
            secondDataGraphContext.lineTo(i,secondDataGraph.height-(secondData[i][0].power/4))
        } else
        {
           // console.log('No data',secondData[i])
        }

    }
    secondDataGraphContext.stroke()

}