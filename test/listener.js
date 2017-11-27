'use strict';
const chai = require("chai"),
    sinon = require("sinon");

const Listener = require('../app/listener.js');

// Extend chai to compare date strings
chai.Assertion.addChainableMethod('equalDate', function(date) {
    const expected = date.toDateString();
    const actual = this._obj.toDateString();
    return this.assert(expected === actual, "Expected:" + expected + " but got:" + actual,
        "Got " + actual + " expected to not equal " + expected);
});
const expect = chai.expect;


describe("Listener", () => {
    describe("_parseDate", () => {
        it("Should parse dates", () => {
            const $listener = new Listener(null, null);

            const stringDate = '2012-12-21T13-31-04';
            const actualDate = new Date('2012-12-21T13:31:04-0500');
            expect($listener._parseDate(stringDate)).to.be.instanceof(Date).that.equalDate(actualDate);
        });
        it("Should return a Date with time 0 if it can't parse the date.", () => {
            const $listener = new Listener(null, null);
            const invalidFormats = ['', 'hai', null, '<script>alert(\'hello\');</script>', '20121221T133145', '2012-12-21T13:31:04-0500'];
            invalidFormats.forEach((format) => {
                expect($listener._parseDate(format)).to.be.instanceof(Date).that.equalDate(new Date(0));
            })
        });
    });
    describe("_guessTimeout", () => {
        xit("Should do more unit testing", () => { });
    });
    describe("_reschedule", () => {
        xit("Should do more unit testing", () => { });
    });
    describe("_listen", () => {
        xit("Should do more unit testing", () => { });
    });
    describe("start", () => {
        xit("Should do more unit testing", () => { });
    });
    
});