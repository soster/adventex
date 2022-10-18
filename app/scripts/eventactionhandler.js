'use strict';

import {
    checkSynonyms,
    setStateOfObject
  } from 'app/scripts/helper.js'

import * as constants from 'app/scripts/const.js';


export default class EventActionHandler {
    constructor(state, vocabulary, inventoryHandler, locationHandler, echo) {
        this.state = state;
        this.vocabulary = vocabulary;
        this.inventoryHandler = inventoryHandler;
        this.locationHandler = locationHandler;
        this.echo = echo;
    }

    execute_action(action) {
        throw 'executeEvent not implemented!';
    }

    static get_name() {
        throw 'get_name not implemented!';
    }

    static create_action_handler_properties(object, state, vocabulary, inventoryHandler, locationHandler, echo) {
        // ActionEventHandler as object properties, later it should be possible to have new ActionEvents per game:
        object[MoveItemActionHandler.get_name()] = new MoveItemActionHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[RemoveItemActionHandler.get_name()] = new RemoveItemActionHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[AddItemActionHandler.get_name()] = new AddItemActionHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[NewConnectionsHandler.get_name()] = new NewConnectionsHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[MoveToLocationActionHandler.get_name()] = new MoveToLocationActionHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[DisableEventsActionHandler.get_name()] = new DisableEventsActionHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[EnableEventsActionHandler.get_name()] = new EnableEventsActionHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[UntriggerEventsActionHandler.get_name()] = new UntriggerEventsActionHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[SetStateItemsActionEventHandler.get_name()] = new SetStateItemsActionEventHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[SetStateLocationsActionEventHandler.get_name()] = new SetStateLocationsActionEventHandler(state, vocabulary, inventoryHandler, locationHandler, echo);
        object[PointsActionEventHandler.get_name()] = new PointsActionEventHandler(state, vocabulary, inventoryHandler, locationHandler, echo);

    }

    add_items(action) {
        // into the inventory
        for (var i = 0; i < action.length; i++) {
            var temp = action[i].split(':');
            if (temp.length == 1 || (temp.length == 2 && temp[0] == constants.INVENTORY)) {//inventory
                var obj = temp[0];
                if (temp.length == 2) {
                    obj = temp[1];
                }
                var stateSplit = obj.split('|');
                if (stateSplit.length == 2) {
                    this.state.objects[stateSplit[0]].state = stateSplit[1];
                }
                this.inventoryHandler.addToInventory(stateSplit[0]);
            } else if (temp.length == 2) {//location
                var location;
                if (temp[0] == constants.LOCATION) {
                    location = this.state.locations[this.state.location];
                } else {
                    location = this.state.locations[temp[0]];
                }

                var stateSplit = temp[1].split('|');
                if (stateSplit.length == 2) {
                    this.state.objects[stateSplit[0]].state = stateSplit[1];
                }

                if (location.objects[stateSplit[0]] === undefined) {
                    location.objects.push(stateSplit[0]);
                }
            }
        }
    }

    remove_items(action) {
        var removed = false;

        for (var i = 0; i < action.length; i++) {
            var temp = action[i].split(':');
            if (temp.length == 1 || (temp.length == 2 && temp[0] == constants.INVENTORY)) {//inventory
                var ilength = this.state.inventory.length;
                var obj = temp[0];
                if (temp.length == 2) {
                    obj = temp[1];
                }
                this.inventoryHandler.removeFromInventory(obj);
                if (this.state.inventory.length < ilength) {
                    removed = true;
                }
            } else if (temp.length == 2) {
                var location;
                if (temp[0] == constants.LOCATION) {
                    location = this.state.locations[this.state.location];
                } else {
                    location = this.state.locations[temp[0]];
                }
                var olength = location.objects.length;
                location.objects.remove(temp[1]);
                if (location.objects.length < olength) {
                    removed = true;
                }
            }
        }
        return removed;
    }

    move_items(action) {
        for (var i = 0; i < action.length; i++) {
            var temp = action[i].split(':');
            if (temp.length == 3) {
                var obj = temp[0];
                var from = temp[1];
                var to = temp[2];
                var removed = false;

                if (from === constants.INVENTORY) {
                    removed = this.remove_items(obj);
                } else {
                    removed = this.remove_items([from + ':' + obj]);
                }

                if (to === constants.INVENTORY && removed) {
                    this.add_items(obj);
                } else if (removed) {
                    this.add_items([to + ':' + obj]);
                }
            }
        }
    }

}


class MoveItemActionHandler extends EventActionHandler {
    execute_action(action) {
        this.move_items(action);
    }

    static get_name() {
        return 'action_move_items';
    }
}

class RemoveItemActionHandler extends EventActionHandler {
    execute_action(action) {
        this.remove_items(action);
    }

    static get_name() {
        return 'action_remove_items';
    }
}

class AddItemActionHandler extends EventActionHandler {
    execute_action(action) {
        this.add_items(action);
    }

    static get_name() {
        return 'action_add_items';
    }
}

class NewConnectionsHandler extends EventActionHandler {
    execute_action(action) {
        for (var i = 0; i < action.length; i++) {
            var temp = action[i].split(':');
            var place = this.state.locations[temp[0]];
            var direction = temp[1];
            var to = temp[2];
            place.connections[direction] = to;
        }
    }

    static get_name() {
        return 'action_new_connections';
    }
}

class MoveToLocationActionHandler extends EventActionHandler {
    execute_action(action) {
        this.locationHandler.setLocation(action);
    }
    static get_name() {
        return 'action_move_to_location';
    }
}

class DisableEventsActionHandler extends EventActionHandler {
    execute_action(action) {
        for (var i = 0; i < action.length; i++) {
            var nevent = this.state.events[action[i]];
            nevent.disabled = true;
        }
    }
    static get_name() {
        return 'action_disable_events';
    }
}

class EnableEventsActionHandler extends EventActionHandler {
    execute_action(action) {
        if (!isEmpty(action)) {
            for (var i = 0; i < action.length; i++) {
                var nevent = this.state.events[action[i]];
                if (nevent != undefined) {
                    nevent.disabled = false;
                    nevent.triggered_steps = this.state.steps;
                }
            }

        }
    }
    static get_name() {
        return 'action_enable_events';
    }
}


class UntriggerEventsActionHandler extends EventActionHandler {
    execute_action(action) {
        for (var i = 0; i < action.length; i++) {
            var nevent = this.state.events[action[i]];
            if (nevent != undefined) {
                nevent.triggered = false;
                nevent.triggered_steps = 0;
            }
        }
    }
    static get_name() {
        return 'action_untrigger_events';
    }
}

class SetStateItemsActionEventHandler extends EventActionHandler {
    execute_action(action) {
        for (var i = 0; i < action.length; i++) {
            var arr = action[i].split('|');
            setStateOfObject(arr[0], arr[1], this.state.objects);
        }
    }
    static get_name() {
        return 'action_set_state_items';
    }
}

class SetStateLocationsActionEventHandler extends EventActionHandler {
    execute_action(action) {
        for (var i = 0; i < action.length; i++) {
            var arr = action[i].split('|');
            setStateOfObject(arr[0], arr[1], this.state.locations);
        }
    }
    static get_name() {
        return 'action_set_state_locations';
    }
}

class PointsActionEventHandler extends EventActionHandler {
    execute_action(action) {
        this.state.points += action;
    }
    static get_name() {
        return 'action_points';
    }
}

