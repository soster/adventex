import chai, { expect } from 'chai';

import $ from 'jquery';
import terminal from 'jquery.terminal';
import Parser from 'app/scripts/parser.js';
import parseJson from 'app/scripts/json.js';
import EventHandler from 'app/scripts/eventhandler.js'
import InventoryHandler from 'app/scripts/inventoryhandler.js'
import LocationHandler from 'app/scripts/locationhandler.js'
import Interpreter from 'app/scripts/interpreter.js'

import {
  checkSynonyms,
  findFirstMatch,
  findItemIds,
  findItemIdsForName,
  getDescription,
  getFirstOfType,
  getLastOfType,
  getName,
  getOfType,
  getProperty,
  getSecondOfType,
  isHidden,
  listObjects,
  setStateOfObject
} from 'app/scripts/helper.js'



var assert = chai.assert;



// some mocking:
window.advntx = (function (my) {
  var parser;




  my.echo = function (text, color) {
    console.info('advntx> ' + text);
  };

  my.version = 14;
  return my;
  
}(window.advntx || {}));




before(function (done) {
  var advntx = window.advntx;



  // waits until done is called (async!)
  function async_done(bool) {
    advntx.parser = new Parser(advntx.vocabulary.verbs, advntx.vocabulary.directions, advntx.vocabulary.prepositions, advntx.vocabulary.adjectives, advntx.vocabulary.objects);
    
    var dummy = function()  {

    };
    advntx.inventoryHandler = new InventoryHandler(advntx.state,dummy);
    advntx.interpreter = new Interpreter(advntx);
    advntx.locationHandler = new LocationHandler(advntx.state);
    advntx.eventHandler = new EventHandler(advntx.state, advntx.vocabulary, dummy);
    done();
  };
  parseJson(async_done, advntx);
});

function echo(string) { };

var events = {
  open_door: {
    name: 'open door',
    prereq_verb: 'open',
    prereq_location: 'room',
    prereq_used_items: ['door'],
    action_new_connections: ['room:east:room_two']
  },

  close_door: {
    name: 'close door',
    prereq_verb: 'close',
    prereq_location: 'room',
    prereq_used_items: ['door']
  },
  add_stone: {
    name: 'add stone',
    prereq_location: 'undefined',
    action_add_items: ['location:stone']
  },
  remove_stone: {
    name: 'remove stone',
    prereq_location: 'undefined',
    action_remove_items: ['room:stone']
  },
  not_inventory: {
    name: 'not in inventory',
    prereq_verb: 'take',
    not: {
      prereq_inventory_items: ['torch']
    }
  },

  any_event: {
    name: 'any',
    prereq_verb: 'help',
    any: {
      prereq_inventory_items: ['torch'],
      prereq_inventory_items: ['stone']
    }
  },

  drop_torch: {
    name: 'drop torch',
    prereq_verb: 'drop',
    prereq_used_items: ['torch']
  },

  kindle_torch: {
    name: 'kindle torch',
    prereq_verb: 'kindle',
    prereq_used_items: ['torch'],
    prereq_inventory_items: ['torch|none'],
    action_set_state_items: ['torch|burning']
  },

  burn_on_torch: {
    name: 'burned on torch',
    prereq_verb: 'examine',
    prereq_location_items: ['torch|burning'],
  },

  extinguish_torch: {
    name: 'extinguish torch',
    prereq_verb: 'extinguish',
    prereq_used_items: ['torch'],
    prereq_inventory_items: ['torch|burning'],
    action_set_state_items: ['torch|none']
  },

  throw_stone_at_guard: {
    description: '',
    prereq_verb: 'throw',
    prereq_used_items: ['torch', 'guard']
  },

  clean_ring: {
    description: 'You clean the ring. It looks like it is pure gold!',
    prereq_verb: 'clean',
    prereq_used_items: ['ring|dirty', 'barrel|open'],
    action_set_state_items: ['ring|none']
  }

};

