/**

Nova: A Node.JS Templating engine.

Goal: A templating engine written completely in javascript - Your IDE/Editor should already provide syntax hilighting/formatting!

Example template:
*/

var user = {
  getCurrentUserId: function() {
    return {blah: 32};
  }
};
var blog = {
  getComments: function(cb) {
    cb([{title: 'Test1'}, {title: 'test2'}]);
    }
};

html(
  head({foo: 'bar'},
    title('Title of my site')
  ),
  body(
    div(
      script(function(bar, userid, x) {
        if(window.console && console.log) console.log(bar, userid, x);
      }, [
        'bar',
        onRender(function(renderVars, render) {
          render(user.getCurrentUserId());
        }),
        function() {
          return {boobs: "tits"};
        }
      ]),
      onRender(function(renderVars, render) {
        //console.log('calling blog.getComments');
        blog.getComments(function(comments) {
          render(partial('partials/blogComment',comments));
        });
      })
    )
  )
);


