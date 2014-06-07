/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 15/04/14, at 12:42.
 */
var properties = require('../properties')
    , expect = require('expect.js')
    , request = require('request').defaults({ json: true, auth: properties.auth });

describe('GET /users', function () {
    it('Should return all users: 0', function (done) {
        request.get(properties.uri + '/users', function (error, response) {

            expect(error).to.not.be.ok();
            expect(response.statusCode).to.be.equal(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.equal(2);

            done();
        });
    });
});

describe('POST /users/:id/subscriptions', function () {
    it('Should return true', function (done) {
        var id = '123456';
        request.post(properties.uri + '/users/' + id + '/subscriptions', function (error, response) {

            expect(error).to.not.be.ok();
            expect(response.statusCode).to.be.equal(200);

            done();
        });
    });
});