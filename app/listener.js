'use strict';
const   request = require('request'),
        cheerio = require('cheerio');

const log = require('../config/log.js'),
    config = require('../config/config.js');


function Listener(target, manager) {
    this.resource = target;
    this.manager = manager;
}


Listener.prototype.start = function(){
    const that = this;
    return this.manager.findPreviousBump(that.resource)
        .then(previousBump => {
            that.previousBump = previousBump;
        }).catch(error => {
            log.error('ERROR: Could not find last Bump', error);
            that.previousBump = {time:new Date(0)};
        }).then(() => that._listen());
};

/*
 *  Main component of Listener
 *  When called, attempts to fetch resource and parse out the current track information.
 *  If resource has been updated since previous record,  call Manager to bump jam
 */
Listener.prototype._listen = function() {
    const that = this;
    return request(that.resource, function(error, response, body) {
        if(!error && response.statusCode === 200) {
            const $ = cheerio.load(body);
            const time = that._parseDate($('program last_updated').text())
            
            if (time.getTime() !== that.previousBump.time.getTime()) {
                const jam = {
                        artist  : $('curr_song artist').text(),
                        title   : $('curr_song title').text(),
                        album   : $('curr_song cd').text()
                };
                const bump = {
                    time:time,
                    station:{
                        name : $('program name').text(),
                        location : that.resource
                    }
                };
                that.manager.retrieveJam(jam)
                    .then(jam => that.manager.denormJam(jam))
                    .then(jam => { bump.jam = jam; })
                    .then(jam => that.manager.bumpJam(bump))
                    .then(bump => {that.previousBump = bump})
                    .catch(error => {
                        log.error('ERROR: Could not Bump that Jam', error);
                    }).then(() => that._reschedule());

            } else {
                that._reschedule();
            }
        } else {
            log.error('ERROR: Could not retrieve resource', response.statusCode, error)
            that._reschedule();
        }
    });
};

/*
 * Guess timeout and reschedule _listen()
 */
Listener.prototype._reschedule = function () {
    const timeout = this._guessTimeout(this.previousBump)
    setTimeout(this._listen.bind(this), timeout);
};

/* Naive implementation for now
 * Guesses the length of a song to be STANDARD_DURATION and returns timeout for
 *  updateTime + STANDARD_DURATION with a built in minimum timeout of MIN_TIMEOUT
 */
Listener.prototype._guessTimeout = function(bump) {
    const asOfTime = (new Date()).getTime();  // Current time
    if (bump && bump.time) {
        const lastUpdate = bump.time.getTime();
        if ((asOfTime - lastUpdate) < DAY) { // if updated in the past 24 hours, make guess
            const standardTimeRemaining = lastUpdate + STANDARD_DURRATION - asOfTime;
            return Math.max(MIN_TIMEOUT, standardTimeRemaining);
        }
    }
    return DAY // otherwise try again tomorrow
};

/*
 * Date comes in ridiculous non-standard format YYYY-MM-DDTHH-mm-ss
 * This function transforms it to an ISO 8601 string
 * Adds EST(UTC-5) time zone information.
 */
Listener.prototype._parseDate = function(text) {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/.test(text)) {
        const dateSplit = text.split('T');
        dateSplit[1] = dateSplit[1].replace(/-/g, ':');
        const result = new Date(dateSplit.join('T') + '-0500');
        return result;
    }
    return new Date(0);
};

const DAY = 24*60*60*1000;    // One day in ms
const STANDARD_DURRATION = 3*60*1000 + 30*1000;   // 3.5 minutes
const MIN_TIMEOUT = 20*1000; // 20 seconds


module.exports = Listener;
