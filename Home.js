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
//console = require('./newConsole') //comment this line to use the regular console.log

try{
    global.localSettings = require('./localSettings')
} catch(err){
    console.log('Local Settings Failed to Load - Going into setting mode')
    global.localSettings = false
}

ted = require('./ted5000')
 webSocketServer = require('./WebSocketServer')
const httpsServer = require('./HttpsServer')
database = require('./Database')




database.getMongoConnection('Home',function(err,dbo){
    if (err){console.error(err)
    }else
    {
        global.dbo = dbo
    }

})

