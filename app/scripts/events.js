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
        prereq_inventory : '',
        // TODO:
        prereq_preposition : 'on',
        prereq_item_combinated : '',
        // actions:

        // Add item to inventory (or location if set):
        action_add_item : '',
        // Add item defined in action_add_item to this location:
        action_add_item_location : '',
        // Remove item from inventory (if possible):
        action_remove_item : '',
        // Move to location:
        action_move_to_location : ''
    }
}