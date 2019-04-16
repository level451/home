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
        test: ''
    }
};
loadLocalSettings();
database = require('@level451/httpServer').database;
database.on('ff',()=>{console.log('aaaaaaaaaaaaaaaaaaaaaaafffffffffffffffffffffffff')})
database.getMongoConnection('Home').then((dbo)=> {
    global.dbo = dbo
   //  dbo.collection('Session').find({'urlHistory.requestId':database.ObjectID('5cb4bc1d4b02bd3f4cf16921')}).toArray().then((r)=>{console.log('-=---------',r)})
})
//comment this line to use the regular console.log
console = require('@level451/newConsole');
const webSocketServer = require('@level451/httpServer').webSocketServer;
httpServer = require('@level451/httpServer')({useHttps: true, port: 2112});

httpServer.get('/', (req, res) => {
    res.render('homePowerStatus.ejs', {
        pageName: 'Power Status',
        sid: req.sessionId,
        userDocument: req.userDocument
    });
});
httpServer.use(require('@level451/httpServer').pageNotFound)


function loadLocalSettings() {
    try {
        global.localSettings = require('./localSettings');
    } catch (err) {
        console.log('Local Settings Failed to Load - Going into setting mode');
        global.localSettings = false;
    }
}
webSocketServer.on('browserConnect',(e)=>{console.log(e)})