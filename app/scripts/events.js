/**
 * Events are triggered by prerequisites. 
 * There is a minimum of two events:
 * 1. start_event
 * 2. finish_event
 * 
 * The start_event has to have an action_move_to_location with the first location in the game.
 */

var events = {
    start_event : {
        name : 'Awake',
        description : 'It begins as soon as you wake up, with a searing pain piercing your temples and spreading across your entire head.\n'+
        'Then comes the sickness, the dry mouth and the sudden panic - all accompanied alongside that phrase, "never again".\n\n'+
        'As soon as you open your eyes you realize: This is no hangover. Something terrible must have happened.\n'+
        'You are not in your bedroom, but in a dark, moist and cold room lying on a hard wooden bunk.\n'+
        'You have lost your memories of yesterday, the last thing you remember is... you are not sure WHAT you remember.',
        action_move_to_location : 'dungeon_cell',

    },

    trapdoor : {
        name : 'Open trapdoor',
        description : 'The trap door opens easily using its large metal ring. Opening it reveals a small corridor below your cell.',
        // Item to use (Inventory or room):
        prereq_item : '',
        // verb to use:
        prereq_action : 'open',
        // location:
        prereq_location : 'dungeon_cell',
        // item has to be in inventory:
        prereq_inventory : '',
        // TODO:
        prereq_preposition : '',
        // if you have to combine two items:
        prereq_second_item : '',
        // actions:

        // Add item to inventory (or location if set):
        action_add_item : '',
        // Add item defined in action_add_item to this location:
        action_add_item_location : '',
        // Remove item from inventory (if possible):
        action_remove_item : '',
        // new location description:
        action_new_location_description : 'An open trap door leads down.',
        // Move to location:
        action_move_to_location : '',
        // add a new connection to a location:
        action_new_connection : 'down',
        action_new_connection_location : 'corridor'
    },

    arest : {
        name : 'The guard arests you!',
        description : 'The guard points his sword into your direction. "You! Don\'t move!" he barks.\n'+
        'You stand still. He grabs your arm with his free left hand and hits you with his sword handle on the back of your head.\n'+
        'Again, it gets dark around you when you loose consciousness.',
        prereq_location : 'backward_corridor',
        action_move_to_location : 'dungeon_cell',
    },



    demo : {
        name : 'Demo',
        // will be echoed if the event is triggered:
        description : 'Demo event activated!.',
        // Prerequisites:
        // Item to use (Inventory or room):
        prereq_item : 'demo',
        // verb to use:
        prereq_action : 'switch',
        // location:
        prereq_location : '',
        // item has to be in inventory:
        prereq_inventory : 'demo',
        // TODO:
        prereq_preposition : 'on',
        // if you have to combine two items:
        prereq_second_item : '',
        // number of steps:
        prereq_steps : '',
        // actions:

        // Add item to inventory (or location if set):
        action_add_item : '',
        // Add item defined in action_add_item to this location:
        action_add_item_location : '',
        // Remove item from inventory (if possible):
        action_remove_item : '',
        // additional description for the location:
        action_new_location_description : '',
        // Move to location:
        action_move_to_location : '',
        // add a new connection to a location:
        action_new_connection : '',
        // id of the location:
        action_new_connection_location : ''
    },

}