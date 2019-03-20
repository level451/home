
//const MongoClient = require('mongodb').MongoClient;
const MongoClient=require('tingodb')()
//const assert = require('assert');
/* const requiredCollections
Each object in the array requiredCollections is verified that it exists in the database
if not, the collection is added to the database, and the data is added to the collection
if the data is an array, it will add each object in the array , otherwise it will just add the data:object
if the optional index property is included, it will add the indexes
  see https://docs.mongodb.com/manual/reference/command/createIndexes/ for index instructions
 */

const requiredCollections = [
    {name:'Users',
        data:[{  userName:'twitzel',
            secretKey:'KQ2HCKLCGF6VER3XERVU6URXNM',
            accessLevel:10,
            displayName:'Todd',
            preferences:{webTheme:'Default'}
        },{  userName:'switzel',
            secretKey:'KQ2HCKLCGF6VER3XERVU6URXNM',
            accessLevel:10,
            displayName:'Pops',
            preferences:{webTheme:'Default'}

        }
        ],
        index:[{key:{userName:1}},{key:{accessLevel:-1}}],

    },
    {name:'Session',
        options:{capped : true, size : 1000000, max : 100}},
    {name:'errorLog',index:[{key:{mac:1}},{key:{timeStamp:1}}]}
]


// Connection URL
if (!localSettings){
    console.log('WARNING - localSetting not found attempting to connect with default settings')
    var url = 'mongodb://'+localSettingsDescription.MongoServer.Address+':27017'
    console.log('url',url)

} else
{
    if (localSettings.MongoServer.useTingoDB == 'true'){
        var url = 'mongodb://'+localSettings.MongoServer.Address+':27017'
    }else

    {
        var url = ''
    }
}

var client
// Database Name

// Use connect method to connect to the server
exports.getMongoConnection = function(databaseName,cb){
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, client) {
        if (err){

            cb(err)
        } else
        {
            console.log("Connected successfully to Mongo Server");
            checkIfCollectionsExist(client.db(databaseName))
            clearSystemInfoConnectionState(client.db(databaseName)); // reset the connection state of everything connected on restart
            cb(err,client.db(databaseName))

        }

    })

    function checkIfCollectionsExist(dbo){
        dbo.command({listCollections:1},function(err,rslt){
            if(err){
                console.log(err)
                return;
            }
            let allCollectionsExist = true;
            let collectionrList = []
            for (let i=0; i<rslt.cursor.firstBatch.length;++i){
                collectionrList.push(rslt.cursor.firstBatch[i].name)
            }
            for (let i=0; i<requiredCollections.length;++i){

                if (collectionrList.indexOf(requiredCollections[i].name) == -1){
                    // collection doesnt exist
                    allCollectionsExist = false
                    console.log('Collection Doesnt Exist:'+requiredCollections[i].name)
                    dbo.createCollection(requiredCollections[i].name,requiredCollections[i].options,function(err,rslt){
                        console.log('created collection:',requiredCollections[i].name)

                        // determin if we are just adding 1 record or many
                        if(requiredCollections[i].data) {


                            if (requiredCollections[i].data.constructor === Array) {
                                // insert the objects
                                dbo.collection(requiredCollections[i].name).insertMany(requiredCollections[i].data, function (err, rslt) {
                                    if (err) {
                                        throw err
                                    }
                                    else {
                                        console.log('Collection Created:' + requiredCollections[i].name)
                                    }

                                    if (requiredCollections[i].index) {
                                        dbo.collection(requiredCollections[i].name).createIndexes(requiredCollections[i].index, function (err, rslt) {
                                            console.log('Index Created:' + JSON.stringify(requiredCollections[i].index))
                                        })
                                    } else {
                                        console.log('No Indexes required')
                                    }
                                })
                            } else {
                                dbo.collection(requiredCollections[i].name).insertOne(requiredCollections[i].data, function (err, rslt) {
                                    if (err) {
                                        throw err
                                    }
                                    else {
                                        console.log('Collection Created:' + requiredCollections[i].name)
                                    }
                                    if (requiredCollections[i].index) {
                                        dbo.collection(requiredCollections[i].name).createIndexes(requiredCollections[i].index, function (err, rslt) {
                                            console.log('Index Created:' + JSON.stringify(requiredCollections[i].index))
                                        })
                                    } else {
                                        console.log('No Indexes required')
                                    }
                                })
                            }
                        } else {
                            //no datat to insert just possibly an index
                            if (requiredCollections[i].index) {
                                dbo.collection(requiredCollections[i].name).createIndexes(requiredCollections[i].index, function (err, rslt) {
                                    console.log('Index Created:' + JSON.stringify(requiredCollections[i].index))
                                })
                            } else {
                                console.log('No Indexes required')
                            }

                        }



                    })



                }

            }
            if (allCollectionsExist){
                console.log('All Required Collections Exist In the Database '+databaseName)
            }


        })

    }
}
exports.logSystemInfo = function(mac,event,data) {
    dbo.collection('SystemInfo').updateOne({mac: mac}, {$set: {[event]: data}}, {upsert: true}, (err, resp) => {
        if (err) {
            console.log("Problem logging system info", err)
        }

    })
}
exports.getSystemInfo = function (filter, cb) {
    dbo.collection('SystemInfo').find(filter).toArray((err, rslt) => {
        if (!err) {
            var outputObject = {};
            // transform array to an object indexed off of the mac
            for (var i = 0; i < rslt.length ; i++) {
                outputObject[rslt[i].mac] = rslt[i]
            }

        }
        cb(outputObject);
    })
}
function clearSystemInfoConnectionState(db){
        db.collection('SystemInfo').updateMany({},{$set: {connectionState:false}},(err,rslt) =>{
            if (err) {
                console.log("Problem clearing systemInfo connectionState", err)
            }


        })
}