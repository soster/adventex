var things = {
    flashlight : {
        description : 'A simple LED flashlight, batteries included!',
        portable : true
    },

    tapestry : {
        description : 'A heavy, wooven tapestry showing a fat winged baby.',
        portable : false
    },

    vase : {
        description : 'A small, chinese vase with marine blue and black chinese signs around the neck.',
        portable : true
    }

}

function is_portable(item) {
    if (things[item] === undefined) {
        return false;
    }
    return things[item].portable;
}