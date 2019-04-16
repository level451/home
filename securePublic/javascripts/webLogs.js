const subscribeEvents = [{"database": "requestLog"}];
import * as ws from '/javascripts/webSocket.mjs';
import * as formatDate from '/javascripts/formatDate.mjs';

let requestLogSkip = 0;
let sessionSkip = 0;
var requestLog = [];
var sessionData;
ws.startWebsocket(subscribeEvents);
// test :
//httpServer.getSessionLog().then(function(x){console.log(x)})
database.on('ready', () => {
    database.getSessionLog(10).then(data => {
        sessionData = data;
        drawSessionTable();
    });
    database.getRequestLog(30, 0).then(data => {
        requestLog = data;
        drawRequestTable();
    });
});
database.on('requestLog', (d => {
    let indexValue = requestLog.findIndex(o => o._id == d._id);
    if (indexValue == -1) {
        requestLog.unshift(d);
        console.log('new');
    } else {
        requestLog[indexValue] = d;
        console.log('update');
    }
    drawRequestTable();
}));


function drawRequestTable() {
    let table = document.getElementById('requestLogTableBody');
    table.innerHTML = tableHeader(['Time', 'Page', 'User', 'IP Address']);
    for (var i = 0; i < (requestLog.length - 1); i++) {
        var tr = '<tr style=" vertical-align: top;' +
            ((requestLog[i] && requestLog[i].activeWebSocket) ? 'background-color:lawngreen' : '') +
            ((requestLog[i] && requestLog[i].notAuthorized) ? 'background-color:red' : '') +
            ((requestLog[i] && requestLog[i].pageNotFound) ? 'background-color:yellow' : '') + '" >';
        tr += "<td>" + formatDate.toMMDDHHMMSS(requestLog[i].timeStamp);
        tr += '<td>' + requestLog[i].req + '</td>';
        tr += "</td>" + "<td>" + requestLog[i].userName + "</td>";
        tr += '<td>' + requestLog[i].remoteAddress + '</td>';
        if (requestLog[i].activeWebSocket) {
            tr += '<td><button onclick="killSession(\'' + requestLog[i]._id + '\')">Log Out User</button></td>';
        }
        tr += "</tr>";
        /* We add the table row to the table body */
        table.innerHTML += tr;
    }
}


window.killSession = function (id) {
    console.log('ks', id);
    ws.sendObject({killSession: true, requestLogId: id});
};


function drawSessionTable() {
    let table = document.getElementById('sessionInfoTableBody')
    table.innerHTML = tableHeader(['Time', 'User', 'Last Page', 'Total Pages']);
    for (var i = 0; i < sessionData.length; i++) {
        var tr = '<tr style=" vertical-align: top;' + ((sessionData[i].closed) ? 'background-color:grey' : '') + '" >';
        tr += "<td>" + formatDate.toMMDDHHMM(sessionData[i].sessionLastAccessed) + "</td>" + "<td>" + sessionData[i].userName + "</td>";
        tr += '<td>' + nestedDetails(sessionData[i].urlHistory) + '</td>';
        //tr += '<td onclick=test(' + i + ')>' + formatDate.toMMDDHHMM(sessionData[i].urlHistory[0].reqDate) + ' ' + sessionData[i].urlHistory[0].page + '</td>';
        tr += '<td>' + sessionData[i].urlHistory.length + '</td>';
        tr += "</tr>";
        /* We add the table row to the table body */
        table.innerHTML += tr;
    }
}


//nestedDetails(data[i].urlHistory)
window.test = test;


function test(i) {
    console.log('test', sessionData[i]);
    document.getElementById('test').innerHTML = nestedDetails(sessionData[i].urlHistory);
}


function tableHeader(o) {
    let r = '';
    for (var i = 0; i < o.length; ++i) {
        r += '<th style="text-align:left">' + o[i] + '</th>';
    }
    return r;
}


function nestedDetails(d) {
    let o = {};
    d.forEach((e) => {
        let date = formatDate.toMMDD(e.reqDate);
        if (!o[date]) {
            o[date] = {count: 0, details: ''};
        }
        o[date].details += '<details ontoggle=getRequestLogDetails(this) id="' + e.requestId + '" style="margin-left: 10px"><summary>' + formatDate.toMMDDHHMM(e.reqDate) +
            ' ' + e.page + '</summary>' +
            'Loading...</details>';
        ++o[date].count;
    });
    for (const e in o) {
    }
    let v = '';
    v += "<details><summary>" + formatDate.toMMDDHHMM(d[0].reqDate) + ' ' + d[0].page + "</summary>";
    for (const e in o) {
        v += '<details style="margin-left: 10px"><summary >' + e + ' (' + o[e].count + ')</summary>';
        v += o[e].details;
        v += '</details>';
    }
    v += "</details>";
    return v;
}


window.getRequestLogDetails = function (e) {
    if (e.open) {
        database.getRequestLogById(e.id).then((r) => {
            e.innerHTML = e.innerHTML.split('Loading...')[0] +
                '<p style="margin-left: 20px">RemoteAddress:     ' + r.remoteAddress +
                '<br>Active:        ' + r.activeWebSocket +
                '<br>ConnectedTime: ' + Number((r.activeWebSocket) ? ((new Date() - new Date(r.websocketOpenTime)) / 60000) : r.connectedTimeMinutes).toFixed(1) + ' Minutes' +
                '<br>userAgent:     ' + r.userAgent +
                '</p>';
            e.open = true;
        });
    } else {
        e.innerHTML = e.innerHTML.split('RemoteAddress')[0] +
            'Loading...';
        e.open = false;
    }
};
document.getElementById('requestLogNextRecords').addEventListener('click', (e) => {
    requestLogSkip -= 30;
    if (requestLogSkip < 0) requestLogSkip = 0;
    database.getRequestLog(30, requestLogSkip).then(data => {
        requestLog = data;
        drawRequestTable();
    });
});
document.getElementById('requestLogPrevRecords').addEventListener('click', (e) => {
    requestLogSkip += 30;
    database.getRequestLog(30, requestLogSkip).then(data => {
        requestLog = data;
        drawRequestTable();
    });
});
document.getElementById('sessionNextRecords').addEventListener('click', (e) => {
    sessionSkip -= 10;
    if (sessionSkip < 0) sessionSkip = 0;
    database.getSessionLog(10,sessionSkip).then(data => {
        sessionData = data;
        drawSessionTable();
    });
});
document.getElementById('sessionPrevRecords').addEventListener('click', (e) => {
    sessionSkip += 10;
    database.getSessionLog(10,sessionSkip).then(data => {
        sessionData = data;
        drawSessionTable();
    });
});