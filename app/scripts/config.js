var advntx = (function (my) {
  my.config = {
    console: {
      height: 400,
      prompt: 'advntx> '
    },
    standard_wait_eventtext: 1000,
    debug: true
  }
  return my;
  // loose augmentation of a module, 
  // it will be created if not available yet.
}(advntx || {}));