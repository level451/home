
export function createGlobalEmitterObjectFunctions(d){
    createGlobalEmitterObjectAsncyFunctions(d)
}
function createGlobalEmitterObjectAsncyFunctions(d) {
    for (let i = 0;i<d.asyncFunctions.length;++i){
        let functionToCreate = d.asyncFunctions[i]

        console.log('functionToCreate', functionToCreate, d.emitterName)
        // this is the return hook function
        window[d.emitterName][functionToCreate] = async function (...args) {
            // create a random event to subscribe to - to await the return value
            var returnEventName = Math.random().toString();
            console.log('return event name',returnEventName)
            //send the command to the remote
            if (wss.readyState == 1) {
                try {
                    wss.send(JSON.stringify({
                        remoteAsyncFunction: true,
                        emitterName: d.emitterName,
                        functionName: functionToCreate,
                        returnEventName: returnEventName,
                        args: args
                    }))
                } catch (e) {
                    console.log('Failed to send websocket', e, this.readyState, this.ws.id)
                }
                // return a promise to be fulfilled when we get the data back
                return new Promise(function (resolve) {
                    window[d.emitterName].once(returnEventName, resolve)
                })
            }

        }


        //***************
    }

}
export function test(){
    console.log('test - here')}