/**
 * Created by Nahuel Barrios <barrios.nahuel@gmail.com>.
 * Created on 20/06/14, at 13:17.
 */
var _ = require('underscore');

/**
 * Merges two object-like arrays based on a key property and also merging its array like attributes specified in arraysToMergeProperties.
 * It also removes falsy values after merging object properties.
 *
 * @param firstArray The original object-like array.
 * @param secondArray An object-like array to add to the firstArray.
 * @param keyProperty The object property that will be used to check if objects from different arrays are the same or not.
 * @param arraysToMergeProperties The list of object properties that you want to merge. It all must be arrays.
 * @returns The updated original array.
 */
function merge(firstArray, secondArray, keyProperty, arraysToMergeProperties) {

    function mergeObjectProperties(object, otherObject, objectPropertiesToMerge) {
        _.each(objectPropertiesToMerge, function (eachProperty) {
            object[eachProperty] = _.chain(object[eachProperty]).union(otherObject[eachProperty]).compact().value();
        });
    }

    if (firstArray.length === 0) {
        _.each(secondArray, function (each) {
            firstArray.push(each);
        });
    } else {
        _.each(secondArray, function (itemFromSecond) {
            var itemFromFirst = _.find(firstArray, function (item) {
                return item[keyProperty] === itemFromSecond[keyProperty];
            });

            if (itemFromFirst) {
                mergeObjectProperties(itemFromFirst, itemFromSecond, arraysToMergeProperties);
            } else {
                firstArray.push(itemFromSecond);
            }
        });
    }

    return firstArray;
}

_.mixin({
            merge: merge
        });