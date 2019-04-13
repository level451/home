var wss // make secure websocket available to everyone
var cmdText = ''
function load() {
    var sshWindow = document.getElementById('sshWindow')
    sshWindow.addEventListener('keydown',sshKeypress)
    console.log('loaded')
    //startWebsocket()
}
function startWebsocket(){
    if (wss) wss.close();
    if (location.protocol === 'https:') {
        wss = new WebSocket('wss://'+ window.location.hostname + ':'+window.location.port+
            '?browser=true&ssh=true&sid=<%=sid%>')
        console.log('Using Secure Websocket')
    } else
    {
        wss = new WebSocket('ws://'+ window.location.hostname + ':'+window.location.port+
            '?browser=true&ssh=true&sid=<%=sid%>')
        console.log('Using Standard Websocket')
    }


    wss.onopen = function(){
        console.log('websocket open')
    }
    wss.onmessage = function(evt){
        console.log(evt.data.toString('utf8'))
        sshWindow.value = sshWindow.value+evt.data;
        sshWindow.scrollTop = sshWindow.scrollHeight;


    }
    wss.onerror = function(err){
        console.log('websocket error:'+err)
        wss.close();

    }
    wss.onclose = function (){
       console.log('onclose')
        sshWindow.value =''
    }

}


function sshKeypress(e){
switch(e.code){
    case 'Enter':
        wss.send(cmdText+'\n')
        cmdText=''
        break;
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'Tab':
        break;
    case 'Backspace':
        cmdText=cmdText.slice(0,-1)
        break;
    default:

        cmdText=cmdText+e.key
        console.log(cmdText)


}
    console.log(cmdText)


}