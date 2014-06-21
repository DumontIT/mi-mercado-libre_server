/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/06/14, at 15:42.
 */
var properties = require('../properties')
    , rollbar = require('rollbar')
    , util = require('util');

/**
 * TODO : Documentation for handleGenericError
 * @param error The error to handle.
 * @param customMessage
 * @param level must be one of critical, error, warning, info, debug. Default value is error.
 * @returns {*}
 */
var handleGenericError = function (error, customMessage, level) {
    if (error) {
        console.log('An error occurred while %s: %s', customMessage, error);

        var message = util.format('%s, error: %s', customMessage, error);
        rollbar.reportMessage(message, level || 'error', undefined, properties.monitoring.rollbar.callback);
    }

    return error;
};

/**
 * TODO : Documentation for handleMeliResponse
 * @param error The library error to handle.
 * @param response The response error to handle.
 * @param customMessage
 * @param level must be one of critical, error, warning, info, debug. Default value is error. * @returns {*}
 */
var handleMeliResponse = function (error, response, customMessage, level) {
    var libraryError = handleGenericError(error, customMessage, level)
        , callError;

    if (response) {
        if (response.status) {
            callError = response.message;

            console.log('An error occurred while %s: (%s) %s', customMessage, response.status, callError);

            var message = util.format('%s, error: %s', customMessage, callError);
            rollbar.reportMessage(message, level || 'error', undefined, properties.monitoring.rollbar.callback);
        }
    } else {
        callError = util.format('%s, response is undefined. Must be a library error!', customMessage);
    }

    return libraryError || callError;
};

module.exports.handle = handleGenericError;
module.exports.handleMeliResponse = handleMeliResponse;