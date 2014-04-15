/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 15/04/14, at 12:42.
 */
var expect = require('expect.js')
    , request = require('request').defaults({ json: true });

var uri = 'http://localhost:5000';

describe('GET /users', function () {
    it('Should return all users: 0', function (done) {
        request.get(uri + '/users', function (error, response) {

            expect(error).to.not.be.ok();
            expect(response.statusCode).to.be.equal(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.equal(2);

            done();
        });
    });
});