var nova = require('../lib/nova');
var sys = require('util');
nova(__dirname + '/template', function(template) {

  template.render(1, function(html) {
    sys.puts(html);
  });
});

