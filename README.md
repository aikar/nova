# Nova
## About
> Nova was designed and developed mainly as a 'fun' project
  with the goal of creating a template engine that was fully
  written as JavaScript (not JSON), to compliment the current
  state some apps are at of "Client, Server, Database"
  using JavaScript.

> Nova will let you write templates with the full power of
  JavaScript and Node.JS, in a format your current IDE or
  editor already provides Syntax hilighting for!

> Almost every other template engine has some unique format
  to it, in which no-ones editor can provide syntax & highlighting
  support for. But Nova will be 100% pure JavaScript, letting your
  editor provide nice features such as syntax checking, syntax
  hilighting, code completion, source formatting,
  indentation settings etc.

> Nova does not conform to the current day ideology of what a
  template engine should or should not do. Node provides you the
  tools to do a job, and lets you do your job however you please.

>  If you want to read more on Nova vs Template Engine Ideology,
  check out my [initial Nova blog post][aikar.conova]

> Or read other blog topics on Nova: <http://aikar.co/category/projects/nova/>
***
## Install

 - #### NPM

    To install with npm, type

    `npm install nova`

    Then in your project `require('nova');`

 - #### GIT clone
To install with Git, type
   - As a submodule of a GIT controlled project:
     - `cd /your/project`
     - `git submodule add git@github.com:Aikar/node-nova.git <path/to/libs/nova>`
     - `git submodule init`
     - `git submodule update`
     - then in your project `require('./path/to/libs/nova');`
   - As a git clone to non GIT project
     - `cd /your/project/libs/`
     - `git clone git@github.com:Aikar/node-nova.git nova`
     - then in your project `require('./path/to/libs/nova');`
***
## Documentation

> ### Initial Template Structure
> ***
> First off, every template must contain 1 function as its body.
  Do everything inside of this functions scope
  Next, The root function takes 1 parameter, recommended to name it ***`nova`***

> Your function should look like this:

>
        function(nova) {
         return {};
        }

>Everything returned by the function is going to be your template.

> ### Nova Template Syntax
> ***
> > #### Basic DOM Node

> > A DOM node in a Nova template is represented as an object, like so:

> > > `{html:[{args}, [childrennodes]`

> > As you see here, It's a simple 1 property Object, who's value should be an array.
    Args and children nodes are optional, so a plain `{br:[]}` would render as `<br/>`

> > If you do not pass an array as a value to the object key, Nova will guess as to what you intended.
    For example, `{div:{id:'foo'}}` is equivalent to `{div:[{id:'foo'}]}`

> > And if you pass anything else other than an array as the value, that value is interpreted as a child node, for example:
   `{span:1}` would render as `<span>1</span>` and is equivalent to `{span:[[1]]}`

> > Additionally, if a more than 1 value is passed to the array and the first is not an object (attributes), the array is treated as if it was the children nodes array.

> > For example:
> > > `{div:['Hello', 'to you sir!']}`

> > is equivalent to
> > > `{div:[['Hello', 'to you sir!']]}`

> > Nova tries to make it as hard as possible for you to confuse it. Almost any syntax will work.
   The only exception is passing Nova syntax nodes to the array, since they are objects, so the
   following is **_NOT_** valid:

> > >  `{div:[{span:'Hello'}]}`

> > There is no way for Nova to know if you intended that to be an attribute or a child node, so you must use

> > > `{div:[[{span:'Hello'}]]}`

> #### Walking a template
> > Nova parses 1 node at a time, and can handle the following types:

> > Process Node
> >
- **Object**
  Processed as stated above into HTML. Anything passed as a Child
  Node to the Node is then walked into and processed also.
- **Array**
  States that the array contains multiple nodes to process, and will
  process each item in the array.



>>>         {span:'Hi'},
        [
          {span:'Hi'},
          {span:'Hi'},
          {span:'Hi'}
        ],
        {span:'Hi'},

>>> Is the same as:


>>>>     {span:'Hi'},
    {span:'Hi'},
    {span:'Hi'},
    {span:'Hi'},
    {span:'Hi'},

>>> You will not usually directly use arrays in your
  template, but functions \(described next) may return them
>>
 - **Function**
     Any function in your template is executed ***AT COMPILE TIME!***
     The return value of the function will be then inserted into the
     template for compile.

>>> You may not ever need functions, but they are designed to help
    save you time in some places.

>>> For example, a static list on a page could be built with a function
    which just iterates the list building the template syntax for it,
    instead of you typing the {li:'Data'} for every entry. And because
    this is done on compile time, this is fully cached to pure HTML and
    does not affect your template performance.
>>
 - **Anything Else**
   Anything else is considered to be a text block \(strings, integers, floats,
   booleans), and calls .toString on the element and adds it as a text block.
>>
 - **rawString(object)**
   One of the helpers \(described below) is a rawString object. Text/strings
   in the template are expected to be just that, Text blocks for the page.
   And since strings are properly formatted with white space, that could
   cause you problems when you expect text to not be formatted.
>>
   If you need to add text that will not be formatted \(ie:
   passing your own HTML), then simply pass it the rawString helper:

>>>         {div:[[
           nova.rawString('<script>foo('),
           nova.rawString(config.someVar),
           nova.rawString(')</script>')
        ]]}

>>> This will keep it all on 1 line. Again this is something you probably
    will not ever need, but it is there incase you do.

> #### Template Helpers (nova variable)
>> Nova provides some utility functions for you to use in the nova variable
   that is passed to your root template function \(refer to Initial Template
   Structure)

