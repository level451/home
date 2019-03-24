// localSettingsDescrition describes all the global localSettings values and thier defaults
// modify this object to add to the local settings
global.localSettingsDescription = {webServer:{
        Description:"HTTPS Server Listen Port",
        port:'2112'},
        theme:{Description:"Name of the Web theme style",theme:'Default'},
    MongoServer:{
        Description:"Infomation about the Mongo Server",
        Address:'',
        useTingoDB:'true'}


}



// First set the console.log handler
//comment this line to use the regular console.log
//console = require('./common/newConsole/newConsole')

try{
    global.localSettings = require('./localSettings')
} catch(err){
    console.log('Local Settings Failed to Load - Going into setting mode')
    global.localSettings = false
}

ted = require('./ted5000')
 webSocketServer = require('./WebSocketServer')
//const y = require('./HttpsServer')
//const httpsServer = new y()
const httpsServer = require('./HttpsServer')({useHttps:false})


httpsServer.use(function(req, res, next) {
    console.log('here ---',req.Session,req.sessionId,req.userDocument)
    next();
})

httpsServer.get('/t', (req, res) => {
    res.status(200).send(':)')



})
httpsServer.get('/', (req, res) => {
    res.render('ted5000.ejs', {
        pageName: 'Ted5000',
        sid: req.sessionId,
        userDocument: req.userDocument
    });


})


httpsServer.on('test',function(d){console.log('event',d)})
database = require('./Database')




database.getMongoConnection('Home',function(err,dbo){
    if (err){console.error(err)
    }else
    {
        global.dbo = dbo
    }

})

