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

function isEmpty(str) {
    return (!str || 0 === str.length);
}

