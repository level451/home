const fork = require('child_process').fork;

startServer()
function startServer()
{
    //const child = fork( path.resolve('StartServer.js'), parameters, options);
    const child = fork( './Home.js');
    //child.send('test')
    child.on('close', (code)=> {
        if (code == 100){
            // special case for updating
            startServer()
        }
        console.log('process exit code ' + code);
    });
    child.on('message', message => {
        console.log('message from child:', message);
        child.send('Hi');
    });
    child.on('exit', (code)=> {
    });
    child.on('error', (code)=> {
        console.log('on error')

    });
}