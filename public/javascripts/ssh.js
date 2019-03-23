var wss // make secure websocket available to everyone
var cmdText = ''
function load() {
    var sshWindow = document.getElementById('sshWindow')
    sshWindow.addEventListener('keydown',sshKeypress)
    console.log('loaded')
    //startWebsocket()
}
function startWebsocket(rid){
    if (wss) wss.close();
    if (location.protocol === 'https:') {
        wss = new WebSocket('wss://'+ window.location.hostname + ':'+window.location.port+
            '?browser=true&ssh=true&sid='+sid+'&rid='+rid)
        console.log('Using Secure Websocket')
    } else
    {
        wss = new WebSocket('ws://'+ window.location.hostname + ':'+window.location.port+
            '?browser=true&ssh=true&sid='+sid+'&rid='+rid)
        console.log('Using Standard Websocket')
    }


    wss.onopen = function(){
        console.log('websocket open')
    }
    wss.onmessage = function(evt){
        console.log(evt.data.toString('utf8'))
        sshWindow.value = sshWindow.value+evt.data.replace(']0;','');
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
console.log(e)
    switch(e.code){
    case 'Enter':
        wss.send(cmdText+'\n')
        cmdText=''
        console.log(cmdText)
        break;
    case 'ShiftLeft':
    case 'ShiftRight':
    case 'Tab':
        break;
    case 'Backspace':
        cmdText=cmdText.slice(0,-1)
        break;
    case 'ArrowUp':
        wss.send('^[[A')
        break;

    default:

        cmdText=cmdText+e.key


}



}