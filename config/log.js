const Logger = require('bunyan');
const log = new Logger({
    name:'MuzakMuncher',
    streams:[
        {
            stream:process.stdout,
            level:Logger.DEBUG
        },
        {
            stream:process.stderr,
            level:Logger.ERROR
        },
        {
            path:'./log/MuzakMuncher.log',
            level:Logger.TRACE
        }
    ],
    serializers:Logger.stdSerializers
});



module.exports = log;
