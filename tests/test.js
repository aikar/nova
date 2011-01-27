var nova = require('../lib/nova/nova.js');
var sys = require('util');
nova(__dirname + '/templates/template', function(template) {

  template.render(1, function(html) {
    sys.puts(html);
  });
});

