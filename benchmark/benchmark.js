(function() {
  var nova = require('../lib/nova/nova.js');
  var count = 10000;
  var sys = require('util');

  var origcount = count;
  var template = nova(__dirname + '/../tests/templates/template');
  var start = new Date().getTime();

  for (var i = 0; i < count; i++) {
    template.render(i, function(html) {});
  }
  
    var diff = new Date().getTime() - start;
    sys.puts('rendered ' + count + ' times in ' + diff + 'ms!', 'avg: ' + (diff / count)+'ms!');
// 1/24/11
//rendered 10000 times in 4154ms!
//avg: 0.4154ms!
})();
