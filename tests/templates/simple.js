/**

Nova: A Node.JS Templating engine.

Goal: A templating engine written completely in javascript - Your IDE/Editor should already provide syntax hilighting/formatting!

Example template:
*/
(function(nova, locals){
  /*var user = require('user'),
      blog = require('blog');*/
  var user = {
    getCurrentUserId: function() {
      return {blah: 32};
    }
  },
  blog = {
    getComments: function(cb) {
      cb([{title: 'Test1'}, {title: 'test2'}]);
    }
  };
  return {
    'html':[[
      {'head':[{foo: 'bar'},[
        {'title':'Title of my site'}
      ]]},
      {'body':[[
        {div:[[
          nova.scriptSrc(function(bar, userid, x) {
            if(window.console && console.log) console.log(bar, userid);
          }, [
            'bar',
            nova.onRender(function(renderVars, render) {
              render(user.getCurrentUserId());
            }),
            function() {
              return {boobs: "tits"};
            }
          ]
        ),

        nova.onRender(function(renderVars, render) {
          //console.log('calling blog.getComments');
          blog.getComments(function(comments) {
            render(nova.partial('partials/blogComment',comments));
          });
        })
        ]]}
      ]]}
    ]]
  };
})

