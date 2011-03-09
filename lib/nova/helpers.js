(function() {
  var utils = require('./utils'),
      processNode = require('./parser').processNode,
      path = require('path'),
      rawString = utils.rawString,
      nova;

  var helpers = {
    rawString: rawString,
    script: function(func, args, argsifattr) {
      var helper = this;
      var aArgs = []
      var origargs = [].slice.call(arguments);
      var scriptArgs = {type:'text/javascript'};
      if (typeof args != 'undefined') {
        var start = 1;
        if (typeof func == 'object' && typeof args == 'function') {
          scriptArgs = func;
          scriptArgs.type = scriptArgs.type || 'text/javascript';
          func = args;
          args = argsifattr;
          start = 2;
        }
        if (arguments.length > start+1) {
          for (var i = start; i < arguments.length; i++) {
            aArgs.push(arguments[i]);
          }
        } else if (!utils.isArray(args)) aArgs = [args];
        else aArgs = args;
      }

      return function(compileVars) {
        if (typeof func == 'function' && func.__compileVar) {
          func = func(compileVars);
        }
        var template = this;


        var children = [];
        var scriptObj = {script:[scriptArgs, children]};
        if (typeof func == 'function') {

          var funcsrc = func.toString();
          funcsrc = funcsrc.replace('/*[:ignore]','').replace('[/:ignore]*/','');
          var indent = /\n(\s+)\}\s*$/.exec(funcsrc)[1];
          //console.log(funcsrc, '<'+indent+'>');
          if (indent) {
            funcsrc = funcsrc.replace(new RegExp('^' + indent,'gm'), '');
          }

          var origWhiteSpace = template.noWhiteSpace;

          if (template.noWhiteSpace) {
            children.push(new rawString("(" + funcsrc + ")("));
          } else {

            children.push(new rawString(utils.getText('(' + funcsrc + ")(", template.indentation+1)));
          }

          if (aArgs.length) {
            var bFirst = true;
            utils.forEach(aArgs, function(arg) {
              if (!bFirst) children.push( new rawString(','));
              else bFirst = false;

              if (typeof arg == 'function' && arg.__renderVar) {
                arg = arg.call(template, compileVars);
              }
              if (typeof arg == 'function') {

                if (typeof arg.renderFunc == 'object') {
                  var actualCallback = arg.renderFunc.func;
                  arg.renderFunc.func = function(renderVars, render) {
                    actualCallback(renderVars, function(answer) {
                      render(new rawString(JSON.stringify(answer)));
                    });
                  };


                  //arg.renderFunc.func.noWhiteSpace = true;
                  children.push(arg);
                } else {

                  children.push(function() {
                    return new rawString(JSON.stringify(arg.call(template, compileVars)));
                  });
                }
              } else if (typeof arg != 'undefined') {
                children.push(new rawString(JSON.stringify(arg)));
              }
            });
          }

          children.push(new rawString(")"));
          children.push(function() {
            //template.noWhiteSpace = origWhiteSpace;
            template.endLine();
          });

          var origWhitespace = template.noWhiteSpace;
          //template.noWhiteSpace = true;*/

          processNode(template, scriptObj);

          //template.noWhiteSpace = origWhitespace;
        } else if (typeof func == 'string') {
          scriptArgs.src = func;
          processNode(template, scriptObj);
        } else {
          processNode(template, wrapTag('script').apply(helpers, origargs));
        }
      };
    },
    /*
     * Disabled because this isn't complete and needs support for external
     * files and also this does not support onRender.
     css: function(func, args) {
      return function(compileVars) {
        if (typeof func == 'function' && func.__compileVar) {
          func = func(compileVars);
        }
        var template = this;


        if (typeof func == 'object') {
          var css = {};
          function goDownTree(root, name) {
            var keys = Object.keys(root);
            utils.forEach(keys, function(key) {
              var val = root[key];
              var thisname = name.concat(key);
              function checkVal(val) {
                if (typeof val == 'object') {
                  goDownTree(val, thisname);
                } else if (typeof val == 'function') {
                  checkVal(val());
                } else {
                  if (name.length) {
                    if (!css[name.join(' ')]) {
                      css[name.join(' ')] = {};
                    }
                    css[name.join(' ')][key] = val.toString();
                  }
                }
              }
              checkVal(val);
            });
          }
          goDownTree(func, []);
          var csss = '';
          var keys = Object.keys(css);

          utils.forEach(keys, function(key) {
            var val = css[key];
            var rules = Object.keys(val);
            csss += "\n" + key + " {";
            utils.forEach(rules, function(rule) {
              var ruledef = css[key][rule];
              console.log(rule, ruledef);
              csss += "\n\t" + rule + ": \"" + ruledef + "\"";
            });
            csss += "\n}";
          });

          csss = rawString(utils.getText(csss, template.indentation+1)+"\n");
          var cssObj = {style:[{type:'text/css'}, csss]};
          processNode(template, cssObj);
        } else if (typeof func == 'string') {
          var cssArgs = {type:'text/css'};
          var children = [];
          var cssObj = {link:[cssArgs, children]};
          cssArgs.href = func;
          processNode(template, cssObj);
        }
      };
    },*/
    onRender: function(fnRenderFunc, indentation) {
      var self = this;
      var renderFunc = {func: fnRenderFunc};
      //console.log('called onRender with', indentation)
      var returnFunc = function(compileVars) {
        if (typeof indentation == 'undefined') indentation = this.indentation;
        //console.log("onRender added with", indentation, " this.indent was", indentation);
        var fnRenderFuncWrapper = function(renderVars, render) {
          //console.log('rendering', self.template.indentation);
          renderFunc.func.call(this, renderVars, render);
        };
        fnRenderFuncWrapper.stub = fnRenderFunc.toString().substr(0,100);

        utils.addOnRender(this, fnRenderFuncWrapper, indentation);
      };
      returnFunc.renderFunc = renderFunc;
      return returnFunc;
    },
    partial: function(filename, collection) {
      var self = this;
      //console.log("called partial for " + filename + " with indent " + this.template.indentation);

      return function(compileVars){
        //support div(partial(compileVars('pageName'))) type syntax
        if (typeof filename == 'function' && filename.__compileVar) {
          filename = filename(compileVars);
        }
        var template = this,
            fullFilename = path.normalize(path.dirname(self.template.templateFile)
              + '/' + filename),
            partialTemplate = nova(fullFilename, {
              indentation: template.indentation,
              noWhiteSpace: template.opts.noWhiteSpace,
              noDocType: true
            });

        //console.log(fullFilename, template.indentation);
        //console.log('partial parent template', template);
        //console.log(partialTemplate);
        if(!partialTemplate) return null;
        if (!collection) {
          collection = [null];
        } else if (!utils.isArray(collection)) {
          collection = [collection];
        }
        var result = [];

        utils.forEach(collection, function(partialVars) {
          var partialNodes = [];

          utils.forEach(partialTemplate.srcList, function(chunk) {
            if (typeof chunk == 'function') {

              var onRenderResult = self.onRender(function(renderVars, render) {

                //console.log('partial onRender called', chunk.indentation, this.indentation, chunk.actual.stub);
                //console.log("=============");
                //var orig = this.indentation;
                //console.log("setting indent from " + orig + " to " + chunk.indentation);
                //this.indentation = chunk.indentation;

                //console.log("calling to", chunk);
                if (!partialVars) partialVars = renderVars;
                chunk.call(this, partialVars, render, renderVars);

                //this.indentation = orig;
              }, chunk.indentation);
              //console.log("adding chunk: " + chunk.indentation, chunk.actual.stub);
              //console.log('partialNodes.push(function(renderVars, render))', onRenderResult.toString());
              partialNodes.push(onRenderResult);
            } else {
              //console.log('partialNodes.push(chunk)', chunk);
              partialNodes.push(chunk);
            }
          });
          //console.log('result.push(partialNodes)', partialNodes);
          result.push(partialNodes);
        });
        //console.log("\n\n",'partial return', result);
        //console.log("partial template was", template);
        //console.log("partial func", result[0][1]);
        return result;
      }

      /*return helpers.onRender(function(renderPartial) {
        utils.forEach(collection, function(partialVars) {
          partialTemplate.render(partialVars, function(partialRender) {
            partialResult.push(partialRender);
          });
        });
      });*/

    },
    partialVar: function(varName) {
      var self = this;
      var ret = function(compileVars) {
        if (typeof varName == 'function' && varName.__compileVar) {
          varName = varName(compileVars);
        }
        return self.onRender( function(renderVars, render, partialVars) {
          var val = getProperty(partialVars, varName);
          if (typeof val == 'undefined') {
            val = getProperty(renderVars, varName);
          }
          render(val);
        })
      };
      ret.__renderVar = true;
      return ret;
    },
    renderVar: function(varName) {
      var self = this;
      var ret = function(compileVars) {
        if (typeof varName == 'function' && varName.__compileVar) {
          varName = varName(compileVars);
        }
        //console.log(Object.keys(this));
        return self.onRender( function(renderVars, render) {
          var val = getProperty(renderVars, varName);
          render(val);
        });
      }
      ret.__renderVar = true;
      return ret;
    },
    compileVar: function(varName) {
      var ret = function(compileVars) {
        var val = getProperty(compileVars, varName);
        return val;
      }
      ret.__compileVar = true;
      return ret;
    },
    //simply to make the template more self describing.
    onCompile: function(fn) {
      return fn;
    }
  };

  var taglist =
  ['a', 'abbr', 'acronym', 'address', 'applet', 'area', 'b', 'base', 'basefont',
   'bdo', 'big', 'blockquote', 'body', 'br', 'button' ,'caption', 'center', 'cite',
   'code', 'col', 'colgroup', 'dd', 'del', 'dfn', 'dir', 'div', 'dl', 'dt', 'em',
   'fieldset', 'font', 'form', 'frame', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5',
   'h6', 'head', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'isindex',
   'kbd', 'label', 'legend', 'li', 'link', 'map', 'menu', 'meta', 'noframes',
   'noscript', 'object', 'ol', 'optgroup', 'option', 'p', 'param', 'pre', 'q',
   's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup', 'table',
   'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'tt', 'u',
   'var','select',
   //html5
   'article', 'aside', 'audio', 'canvas', 'command', 'datalist', 'details',
   'eventsource', 'embed', 'figcaption', 'figure', 'footer', 'header', 'hgroup',
   'keygen', 'mark', 'meter', 'nav', 'output', 'progress', 'ruby', 'rp', 'rt',
   'section', 'source', 'summary', 'time', 'video', 'wbr'
  ];
  function addHTMLTags(taglist) {
    utils.forEach(taglist, function(tag) {
      helpers[tag] = wrapTag(tag);
    });
    return this;
  }
  addHTMLTags(taglist);

  utils.forEach(['ol', 'ul'], function(tag) {
    helpers[tag] = function(args, data) {
      var obj = {};

      if (utils.isArray(args) && arguments.length == 1) {
        data = args;
        args = {};
      }
      if (utils.isArray(data) && arguments.length < 3) {
        utils.forEach(data, function(li, k) {
          data[k] = {li:li};
        });
      } else {
        arguments = [].slice.call(arguments, 1);
        data = []
        utils.forEach(arguments, function(v) {
          data.push(v);
        });
      }
      obj[tag] = [args||{}, data];
      return function(){return obj;};
    }
  });
  //script select
  var wrapHelpers = function(template) {
    if (!nova) nova = require('./nova');//cache it so when a user is rendering its cached
    var templateHelper = {template: template};
    for (var i in helpers) {
        templateHelper[i] = helpers[i].bind(templateHelper);
        templateHelper[i].__helperTag = true;
    }
    return templateHelper;
  };
  wrapHelpers.addHTMLTags = addHTMLTags;
  wrapHelpers.helpers = helpers;
  module.exports = wrapHelpers;

  function wrapTag(tag) {
    return function() {

      arguments = [].slice.call(arguments);
      var obj = {};
      var args = {};

      if (typeof arguments[0] == 'object') {
        args = arguments.shift();
      }

      obj[tag] = [args, arguments];
      return function(){return obj;};
    }
  }
  function getProperty(object, name) {
    var found = false, answer;
    if (!name) return object;
    if (object) {
      utils.forEach(name.split(/\.|\[|\"|\'|\]/), function(chunk) {
        if (chunk && !found) {
          if (typeof object == 'object') {
            if (typeof object[chunk] == 'undefined') {
              found = true;
            }
            object = object[chunk];
            answer = object;

          } else {
            found = true;
          }
        }
      });
    }
    return answer;
  }
})();
