/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 13/06/14.
 */
var SCHEMA_NAME = 'Product';
console.log('Creating schema: ' + SCHEMA_NAME);

var mongoose = require('mongoose')
    , productSchema = mongoose.Schema({
                                          query: {type: String, unique: true},
                                          filters: {type: [String]},
                                          subscribedUsers: {type: [mongoose.Schema.Types.ObjectId]}
                                      });

/************************************************************************************/
/*  --- Behavior ---                                                                */
/*  Methods must be added to the schema before compiling it with mongoose.model()   */
/************************************************************************************/


//  Finally compiles this schema definition.
mongoose.model(SCHEMA_NAME, productSchema);
console.log('Schema compiled: ' + SCHEMA_NAME);