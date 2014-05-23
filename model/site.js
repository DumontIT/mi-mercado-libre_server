/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 22/05/14, at 21:20.
 */
var SCHEMA_NAME = 'Site';
console.log('Creating schema: ' + SCHEMA_NAME);

var mongoose = require('mongoose')
    , siteSchema = mongoose.Schema({
                                       id: {type: String, required: true, unique: true},
                                       name: {type: String, required: true, unique: true},
                                       currencies: {type: Array}
                                   });

/************************************************************************************/
/*  --- Behavior ---                                                                */
/*  Methods must be added to the schema before compiling it with mongoose.model()   */
/************************************************************************************/



//  Finally compiles this schema definition.
mongoose.model(SCHEMA_NAME, siteSchema);
console.log('Schema compiled: ' + SCHEMA_NAME);