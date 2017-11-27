'use strict';
const   chai = require("chai"),
        sinon = require("sinon");

const Manager = require('../app/manager.js');


const assert = chai.assert;
const expect = chai.expect;

process.on('unhandledRejection', (reason, p) => {
    assert.fail(p,reason)
});

describe("Manager", () => {
    describe("denormJam", () => {
        it("Should denormalize jam", () => {
            const $manager = new Manager(null, null);
            const j = {
                _id: '_id',
                title: 'jam.title',
                artist: 'jam.artist',
                album: 'jam.album',
                foo: 'foo'
            }
            const dj = $manager.denormJam(j)
            expect(dj).to.not.equal(j);
            expect(dj._id).to.equal(j._id);
            expect(dj.title).to.equal(j.title);
            expect(dj.artist).to.equal(j.artist);
            expect(dj.album).to.equal(j.album);
            expect(dj).to.not.have.property('foo');
        });
    });
    describe("findPreviousBump", () => {
        it("Should error on db error", () => {
            const aggregateStub = sinon.stub().throws();
            const $manager = new Manager({ aggregate: aggregateStub }, null)
            
            expect($manager.findPreviousBump, "Expected findPreviousBump to throw").to.throw();
        });
        it("Should return new Date on empty aggregate response", (done) => {
            const toArrayStub = sinon.stub().resolves([]);
            const aggregateStub = sinon.stub().returns({ toArray: toArrayStub });
            const $manager = new Manager({ aggregate: aggregateStub }, null)

            $manager.findPreviousBump('garbage').catch(error => {
                throw new Error(error);
            }).then(result => {
                expect(aggregateStub.called, "Expected bumps.aggregate(..) to be called").to.be.true;
                expect(toArrayStub.called, "Expected bumps.aggregate(..).toArray() to be called").to.be.true;
                expect(result, "Expected result with property 'time' with type of Date").to.have.property('time').that.is.a('Date');
                expect(result.time.getTime(), "Expected time to be 0").equal(0);
                done();
            })
            
        });
        it("Should return first Date from aggregate response", (done) => {
            const toArrayStub = sinon.stub().resolves([{time:new Date(1)}, {time:new Date(2)}]);
            const aggregateStub = sinon.stub().returns({ toArray: toArrayStub });
            const $manager = new Manager({ aggregate: aggregateStub }, null)

            $manager.findPreviousBump('garbage').catch(error => {
                throw new Error(error);
            }).then(result => {
                expect(aggregateStub.called, "Expected bumps.aggregate(..) to be called").to.be.true;
                expect(toArrayStub.called, "Expected bumps.aggregate(..).toArray() to be called").to.be.true;
                expect(result, "Expected result with property 'time' with type of Date").to.have.property('time').that.is.a('Date');
                expect(result.time.getTime(), "Expected time to be 1").equal(1);
                done();
            })
        });
    });
    describe("retrieveJam", () => {
        xit("Should do some more unit testing", () => {
            expect("this unit test").to.equal("useful");
        })
    });
    describe("bumpJam", () => {
        xit("Should do some more unit testing", () => {
            expect("this unit test").to.equal("useful");
        })
    });
    
});