var locations = {
  room: {
    name: 'room',
    description: 'Testroom',
    connections: {

    },
    objects: ['door']
  },
  room_two: {
    name: 'room 2',
    description: 'second testroom',
    connections: {
      west: 'room'
    },
    objects: []
  },
  room_three: {
    name: 'room 3',
    description: 'Room with torch in it',
    connections: {
      east: 'room_two'
    },
    objects: ['torch']
  },
  room_connections: {
    name: 'room with connections',
    state: 'con',
    connections: {

    },
    states: {
      con: {
        name: 'con',
        connections: {
          north: ['room_two']
        }
      }
    }
  }

};

var objects = {
  guard: { name: 'guard' },
  unconscious_guard: { name: 'unconscious guard' },
  barrel: {
    name: 'barrel',
    description: 'A large barrel, approx. half your height. It is very heavy, it seems to be filled with water.',
    portable: false,
    definite_article: 'the',
    indefinite_article: 'a',
    states: {
      open: {
        name: 'open',
        description: 'A large barrel, approx. half your height. The lid is open and you see that it is filled with water.'
      }
    }
  },
  ring: {
    name: 'ring',
    description: 'A golden ring.\nIt looks very valuable!',
    state: 'dirty',
    definite_article: 'the',
    indefinite_article: 'a',
    states: {
      dirty: {
        name: 'dirty',
        description: 'A ring.\nIt is very dirty and should be cleaned.'
      }
    }
  },
  door: { name: 'door' },
  torch: {
    name: 'torch',
    states: {
      'burning': {
        name: 'burniiiiing'
      }
    },
    state: 'burning'
  }
};


