'use strict';
(function () {


  var assert = chai.assert;


  before(function (done) {
    // waits until done is called (async!)
    advntx.parse_json(done);
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
      name:'',
      prereq_verb: 'take',
      prereq_items: ["torch"],
      prereq_not_inventory_items: ['torch']
    },

    drop_torch: {
      name: 'drop torch',
      prereq_verb: 'drop',
      prereq_used_items: ['torch']
    },

    kindle_torch: {
      name:'kindle torch',
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
      name:'extinguish torch',
      prereq_verb: 'extinguish',
      prereq_used_items: ['torch'],
      prereq_inventory_items: ['torch|burning'],
      action_set_state_items: ['torch|none']
    },

    throw_stone_at_guard: {
			description: '',
			prereq_verb: 'throw',
			prereq_used_items: ['torch','guard']
		},

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
        west: "room"
      },
      objects: []
    },
    room_three: {
      name: 'room 3',
      description: 'Room with torch in it',
      connections: {
        east: 'room_two'
      },
      objects:['torch']
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
            north:['room_two']
          }
        }
      }
    }

  };

  var objects = { 
    guard: { name: 'guard' }, 
    unconscious_guard: { name: 'unconscious guard' }, 
    barrel: { name: 'barrel' }, 
    door: { name: 'door' },
    torch: { name: 'torch',
             states:{'burning': {
               name: 'burniiiiing'
             }},
             state:'burning'
             } };


  describe('advntx test suite', function () {
    it('format string test', function () {
      assert.equal("test: test", "test: {0}".format("test"));
    });

    it('vocabulary loaded', function () {
      assert.notEqual(-1, advntx.vocabulary.verbs.indexOf('go'));
      assert.notEqual(-1, advntx.vocabulary.verbs.indexOf('throw'));
      assert.notEqual(-1, advntx.vocabulary.adjectives.indexOf('big'));
      assert.notEqual(-1, advntx.vocabulary.objects.indexOf('stone'));
      assert.notEqual(-1, advntx.vocabulary.directions.indexOf('north'));
    });

    it('parse command', function () {
      advntx.parser.set(['go', 'throw'], [], [], [], ['something', 'barrel', 'stone']);
      var obj = advntx.parser.parse('throw stone');
      assert.equal('throw', obj.verbs[0]);
      assert.equal('stone', obj.objects[0]);
    });

    it('find objects', function () {

      var names = ['guard', 'sugar'];
      var room_item_ids = ['unconscious_guard', 'barrel', 'stone'];

      assert.equal('unconscious_guard', advntx.find_item_ids(names, room_item_ids, objects)[0]);
    });

    it('locations and connections', function() {
      advntx.state.inventory = ['stone'];
      advntx.state.objects = objects;
      advntx.state.locations = locations;
      advntx.state.location = 'room';

      var location = advntx.state.locations['room_connections'];
      assert.equal('room_two',advntx.locationhandler.find_connection_for_direction(location,'north'));
    });

    it('find events', function () {
      assert.equal(events[0], advntx.eventhandler.find_events(location, ['door', 'stone'], 'open', undefined, events)[0]);
      assert.equal(0, advntx.eventhandler.find_events(location, ['torch'], [],'throw', undefined, events).length);
      assert.equal(1, advntx.eventhandler.find_events(location, ['torch','guard'], [], 'throw', undefined, events).length);
      

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

      advntx.eventhandler.execute_event(events['open_door'], echo);
      assert.equal(1, Object.keys(locations['room'].connections).length);
      advntx.eventhandler.execute_event(events['add_stone'], echo);
      assert.equal('stone', locations['room'].objects[1]);
      advntx.eventhandler.execute_event(events['remove_stone'], echo);
      assert.equal(1, locations['room'].objects.length);
      advntx.state.location = 'room_two';
      advntx.eventhandler.execute_event(events['add_stone'], echo);
      assert.equal(1, locations['room_two'].objects.length);
      advntx.state = save;
    });

    it('find not in inventory event', function () {
      

      var save = advntx.state;
      advntx.state = {
        steps: 0
      };
      advntx.state.inventory = ['torch','stone'];
      advntx.state.objects = objects;
      advntx.state.locations = locations;
      advntx.state.location = 'room_three';
      var locationObjects = locations[advntx.state.location].objects;
      

      var foundEvents = advntx.eventhandler.find_events(location, ['torch'], locationObjects,'take', undefined, events);
      assert.equal(0,foundEvents.length);
      advntx.state.inventory = [];
      var foundEvents = advntx.eventhandler.find_events(location, ['torch'], locationObjects,'take', undefined, events);
      assert.equal(1,foundEvents.length);
      assert.equal(events['not_inventory'],foundEvents[0])

    });

    it('check events with state', function() {
      var save = advntx.state;
      advntx.state = {
        steps: 0
      };
      advntx.state.inventory = ['torch','stone'];
      advntx.state.objects = objects;
      advntx.state.locations = locations;
      advntx.state.location = 'room_three';
      var locationObjects = locations[advntx.state.location].objects;
      
      var foundEvents = advntx.eventhandler.find_events(location, ['torch'], locationObjects,'kindle', undefined, events);
      assert.equal(0,foundEvents.length);
      objects['torch'].state = 'none';
      var foundEvents = advntx.eventhandler.find_events(location, ['torch'], locationObjects,'kindle', undefined, events);
      assert.equal(events['kindle_torch'],foundEvents[0])
      advntx.eventhandler.execute_event(events['kindle_torch'], echo);
      assert.equal('burning',objects['torch'].state);
      assert.equal('burniiiiing',advntx.inventoryhandler.get_name_of_state('torch','burning'));
      var foundEvents = advntx.eventhandler.find_events(location, ['torch'], locationObjects,'extinguish', undefined, events);
      advntx.eventhandler.execute_event(foundEvents[0], echo);
      assert.equal('none',objects['torch'].state);
      var foundEvents = advntx.eventhandler.find_events(location, ['torch'], locationObjects,'examine', undefined, events);
      assert.equal(0,foundEvents.length);
      objects['torch'].state = 'burning';
      var foundEvents = advntx.eventhandler.find_events(location, ['torch'], locationObjects,'examine', undefined, events);
      assert.equal(1,foundEvents.length);
      advntx.eventhandler.execute_event(foundEvents[0], echo);
    });

  });



})(); 
