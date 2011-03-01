(function() {
  var sharedVariables = {
    header: "Header",
    header2: "Header2",
    header3: "Header3",
    header4: "Header4",
    header5: "Header5",
    header6: "Header6",
    list: Array(50).join('test ').split(' ')
  };

  var nova = require('../lib/nova/nova.js');
  var count = 5000;
  var sys = require('util');

  var template = nova(__dirname + '/../tests/templates/jsperf');
  var start = new Date().getTime();

  for (var i = 0; i < count; i++) {
    template.render(sharedVariables);
  }

    var diff = new Date().getTime() - start;
    sys.puts('rendered ' + count + ' times in ' + diff + 'ms!', 'avg: ' + (diff / count)+'ms!');

})();
