(function () {
  'use strict';

  require('../app/scripts/functions.js');

  describe('Give it some context', function () {
    describe('maybe a bit more context here', function () {
      it('should run here few assertions', function () {

      });
    });
  });

  describe("#multiply", function () {
    it("returns the correct multiplied value", function () {
      var product = multiply_lib.multiply(2, 3);
      expect(product).toBe(6);
    });
  });
})();
