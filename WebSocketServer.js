const EventEmitter = require('events');

//class MyEmitter extends EventEmitter {}

const myEmitter = new EventEmitter();
var webSocket = {};
const WebSock = require('ws');

exports.startWebSocketServer = function(server){
    const wss = new WebSock.Server( {server} );

    wss.on('connection', function connection(ws,req) {
        const parameters = require('url').parse(req.url, true).query;

        if (!parameters.mac && !parameters.browser){ //reject websocket wequests that are not from approved mac addresses
            ws.close()
            return;
        }
        console.log('Connected Clients:'+wss.clients.size)
        ws.browser = parameters.browser
        ws.sid = parameters.sid;
        ws.isAlive = true;
        ws.remoteAddress = ws._socket.remoteAddress;
        ws.id = ws.sid;

        if (parameters.subscribeEvents){
            ws.subscribeEvents=JSON.parse(parameters.subscribeEvents)
            console.log('Browse page subscribed:',ws.subscribeEvents)
            for (var i = 0;i<ws.subscribeEvents.length;++i){
                let subscribeObject = Object.getOwnPropertyNames(ws.subscribeEvents[i])[0] // parse the property name
                console.log('**',global[subscribeObject] instanceof require("events").EventEmitter)
                // check to see is the object we are tring to subscribe to is an eventEmitter
                if (global[subscribeObject] instanceof require("events").EventEmitter){
                    // wow this took forever to learn the syntax
                    // global[subscribeObject] is the eventemitter object we are subscribing to
                    // after we subscribe we are using bind so the function has access to the
                    // event the was subscribe to and the websocket to send it to

                    // store the function name so we can unsuscribe later
                    ws.subscribeEvents[i].function =  function(evtData,f){
                        console.log('adfg',new Date())
                        if (this.ws.readyState == 1){
                            try{
                                this.ws.send(JSON.stringify({[this.event]:evtData}))

                            } catch(e){
                                console.log('Failed to send websocket',webSocket[mac].readyState,mac,data)
                            }

                        }

                    }.bind({object:subscribeObject,event:ws.subscribeEvents[i][subscribeObject],ws:ws})

                    global[subscribeObject].on(ws.subscribeEvents[i][subscribeObject],ws.subscribeEvents[i].function)
                    console.log('Bound Websocket '+ws.id+' to event '+ws.subscribeEvents[i][subscribeObject]+' in object:'+subscribeObject)
                }

            }
        }

            webSocket[ws.sid]=ws;




        ws.on('message', function incoming(message) {
           // console.log(message)

            var data=JSON.parse(message)
            myEmitter.emit(data.emitterId,data,ws.id)


        });
        ws.on('pong', heartbeat);
        ws.on('close', function(){
           // remove all eventlisteners we subscribed to
            for (var i = 0;i<ws.subscribeEvents.length;++i) {
                let subscribeObject = Object.getOwnPropertyNames(ws.subscribeEvents[i])[0] // parse the property name
                global[subscribeObject].removeListener(ws.subscribeEvents[i][subscribeObject],ws.subscribeEvents[i].function)
            }
                if (ws.id && webSocket[ws.id]){
                delete webSocket[ws.id];
                console.log('Removeing websocket from active object',ws.id)
            } else
            {
                console.log('WARNING: websocket closing and is not found as connected',ws.id)
            }


        });


    });

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
          if (!ws.ssh){ // no keepalive for browser clients
              if (ws.isAlive === false) {console.log('Socket killed with heartbeat:',ws.id)}
              if (ws.isAlive === false) return ws.terminate();
              ws.isAlive = false;
              ws.ping(noop);

          } else {
          }


        });
    }, 30000);
    function noop() {
//hits here every ping-pong
   }
    function heartbeat() {
        this.lastPing = new Date()
        this.isAlive = true;
    }
}



myEmitter.on('cs6Error',(data,id)=>{
        // select the most recent 24 hours of errors for this mac
        dbo.collection('errorLog').insertOne(data,(err,rslt)=>{
            //console.log('CS6 Error logged',id)
            dbo.collection('errorLog').find({$and:[{_id: {
                    $gt: require('mongodb').ObjectID.createFromTime(Date.now() / 1000 - 24*60*60)
                }},{mac:id}]}).project({timeStamp:1,_id:0}).toArray((err, rslt) => {
                    data.errorCount = {'min5':0,'min60':0,'hours24':0}
                    for (var i = 0;i<rslt.length;++i){
                        let elapsedTime =  (new Date()- new Date(rslt[i].timeStamp))/60000
                        if (elapsedTime < 5){
                            data.errorCount.min5 ++;
                        }
                        if (elapsedTime < 60){
                           data.errorCount.min60 ++;
                        }
                        if (elapsedTime < 1440 ){
                            data.errorCount.hours24 ++;
                        }
                    }
                    console.log(data.errorCount)
                    // log the connectionState
                    myEmitter.emit('systemInfo',{mac:id,emitterId:'systemInfo',event:'error',error:data},id)


        })

})
})
//,{projection:{timeStamp:1,_id:0}}
function brodcastSubsribedEventsToBrowser(emitterId,data){
  return
    // alse send to any browser subscribed to the emitterId events
    for (var id in webSocket) {
        //console.log(webSocket[id].subscribeEvents,emitterId)
        if (webSocket[id].browser && webSocket[id].subscribeEvents.includes(emitterId)){
            //check each websocket to see if isa a browser
           // then check if its subscribedEvents array includes the event(emitterId)
           // if does send the data to it
            //
            if (webSocket[id].readyState == 1){
                try{
                    webSocket[id].send(JSON.stringify({[emitterId]:data}))

                } catch(e){
                    console.log('Failed to send websocket',webSocket[mac].readyState,mac,data)
                }

            }

        }

    }

}
ted.on('secondData',function(secondData){

    brodcastSubsribedEventsToBrowser('secondData',secondData)
  // console.log(secondData)
})