/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 15/04/14, at 11:19.
 */
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
                                     email: { type: String, validate: /.+@.+\..+/, unique: true },
                                     name: {type: String, required: true},
                                     lastName: {type: String, required: true}
                                 });

/************************************************************************************/
/*  --- Behavior ---                                                                */
/*  Methods must be added to the schema before compiling it with mongoose.model()   */
/************************************************************************************/

/**
 * Prints a greeting to the console.
 */
userSchema.methods.sayHello = function () {
    var greeting = this.name ? "Hey dude! My name is " + this.name : "I don't have a name";
    console.log(greeting);
};

//  Finally compiles this schema definition.
mongoose.model('User', userSchema);