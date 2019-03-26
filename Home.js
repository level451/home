// localSettingsDescrition describes all the global localSettings values and thier defaults
// modify this object to add to the local settings
console.log(__dirname)
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



// First set the console.log handler
//comment this line to use the regular console.log
console = require('./newConsole')
loadLocalSettings()

ted = require('./ted5000')
 //webSocketServer = require('./WebSocketServer')
//const y = require('./HttpsServer')
//const httpsServer = new y()
const httpServer = require('@level451/httpServer').start({useHttps:true,port:2112})
const webSocketServer = require('@level451/httpServer').webSocketServer
webSocketServer.on('test',function(x){console.log('asdfasdf',x)})
//webSocketServer.on('mx60',function(x){console.log('mx60')})


httpServer.use(function(req, res, next) {
    next();
})

httpServer.get('/t', (req, res) => {
    res.status(200).send(':)')



})
httpServer.get('/', (req, res) => {
    res.render('ted5000.ejs', {
        pageName: 'Ted5000',
        sid: req.sessionId,
        userDocument: req.userDocument
    });


})


httpServer.on('test',function(d){console.log('event',d)})
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