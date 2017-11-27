'use strict';
const   log = require('../config/log.js');

/* Manages transactions with MongoDB.
 * Expects to be initialized with the following collections
 * collections:
 *  bump:
 *      {
 *          _id:_id,
 *          time:time,
 *          station:{
 *              name : 'station name',
 *              location : 'location/of/resource'
 *          },
 *          jam:jamDenorm
 *      }
 *  jam:
 *      {
 *          _id     : '_id',
 *          artist  : 'artist',
 *          title   : 'title',
 *          album   : 'album'
 *          // to be extended with implementation of _annotateJam 
 *      }
 */
function Manager(bumps, jams) {
    this.bumps = bumps;
    this.jams = jams;
}

Manager.prototype.findPreviousBump = function (location) {
    const pipeline = [
        { $match: { 'station.location': location } },
        { $group: { _id: '$station.location', time: { $last: '$time' } } }
    ];

    return this.bumps.aggregate(pipeline).toArray()
        .then((agg) => {
            if (agg && agg[0] && (agg[0].time instanceof Date)) {
                return agg[0];
            }
            return { time: new Date(0) };
        });
};
Manager.prototype.retrieveJam = function (jam) {
    const that = this;
    return that.jams.findOne(jam).then(document => {
        if (document) {
            // Resolve found document
            return document;
        } else {
            return that.jams.insertOne(jam).then(response => {
                const insertedJam = response.ops[0];
                // Attempt to attach track info to Jam
                that._annotateJam(insertedJam).catch(error => {
                    log.warn({ err: error, jam: insertedJam },
                        'WARNING: Failed to annotate Jam');
                });
                // Resolve newly inserted doc
                return insertedJam;
            });
        }
    });
};
Manager.prototype.denormJam = function (jam) {
    return {
        _id: jam._id,
        title: jam.title,
        artist: jam.artist,
        album: jam.album
    };
};
Manager.prototype.bumpJam = function (bump) {
    return this.bumps.insertOne(bump).then(response => {
        log.info('[' + bump.station.name + '] Now Bumping '
            + bump.jam.artist + ' - ' + bump.jam.title);
        return response.ops[0];

    });
};
Manager.prototype._annotateJam = function (jam) {
    // stubbed out implementation for now
    // plans to call out to third party db for more track information
    return new Promise((resolve, reject) => {
        log.trace(jam, "Attempting to resolve Jam");
        setTimeout(resolve, 100000);
    });
};

module.exports = Manager;
