'use strict';
(function () {


  var assert = chai.assert;


  before(function (done) {
    // waits until done is called (async!)
    advntx.parse_json(done);
  });

  var events = {
    open_door: {
      name: 'open door',
      prereq_verb: 'open',
      prereq_location: 'room',
      prereq_used_items: ['door'],
      action_new_connections: ['room:east:room_two'],
      action_add_items: ['location:stone']
    },

    close_door: {
      name: 'close door',
      prereq_verb: 'close',
      prereq_location: 'room',
      prereq_used_items: ['door']
    },
    remove_stone: {
      name: 'remove stone',
      prereq_location: 'undefined',
      action_remove_items: ['room:stone']
    }
  };

  var locations = {
    room: {
      name: 'room',
      description: 'Testroom',
      connections: {

      },
      objects: []
    },
    room_two: {
      name: 'room 2',
      description: 'second testroom',
      connections: {
        west: "room",
      },
      objects: []
    }

  };

  var objects = { guard: { name: 'guard' }, unconscious_guard: { name: 'unconscious guard' }, barrel: { name: 'barrel' } };


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

    it('find event', function () {
      assert.equal(events[0], advntx.eventhandler.find_events(location, ['door', 'stone'], 'open', undefined, events)[0]);
    });

    it('execute event', function () {

      function echo(string) {

      };

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
      assert.equal('stone', locations['room'].objects[0]);
      advntx.eventhandler.execute_event(events['remove_stone'], echo);
      assert.equal(0, locations['room'].objects.length);
      advntx.state.location = 'room_two';
      advntx.eventhandler.execute_event(events['open_door'], echo);
      assert.equal(1, locations['room_two'].objects.length);
      advntx.state = save;
    });

  });



})(); 
