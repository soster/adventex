'use strict';
(function () {


  var assert = chai.assert;


  before(function (done) {
    // waits until done is called (async!)
    advntx.parse_json(done);
  })

   
  describe('advntx', function() {
      it('format string test', function() {
        assert.equal("test: test","test: {0}".format("test"));
      });

      it('vocabulary loaded', function() {
        assert.notEqual(-1,advntx.vocabulary.verbs.indexOf('go'));
      });

      it('parser test', function() {
        advntx.parser.set(advntx.vocabulary.verbs, advntx.vocabulary.directions, advntx.vocabulary.prepositions, advntx.vocabulary.adjectives, advntx.vocabulary.objects);
        var obj = advntx.parser.parse('throw stone');
        assert.equal('throw',obj.verbs[0]);
        assert.equal('stone',obj.objects[0]);
      });
  });

  

})();
