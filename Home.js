// First set the console.log handler
// modify this object to add to the local settings
// localSettingsDescrition describes all the global localSettings values and thier defaults
const localSettingsDescription = {
    webServer: {
        Description: "HTTPS Server Listen Port",
        port: '2112'
    },
    theme: {
        Description: "Name of the Web theme style",
        theme: 'Default'
    },
    MongoServer: {
        Description: "Infomation about the Mongo Server",
        Address: '',
        test:''
    }
}


loadLocalSettings()

//webSocketServer = require('./WebSocketServer')
//comment this line to use the regular console.log

console = require('@level451/newConsole')
// const EventEmitter = require('events');
//  mx60 = new EventEmitter();
// mx60.on('data',function(x){console.log('mx60')})


const webSocketServer = require('@level451/httpServer').webSocketServer

//ted = require('./ted5000')
//const y = require('./HttpsServer')
//const httpsServer = new y()
httpServer = require('@level451/httpServer')({useHttps:true,port:2112})


httpServer.use(function(req, res, next) {
    next();
})

httpServer.get('/t', (req, res) => {
    res.status(200).send(':)')



})
httpServer.get('/', (req, res) => {
    res.render('homePowerStatus.ejs', {
        pageName: 'Power Status',
        sid: req.sessionId,
        userDocument: req.userDocument
    });


})


//httpServer.on('test',function(d){console.log('**event',d)})
database = require('./Database')




database.getMongoConnection('Home',function(err,dbo){
    if (err){console.error(err)
    }else
    {
        global.dbo = dbo
    }

})

function loadLocalSettings() {
    try {
        global.localSettings = require('./localSettings')
    } catch (err) {
        console.log('Local Settings Failed to Load - Going into setting mode')
        global.localSettings = false
    }
}