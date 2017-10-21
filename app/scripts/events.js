var events = {
    flashlight_on : {
        name : 'Flashlight active',
        // will be echoed if the event is triggered:
        description : 'The flashlight shines brightly.',
        // Prerequisites:
        // Item to use (Inventory or room):
        prereq_item : 'flashlight',
        // verb to use:
        prereq_action : 'switch',
        // location:
        prereq_location : '',
        // item has to be in inventory:
        prereq_inventory : 'flashlight',
        // TODO:
        prereq_preposition : 'on',
        // if you have to combine two items:
        prereq_second_item : '',
        // actions:

        // Add item to inventory (or location if set):
        action_add_item : '',
        // Add item defined in action_add_item to this location:
        action_add_item_location : '',
        // Remove item from inventory (if possible):
        action_remove_item : '',
        // Move to location:
        action_move_to_location : '',
        // add a new connection to a location:
        action_new_connection : '',
        action_new_connection_location : ''
    },

    magic_trick : {
        name : 'Magic Trick',
        description : 'Expectum Patronum',
        // Item to use (Inventory or room):
        prereq_item : '',
        // verb to use:
        prereq_action : 'conjure',
        // location:
        prereq_location : '',
        // item has to be in inventory:
        prereq_inventory : '',
        // TODO:
        prereq_preposition : '',
        // if you have to combine two items:
        prereq_second_item : '',
        // actions:

        // Add item to inventory (or location if set):
        action_add_item : 'potato',
        // Add item defined in action_add_item to this location:
        action_add_item_location : 'start_room',
        // Remove item from inventory (if possible):
        action_remove_item : '',
        // Move to location:
        action_move_to_location : '',
        // add a new connection to a location:
        action_new_connection : '',
        action_new_connection_location : ''
    },

    open_east_door : {
        name : 'Open door',
        description : 'Krrrk... the door is open.',
        // Item to use (Inventory or room):
        prereq_item : 'door',
        // verb to use:
        prereq_action : 'open',
        // location:
        prereq_location : '',
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
        // Move to location:
        action_move_to_location : '',
        // add a new connection to a location:
        action_new_connection : 'east',
        action_new_connection_location : 'room_behind_door'
    },

    angry_troll : {
        name : 'Angry troll',
        description : 'The troll is not impressed. He knocks you out with a big club. You loose conscience\n\n\n'+
        'You wake up with the headache of your life...',
        // Item to use (Inventory or room):
        prereq_item : 'troll',
        // verb to use:
        prereq_action : 'talk',
        action_move_to_location : 'dungeon'
    }


}