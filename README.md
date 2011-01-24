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
> > > > 
    {span:'Hi'},
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
   Anything else is considered to be a text block \(strings, integers, floats, booleans), and calls .toString on the element and adds it as a text block.
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
