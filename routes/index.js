/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 13/06/14, at 15:38.
 */

module.exports = function (app) {
    require('./site')(app);
    require('./user')(app);
};

