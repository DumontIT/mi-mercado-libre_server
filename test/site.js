/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/05/14, at 22:43.
 */
var expect = require('expect.js')
    , request = require('request').defaults({ json: true })
    , properties = require('../properties');

describe('GET /sites', function () {
    it('Should return all sites: 13', function (done) {
        request.get(properties.uri + '/sites', function (error, response) {

            expect(error).to.not.be.ok();
            expect(response.statusCode).to.be.equal(200);
            expect(response.body).to.be.an('array');
            expect(response.body.length).to.be.equal(13);

            done();
        });
    });
});