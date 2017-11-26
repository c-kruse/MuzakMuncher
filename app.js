'use strict';
const   request = require('request'),
        cheerio = require('cheerio');
const   Listener = require('./app/listener.js'),
        Manager = require('./app/manager.js'),
        config = require('./config/config.js'),
        log = require('./config/log.js');

const MongoClient = require('mongodb').MongoClient;

/*  App creates connection to MongoDB data source
 *  Adds listeners to found resources
 */
MongoClient.connect(config.database.url).then(db => {
        log.info('Sucesfully connected to MongoDB');
        Manager.jams = db.collection('jams');
        Manager.bumps = db.collection('bumps');
    }).then(() => {
        addListeners();
    }).catch(error => {
        log.error('ERROR: Problem connecting to MongoDB.',error);
    });


/*  
 *  Constructs and starts Listeners for each found .xml resource found in the root_url
 */
function addListeners() {
    return request(config.root_url, function(error, response, body) {
        if(!error && response.statusCode === 200) {
            const   $ = cheerio.load(body),
                elements = $("a[href$='.xml']");
            
            elements.each((i, element) => {
                const target = config.root_url+$(element).attr('href');
                const listener = new Listener(target);
                listener.start()
                    .then(() => {
                        log.trace('New Listener to ' + target);
                    })
                    .catch(error => {
                        log.error("Error starting listener on target: "
                            + target, error);
                    });
            });

            log.info('found ' + elements.length + ' stations to listen to');
        }
    });
}
