(function () {
  'use strict';

  require('../../bower_components/jquery/dist/jquery.min.js');
  require('../../app/scripts/parser.js');
  require('../../app/scripts/messages.js');
  require('../../app/scripts/functions.js');
  require('../../app/scripts/locations.js');
  require('../../app/scripts/things.js');
  require('../../app/scripts/persons.js');
  require('../../app/scripts/events.js');
  require('../../app/scripts/synonyms.js');
  require('../../app/scripts/helper.js');
  require('../../app/scripts/eventhandler.js');
  require('../../app/scripts/inventoryhandler.js');
  require('../../app/scripts/locationhandler.js');
  require('../../app/scripts/interpreter.js');
  require('../../app/scripts/state.js');






  describe('Give it some context', function () {
    describe('maybe a bit more context here', function () {
      it('should run here few assertions', function () {

      });
    });
  });

  describe("find item id", function () {
    beforeEach(function () {
      state.locations = JSON.parse(JSON.stringify(locations));
      state.things = JSON.parse(JSON.stringify(things));
      state.persons = JSON.parse(JSON.stringify(persons));
      state.events = JSON.parse(JSON.stringify(events));
      var start_event = state.events['start_event'];
      eventhandler.execute_event(start_event);
    });
    it("returns the correct multiplied value", function () {
      expect(locationhandler.find_item_id_for_name('trap door').toEqual(''));
    });
  });
})();
