var fs = require('fs'),
  user = {
    getCurrentUserId: function() {
      return 32;
    }
  };
div (
  'Welcome to my site!',
  br,
  onRender(function(v, render) {
    fs.readFile('/etc/passwd', function(err, data) {
      if (err) render('Error' + err);
      else render(data.toString());
    })
  }),
  partial('partials/partial.js', [1,2,3,4,5]),
  br,
  span(span(span(span(span(span(span(
    onRender(function(vars, render){
      render(partial('partials/partial.js', [1,2,3,4,5]));
    })
  ))))))),
  
  script(function(bar, userid) {
      // client side code. Source of this function is copied into the resulting html.
      if(window.console && console.log) console.log(bar, userid);
    }, 
      'bar',
      onRender(function(renderVars, render) {
        //console.log('calling user.getCurrentUserId()');
        render(user.getCurrentUserId());
      })
  ),
  '<script> this is escaped!</script>',
  a (
    {'href': 'https://github.com/Aikar/node-nova/blob/master/tests/templates/template.js'},
    'View the source file for this template!'
  ),
  br,
  a ({'href': 'http://aikar.co/testnova.html'},
    'View the whitespace (clean source) version of this page'
  )
)