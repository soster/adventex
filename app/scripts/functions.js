/** some useful functions. */


/**
* Simple format function:
* 'Replace {0}'.format('this')
*/
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

function get_first_of_type(words, type) {
    if (words[type].length>0) {
        return words[type][0];
    }
    return '';
}

function get_description(objects, name) {
    var obj = objects[name];
    if (obj === undefined) {
        return '';
    }
    var description = obj.description;
    if (description !== undefined)
        return description;
    return '';
}