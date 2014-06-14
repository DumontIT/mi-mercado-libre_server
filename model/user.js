/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 15/04/14, at 11:19.
 */
var SCHEMA_NAME = 'User';
console.log('Creating schema: ' + SCHEMA_NAME);
var mongoose = require('mongoose')
    , userSchema = mongoose.Schema({
                                       id: {type: String, unique: true},
                                       queries: {type: [String]}
                                   });

/************************************************************************************/
/*  --- Behavior ---                                                                */
/*  Methods must be added to the schema before compiling it with mongoose.model()   */
/************************************************************************************/

/**
 * Prints a greeting to the console.
 */
userSchema.methods.sayHello = function () {
    var greeting = this.id ? "Hey dude! My id is " + this.id : "I don't have a name";
    console.log(greeting);
};

//  Finally compiles this schema definition.
mongoose.model(SCHEMA_NAME, userSchema);
console.log('Schema compiled: ' + SCHEMA_NAME);