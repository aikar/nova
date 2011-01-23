(function() {
  var nova = require('./lib/nova');
  var count = 50000;
  var sys = require('util');

  var origcount = count;
  var template = nova(__dirname + '/tests/templates/template');
  var start = new Date().getTime();

  for (var i = 0; i < origcount; i++) {
    template.render(i, function(html) {
      if (--count <= 0) {
        var diff = new Date().getTime() - start;
        sys.puts('rendered ' + origcount + ' times in ' + diff + 'ms!');
      }
    });
  }
})();