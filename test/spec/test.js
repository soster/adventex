'use strict';
(function () {


  var assert = chai.assert;


  before(function (done) {
    // waits until done is called (async!)
    advntx.parse_json(done);
  })

   
  describe('advntx test suite', function() {
      it('format string test', function() {
        assert.equal("test: test","test: {0}".format("test"));
      });

      it('vocabulary loaded', function() {
        assert.notEqual(-1,advntx.vocabulary.verbs.indexOf('go'));
        assert.notEqual(-1,advntx.vocabulary.verbs.indexOf('throw'));
        assert.notEqual(-1,advntx.vocabulary.adjectives.indexOf('big'));
        assert.notEqual(-1,advntx.vocabulary.objects.indexOf('stone'));
        assert.notEqual(-1,advntx.vocabulary.directions.indexOf('north'));
      });

      it('parse command', function() {
        advntx.parser.set(['go','throw'], [], [], [], ['something','barrel','stone']);
        var obj = advntx.parser.parse('throw stone');
        assert.equal('throw',obj.verbs[0]);
        assert.equal('stone',obj.objects[0]);
      });

      it('find objects', function() {
        var names = ['guard','sugar'];
        var room_item_ids = ['unconscious_guard','barrel','stone'];
        var all_objects = {guard:{name:'guard'},unconscious_guard:{name:'unconscious guard'},barrel:{name:'barrel'}};
        assert.equal('unconscious_guard',advntx.find_item_ids(names, room_item_ids, all_objects)[0]);
      });

      it('find event', function() {
        var event = {		open_door: {
          name: 'open door',
          prereq_verb: 'open',
          prereq_location: 'room',
          prereq_used_items: ['door'],
        },};

        var event2 = {		close_door: {
          name: 'close door',
          prereq_verb: 'close',
          prereq_location: 'room',
          prereq_used_items: ['door'],
        },};
        
        var location = { room: {
          name: 'room'
        }
        };

        var events = [event];

        assert.equal(event,advntx.eventhandler.find_events(location, ['door','stone'], 'open', undefined, events)[0]);
      });

  });

  

})();
