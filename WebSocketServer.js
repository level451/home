const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
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
        //SPECIAL CONNECTION TYPE FOR SSH
        // not added to the websock array
        if (parameters.ssh){
            // this websocket is marked as an ssh connection from a web browser
            // handle all on events in the ssh function
            ws.ssh = true;
            ws.rid = parameters.rid
            ws.sid = parameters.sid;
           // webSocket[ws.sid]=ws;

            ssh(ws)
            return;
        }
        ws.browser = parameters.browser
        ws.mac = parameters.mac;
        ws.sid = parameters.sid;
        ws.isAlive = true;
        ws.remoteAddress = ws._socket.remoteAddress;

        if (parameters.subscribeEvents){
            ws.subscribeEvents=JSON.parse(parameters.subscribeEvents)
            console.log('Browse page subscribed:',ws.subscribeEvents)
        }

        if (ws.mac){
            ws.id = ws.mac;
            webSocket[ws.mac]=ws;
        } else
        {
            ws.id = ws.sid;
            webSocket[ws.sid]=ws;
        }

        if (!ws.browser){ //if a system system connects
            // log the connectionState
            myEmitter.emit('systemInfo',{mac:ws.id,emitterId:'systemInfo',event:'connectionState',connectionState:true},ws.id)
        }



        ws.on('message', function incoming(message) {
           // console.log(message)

            var data=JSON.parse(message)
            myEmitter.emit(data.emitterId,data,ws.id)
            // alse send to any browser subscribed to the emitterId events
            // for (var mac in webSocket) {
            //     //console.log(eachws.sid,eachws.mac,eachws)
            //     if (webSocket[mac].browser && webSocket[mac].subscribeEvents.includes(data.emitterId)){
            //        //check each websocket to see if isa a browser
            //        // then check if its subscribedEvents array includes the event(emitterId)
            //        // if does send the data to it
            //         webSocket[mac].send(message)
            //     }
            //
            // }


        });
        ws.on('pong', heartbeat);
        ws.on('close', function(){
            if (!ws.browser){ //if a system closes
                //login in database
                myEmitter.emit('systemInfo',{mac:ws.id,emitterId:'systemInfo',event:'connectionState',connectionState:false},ws.id)

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

exports.getSomethingRemote = function(id,obj,cb){
    obj.emitterId = Math.random().toString()
    webSocket[id].send(JSON.stringify(obj))
    myEmitter.once(obj.emitterId,function(data){

        cb(data)

    })

}

function ssh(ws){
    console.log('rid=',ws.rid)
    console.log('socket state'+ws.readyState)
    if (ws.rid == 'Host'){
        const { spawn } = require('child_process');
        var cmd = spawn('cmd', [], {stdio:['pipe','pipe','pipe'],shell:true});


        cmd.on('close',()=>{
            ws.close()
        })
        cmd.stdout.on('data',(data) =>{
            ws.send(data.toString('utf8'))

            console.log(data.toString('utf8'))

        })
        cmd.stderr.on('data',(data) =>{
            console.log('err')
            ws.send(data.toString('utf8'))
            console.log(data.toString('utf8'))

        })

        ws.on('message', function incoming(message) {
            cmd.stdin.write(message)
            console.log(message)
        });
        ws.on('close',function(){
            console.log('Socket Closed killing Command Session')
            cmd.kill()
        })
    } else
        {
        // to-do check to see if the socket exists
        //now start the session
            webSocket[ws.rid].send(JSON.stringify({startSsh:true,emitterId:ws.sid}))
        console.log('sid',ws.sid)
            ws.on('message', function incoming(message) {
                // message to relay
                webSocket[ws.rid].send(JSON.stringify({ssh:true,emitterId:ws.sid,data:message}))

                console.log('Send to remote:',message,ws.sid)
            })
            ws.on('close',function(){
                console.log('Socket Closed Sending kill-session command to:'+ws.rid)
                myEmitter.removeAllListeners(ws.sid)
                webSocket[ws.rid].send(JSON.stringify({ssh:true,killSession:true,emitterId:ws.sid}))
            })

            myEmitter.on(ws.sid,function(data){
                //got something back from my id

                if (!data.commandClosed){
                    console.log('socket state'+ws.readyState,ws.sid)
                    if (ws.readyState == 1){
                        ws.send(data.data)
                    } else
                    {console.log('that error')}

                }else
                {
                    ws.close();
                    console.log('remote command closed')
                }


            })
    }


}
myEmitter.on('systemInfo' ,function(data,id){ //subscribeable
    // log systemInfo

        database.logSystemInfo(id,data.event,data[data.event])
        brodcastSubsribedEventsToBrowser('systemInfo',data)
})


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
    // alse send to any browser subscribed to the emitterId events
    for (var mac in webSocket) {
        //console.log(eachws.sid,eachws.mac,eachws)
        if (webSocket[mac].browser && webSocket[mac].subscribeEvents.includes(emitterId)){
           //check each websocket to see if isa a browser
           // then check if its subscribedEvents array includes the event(emitterId)
           // if does send the data to it
            //
            if (webSocket[mac].readyState == 1){
                try{
                    webSocket[mac].send(JSON.stringify(data))
                } catch(e){
                    console.log('Failed to send websocket',webSocket[mac].readyState,mac,data)
                }

            }

        }

    }

}
