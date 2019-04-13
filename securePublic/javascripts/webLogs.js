const subscribeEvents = [{"httpServer": "test"}]

import * as ws from '/javascripts/webSocket.mjs'
import * as formatDate from '/javascripts/formatDate.mjs'
var sessionData
ws.startWebsocket(subscribeEvents);

// test :
//httpServer.getSessionLog().then(function(x){console.log(x)})
httpServer.on('ready', () => {
    httpServer.getSessionLog().then(data => {
        sessionData = data;
        drawSessionTable(document.getElementById('sessionInfoTableBody'), data)


    })
})

function drawSessionTable(table, data) {
    table.innerHTML = tableHeader(['Time', 'User', 'Last Page'])
    for (var i = 0; i < data.length; i++) {

        var tr = "<tr>";
        tr += "<td>" + formatDate.toMMDDHHMM(data[i].sessionLastAccessed) + "</td>" + "<td>" + data[i].userName + "</td>"
        tr += '<td onclick=test('+i+')>' +  formatDate.toMMDDHHMM(data[i].urlHistory[0].reqDate) + ' ' + data[i].urlHistory[0].page + '</td>'
        tr += "</tr>";

        /* We add the table row to the table body */
        table.innerHTML += tr;
    }

}
//nestedDetails(data[i].urlHistory)
window.test = test
function test(i){
    console.log('test',sessionData[i])
    document.getElementById('test').innerHTML = nestedDetails(sessionData[i].urlHistory)
}
function tableHeader(o) {
    let r = '';
    for (var i = 0; i < o.length; ++i) {
        r += '<th style="text-align:left">' + o[i] + '</th>'
    }
    return r;
}

function nestedDetails(d) {
    let o = {};
    d.forEach((e) => {
        let date = formatDate.toMMDD(e.reqDate)
        if (!o[date]) {
            o[date] = {count: 0, details: ''};
        }
        o[date].details += '<details style="margin-left: 10px"><summary>'+formatDate.toMMDDHHMM(e.reqDate) + ' ' +e.page+'</summary>' +
            'Remote Address:'+e.remoteAddress+'<br>userAgent:'+e.userAgent+'</details>'
        ++o[date].count;
    })
    for (const e in o) {



    }


    let v = ''
    v += "<details><summary>" + formatDate.toMMDDHHMM(d[0].reqDate) + ' ' + d[0].page + "</summary>"

    for (const e in o) {
        v += '<details style="margin-left: 10px"><summary >' + e + ' (' + o[e].count + ')</summary>'


        v+= o[e].details

        v += '</details>'
    }


    v += "</details>"
    return v


}
