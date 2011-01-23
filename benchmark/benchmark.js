(function() {
  var nova = require('./lib/nova');
  var count = 10000;
  var sys = require('util');

  var origcount = count;
  var template = nova(__dirname + '/tests/templates/template');
  var start = new Date().getTime();

  for (var i = 0; i < count; i++) {
    template.render(i, function(html) {});
  }
  process.on('exit', function(){
    var diff = new Date().getTime() - start;
    sys.puts('rendered ' + count + ' times in ' + diff + 'ms!');
  })
})();
