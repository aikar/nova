(function() {
  var sharedVariables = {
   header: "Header",
   header2: "Header2",
   header3: "Header3",
   header4: "Header4",
   header5: "Header5",
   header6: "Header6",
   list: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  };

  var nova = require('../lib/nova');
  var count = 10000;
  var sys = require('util');

  var template = nova(__dirname + '/../tests/templates/jsperf');
  var start = new Date().getTime();

  for (var i = 0; i < count; i++) {
    template.render(sharedVariables);
  }
  process.on('exit', function(){
    var diff = new Date().getTime() - start;
    sys.puts('rendered ' + count + ' times in ' + diff + 'ms!');
  })
})();