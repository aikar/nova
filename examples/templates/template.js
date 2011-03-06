/**

Nova: A Node.JS Templating engine.

Goal: A templating engine written completely in javascript - Your IDE/Editor should already provide syntax hilighting/formatting!

Example template:
*/

var
    blog = {
    	getComments: function(cb) {
        cb([
					{title: 'Test1', 'msg':'Hello 1'},
					{title: 'test2', 'msg':'Hello 2'}
					]);
      }
    };

var templateBody = partial('partials/templateBody');

html (
  head ({foo: 'bar'},
    title ('Title of my site'),
    link ({type: 'text/css', rel: 'stylesheet', href: '/app.css'}),
    link ({type: 'text/css', rel: 'stylesheet', href: '/other.css'}),
    script (function(args) {
        for(var i; i < 20; i++) {

        }
    }, 'foo', renderVar('foo'))
  ),
  body (
    div ({id: 'header'},
      h1 (
        b ('Welcome'),
        b ('My Site!')
      )
    ),
    div ({id: 'content'},

      templateBody,
      ul(['foo', 'bar', 'baz']),
      ol({id:'boo'}, ['foo', [{id:1},'bar'], a({foo:'bar'}, 'baz') ]),
      ul(li('foo'), li('bar'), li('baz')),

      onRender(function(renderVars, render) {
        //console.log('calling blog.getComments');
        blog.getComments(function(comments) {
          render(partial('partials/blogComment',comments));
        });
      }),

      helloWorld()
    ),
    renderVar('foo'),
    renderVar('bar.baz'),
    div ({id: 'footer'},
      span ('&copy; My Company 2011')
    ),
    script({foo: 'bar'}, function(){
      //test
    }),
    function(compileVars) {
      return JSON.stringify(compileVars);
    },
    br,
    br(),
    script('../clientjs/test')
    /*,css({
      body: {
        div: {
          '#someid': {
            background: '#FFF'
          },
          background: '#AAA'
        },
        background: '#000'
      },
    })*/
  )
);

function helloWorld(){
  // example that function DECLARATIONS are ok at bottom of template
  // function ASSIGNMENTS are not!
  return "Hello World!";
}
/**

Explanation:
each "Node" in the DOM is an object. the first property name in the object is the dom node
the value of the property is an array
the first object found in the array is used as properties for the dom node.
the first array found in the array is used as children dom nodes
if a string is found in the array the dom node is rendered as a text element, like so:
  {'span':[{class:"myClass"}, 'Span content']}
renders as
  <span class="myClass">Span content</span>

utility function nova.scriptSrc is defined as
nova.scriptSrc(fnFunction [,optionalArgs]);

The SOURCE of the function passed will be returned as the string of the call to render as the text of the node, wrapped in a function call
with the args passed in 2nd parameter passed to the client side code on load.

example:

{'script':[{type:"text/javascript"},[
  nova.scriptSrc(function(args) {
      var myDomain = args.domain;
    },
    //args to pass to the function
    {domain: 'http://mysite.com'}
  )
]]}

would render as
<script type="text/javascript">
(function(args) {
  var myDomain = args.domain;
})({domain: 'http://mysite.com'});
</script>

utility function nova.onRender can be used to insert dynamic content of the template.

Since the main html of the template will be cached, you need the ability to dynamically render content
the nova.onRender tells the engine that section is dynamic and to render code there on request.
Everything else in the template will be compiled to pure html.

Partials will also cache

Template files dynamically recompile on modification.
 */