describe('advntx test suite', function () {
  it('format string test', function () {
    assert.equal('test: test', 'test: {0}'.format('test'));
  });

  it('vocabulary loaded', function () {
    assert.notEqual(-1, advntx.vocabulary.verbs.indexOf('go'));
    assert.notEqual(-1, advntx.vocabulary.verbs.indexOf('throw'));
    assert.notEqual(-1, advntx.vocabulary.adjectives.indexOf('big'));
    assert.notEqual(-1, advntx.vocabulary.objects.indexOf('stone'));
    assert.notEqual(-1, advntx.vocabulary.directions.indexOf('north'));
  });

  it('parse command', function () {
    var localParser = new Parser(['go', 'throw'], [], [], [], ['something', 'barrel', 'stone']);
    
    var obj = localParser.parse('throw stone');
    assert.equal('throw', obj.verbs[0]);
    assert.equal('stone', obj.objects[0]);
  });

  it('find objects', function () {

    var names = ['guard', 'sugar'];
    var room_item_ids = ['unconscious_guard', 'barrel', 'stone'];

    assert.equal('unconscious_guard', findItemIds(names, room_item_ids, objects)[0]);
  });

  it('locations and connections', function () {
    advntx.state.inventory = ['stone'];
    advntx.state.objects = objects;
    advntx.state.locations = locations;
    advntx.state.location = 'room';

    var location = advntx.state.locations['room_connections'];
    assert.equal('room_two', advntx.locationHandler.findConnectionsForDirection(location, 'north'));
  });

  it('find events', function () {
    assert.equal(events[0], advntx.eventHandler.findEvents(location, ['door', 'stone'], 'open', undefined, events)[0]);
    assert.equal(0, advntx.eventHandler.findEvents(location, ['torch'], [], 'throw', undefined, events).length);
    assert.equal(1, advntx.eventHandler.findEvents(location, ['torch', 'guard'], [], 'throw', undefined, events).length);


  });

  it('execute some events', function () {
    var save = advntx.state;
    advntx.state = {
      steps: 0
    };
    advntx.state.inventory = ['stone'];
    advntx.state.objects = objects;
    advntx.state.locations = locations;
    advntx.state.location = 'room';
    var eventHandler = new EventHandler(advntx.state, advntx.vocabulary, function()  { });

    eventHandler.executeEvent(events['open_door'], echo);
    assert.equal(1, Object.keys(locations['room'].connections).length);
    eventHandler.executeEvent(events['add_stone'], echo);
    assert.equal('stone', locations['room'].objects[1]);
    eventHandler.executeEvent(events['remove_stone'], echo);
    assert.equal(1, locations['room'].objects.length);
    advntx.state.location = 'room_two';
    eventHandler.executeEvent(events['add_stone'], echo);
    assert.equal(1, locations['room_two'].objects.length);
    advntx.state = save;
  });

  it('testing "find not in inventory" events', function () {
    var save = advntx.state;
    advntx.state = {
      steps: 0
    };
    advntx.state.inventory = ['torch', 'stone'];
    advntx.state.objects = objects;
    advntx.state.locations = locations;
    advntx.state.location = 'room_three';
    var locationObjects = locations[advntx.state.location].objects;
    var oldEventHandler = advntx.eventHandler;
    advntx.eventHandler = new EventHandler(advntx.state,oldEventHandler.vocabulary, oldEventHandler.initInventory);
    var foundEvents = advntx.eventHandler.findEvents(location, ['torch'], locationObjects, 'take', undefined, events);
    assert.equal(0, foundEvents.length);
    advntx.state.inventory = [];
    var foundEvents = advntx.eventHandler.findEvents(location, ['torch'], locationObjects, 'take', undefined, events);
    assert.equal(1, foundEvents.length);
    assert.equal(events['not_inventory'], foundEvents[0]);
    advntx.state = save;
    advntx.eventHandler = oldEventHandler;

  });

  it('testing "find any" events', function () {
    advntx.state.inventory = ['torch'];
    var foundEvents = advntx.eventHandler.findEvents(location, ['torch'], [], 'help', undefined, events);
    assert.equal(1, foundEvents.length);
    assert.equal(events['any_event'], foundEvents[0]);
  });

  it('check events with state', function () {
    var save = advntx.state;
    advntx.state = {
      steps: 0
    };
    advntx.state.inventory = ['torch', 'stone'];
    advntx.state.objects = objects;
    advntx.state.locations = locations;
    advntx.state.location = 'room_three';
    var eventHandler = new EventHandler(advntx.state, advntx.vocabulary, function(){});
    var locationObjects = locations[advntx.state.location].objects;

    var foundEvents = eventHandler.findEvents(location, ['torch'], locationObjects, 'kindle', undefined, events);
    assert.equal(0, foundEvents.length);
    objects['torch'].state = 'none';
    var foundEvents = eventHandler.findEvents(location, ['torch'], locationObjects, 'kindle', undefined, events);
    assert.equal(events['kindle_torch'], foundEvents[0])
    eventHandler.executeEvent(events['kindle_torch'], echo);
    assert.equal('burning', objects['torch'].state);
    assert.equal('burniiiiing', advntx.inventoryHandler.getNameOfState('torch', 'burning'));
    var foundEvents = eventHandler.findEvents(location, ['torch'], locationObjects, 'extinguish', undefined, events);
    eventHandler.executeEvent(foundEvents[0], echo);
    assert.equal('none', objects['torch'].state);
    var foundEvents = eventHandler.findEvents(location, ['torch'], locationObjects, 'examine', undefined, events);
    assert.equal(0, foundEvents.length);
    objects['torch'].state = 'burning';
    var foundEvents = eventHandler.findEvents(location, ['torch'], locationObjects, 'examine', undefined, events);
    assert.equal(1, foundEvents.length);
    eventHandler.executeEvent(foundEvents[0], echo);

    var foundEvents = eventHandler.findEvents(location, ['ring'], ['ring', 'barrel'], 'clean', undefined, events);
    assert.equal(0, foundEvents.length);
  });

});