>> You may call these anywhere you would normally be able to call a plain DOM Node
   Object.

>> - **nova.onRender(function(renderVars, render) { })**
>> nova.onRender takes 1 argument, a function. This function will called any time
   your template is rendered. This is the bread and butter of Dynamic Content in your
   templates.

>>> The function, when called, is passed 2 parameters. The first being any local variables
    the business logic of your application has built in order to pass to the template.
    However, unlike other template engines, since Nova has he ability to render templates
    async, instead of returning the content in the function, you call the render function
    passing the content of the function.

>>> For example, in other template engines your code may look like this:

>>>>     {span:[['Hello ', nova.onRender(function(vars) {
      return vars.userName;
    }]]}

>>> But in Nova, you simply pass it to render like so:

>>>>     {span:[['Hello ', nova.onRender(function(vars, render) {
      render(vars.userName);
    }]]}

>>> With this method, you could call some async operation which its callback can call render();

>>>>     {span:[['Hello ', nova.onRender(function(vars, render) {
      some.asyncOp(vars.someValue, function(result) {
        render(result.someValue);
      });
    }]]}

>>> Now note, even though its async its still going to block the specific render, but not going to
   block the node process, and another template render could go on at the same time for someone else.

>>>   ***WARNING:*** I strongly encourage you to not use alot async operations in your templates, as
    under specific circumstances it could cause your template
    to render slower than it could have. A single async operation on a template render would generally
    have no impact to the speed of a page load, but multiple at different steps of a render could impact it.

>>> I have some ideas that would fix these specific slowdown conditions, and once its in place then
    async operations in a render would not hurt your performance at all, and this warning will be removed.

>> - **nova.scriptSrc(function(){}, [var1, [var2 ...]])**
     If you need to include inline JavaScript on your page (such as tracking snippets) you
     may include the source of the script tag directly as a function instead of trying to build
     the string. You can write client side code directly into the template, but it will be copied
     directly to the client instead of ran server side.

>>   You may also pass data that will be passed to the code on client side, like so:
>>>     function(nova) {
           var config = require('../config');
           return {html:[[
             {head: [[
                nova.scriptSrc(function(siteName, userName) {
                    alert('Hello ' + userName + '! Welcome to ' + siteName + '!');
                  }, config.siteTitle, nova.onRender(vars, render) {
                    render(vars.userName);
                  })
                );
              ]]}
           ]]};
        }

>>> On the view of the page the users browser would alert('Hello <user>! Welcome to <sitetitle>!')
    as the is rendered like so:

>>>        <script type="text/javascript">
         (function(siteName, userName) {
           alert('Hello ' + userName + '! Welcome to ' + siteName + '!');
         })('Site Title', 'UserName');
       </script>

>> - **nova.partial('filename'[, optionalArray])**
     nova.partial is a function that lets you include another template \(a partial template) into the current.
     Partials will be your main tool into seperating out the different aspects of a template.

>>  Partials may also be used inside onRender functions, so you can dynamically load partials
    \(ie: different page templates) on render.

>>  Partials also include support for an array as a second argument. If you pass an array, the
    partial is repeated for each element in the array, and the value of the entry in the array
    will override any onRender function inside the partial templates renderVars.

>>  For example, you include a partial with `nova.partial('partial', ['foo', 'bar']);`

>>  And the partials source is:

>>>>     {span:nova.onRender(function(vars, render) {
       render(vars);
    }

>>>  and then you render the main template with `template.render('baz')`
     Then your resulting output will be `<span>foo</span><span>bar</span>`

>>> As you see since you passed 2 variables in the array to nova.partial, 2 copies of the
    template were rendered, and the onRender functions inside the template received the
    array values instead of the main onRender. However, if you still want to access the MAIN
    onRender vars instead of the values passed to `nova.partial`, they will be in the third
    variable of the render function: `nova.onRender(function(partialVars, render, renderVars) {`
    On non partial renders, the 3rd arg is essentially a duplicate of the first.

>> - **nova.rawString(string)**
     This function is as described earlier in the documentation. It simply lets you pass a
     raw string to Nova that will not be formatted. Useful where you need unmodified data added
     to your template output.

***
## Performance
> Benchmarking has been done, and Nova will average under 1 millisecond per render,
  unless you use async operations in the template.

> Due to the ability to run async operations inside of your onRender blocks, its hard
  to say a definite answer to render time, and considering the number of onRender
  functions you use, and what things you do in the template can all affect the time.

> But based on my own benchmarks, using a template that utilizes some of everything
  Nova can do, the average render time was 0.4ms.

> In other words, it's pretty fast. Compared to other template engines, Nova is nowhere
  near the top, but I feel the speed it renders is 100% acceptable, and the features and
  style it provides are interesting.

> If your application is slowing down, I'm going to find it really hard to believe that
  nanosecond optimizations are going to be your solution. In other words, Nova's
  performance is "More than enough".

> Many of those other fast engines are basic and do not give as much flexibility
  that Nova provides.

***
## Bugs
>   File bugs at GitHub please [Github Issues][issues].

***
## Contributing
> Fork, commit, send pull request.

***
## Contributors
> None yet.

***
## License
> Nova is licensed under the MIT license.

> Copyright (c) 2011 Daniel Ennis [Aikar@Aikar.co][email]



> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[aikar.conova]: http://aikar.co/2011/01/21/nova-javascript-based-template-engine-nodejs/
[issues]: https://github.com/Aikar/node-nova/issues
[email]: mailto:aikar@aikar.co
