
window.novaEngine = (function() {
  
  var utils, parser, helpers, nova;

  // *****************************************************
  /*/
  ///  UTILS
  /*/
  // *****************************************************
  utils = {
    //these funcs are called from in a template with scope.
    templateIndent: function(indent) {
      indent = indent || 0;
      if (!this.noWhiteSpace) {
        this.src += utils.indent(this.indentation + indent);
      }
    },
    templateEndLine: function() {
      if (!this.noWhiteSpace
          && this.src[this.src.length-1] != "\n") this.src += "\n";
    },
    templateAddText: function(text) {
      if (!this.noWhiteSpace) this.src += utils.indent(this.indentation);
      var aText = text.toString().replace("\r\n","\n").replace(/^\s+/,"").split("\n");
      var sep = "\n";
      if (!this.noWhiteSpace) sep = "\n" + utils.indent(this.indentation);
      this.src += aText.join(sep);
      this.endLine();
    },




    //normal funcs
    rawString: function (str) {
      this.str = str.toString();
      //console.log('==========================================',"\nrawString", this.str)
    },
    indent: function(level) {
      level = level || 0;
      return new Array(level+1).join("  ");
    },
    printStackTrace: function() {
      try {
        i.dont.exist+=0; //doesn't exist- that's the point
      } catch(e) {
        return e.stack.split("\n").slice(2).join("\n");
      }
      return null;
    },





    getText: function(text, indentation) {
      //console.log(utils.printStackTrace());
      //console.log("getText", indentation, text);
      return utils.indent(indentation) + text.replace("\r\n","\n").replace(/^\s+/,"").split("\n").join("\n" + utils.indent(indentation));
    },
    isArray: function(obj) {
      //return Array.isArray(obj);
      if (!obj || obj.constructor.toString().indexOf("Array") == -1)
        return false;
      else
        return true;
    },
    finalizeTemplate: function(renderTemplate) {
      if (!parser) parser = require('./parser');
      var srcList = renderTemplate.srcList;
      //console.log("\n\n\n",'finalizeTemplate',srcList.length,"\n\n\n", srcList);
      //console.log("\n\n\n======================\nfinalizeTemplate\n", sys.inspect(srcList, true, 4), "\n\n\n========================");
      if (srcList.length == 1 && srcList[0] instanceof (utils.rawString)) {
        //console.log("\n\n[DONE]\n\n");
        if (typeof renderTemplate.renderCallback == 'function') renderTemplate.renderCallback(srcList[0].str);
      } else {

        renderTemplate.srcList = [];
        renderTemplate.onRender = [];
        renderTemplate.src = '';
        renderTemplate.template.helpers.template = renderTemplate;
        renderTemplate.noWhiteSpace = renderTemplate.template.noWhiteSpace;
        renderTemplate.indentation = 0;
        parser(renderTemplate, srcList);
        renderTemplate.template.helpers.template = renderTemplate.template;
        //console.log("\n\n\nafter rerender", renderTemplate.srcList.length,"\n\n\n",renderTemplate.srcList);
        //console.log("\n\nfunc: ", renderTemplate.srcList[1]);
        //console.log("\n\n[RERENDER]\n\n", renderTemplate.srcList);
        renderTemplate.render();
      }

    },
    addOnRender: function(template, fnRenderMethod, indentation) {
      //console.log('addOnRender:fnRenderMethod', fnRenderMethod);
      if (template.src && template.src.length) template.srcList.push(new (utils.rawString)(template.src));
      //console.log('addOnRender', template.src, '<--->',template.srcList);
      indentation = indentation || template.indentation || 0;

      // Unique function wrapper as fnRenderMethod may a variable thats used
      // for multiple onRender calls, and we don't want to mistakenly
      // replace the wrong function area. (ie same func is used in 2 places,
      // 2nd one returns first, but the first one would get its answer)
      var uniqueFunction = function(renderVars, render) {
        //console.log('unique', fnRenderMethod);
        fnRenderMethod(renderVars, render);
      };
      //console.log('adding onRender', indentation, fnRenderMethod);
      uniqueFunction.indentation = indentation;
      template.srcList.push(uniqueFunction);
      template.onRender.push(uniqueFunction);

      template.src = '';
    }
  }
  var
      rawString = utils.rawString,
      isArray = utils.isArray,
      getText = utils.getText;



  // *****************************************************
  /*/
  ///  PARSER
  /*/
  // *****************************************************
  var processNode = function (template, node) {
    //console.log('processNode', template.indentation, node);
    var result;
    //if(!node) console.log(utils.printStackTrace());
    if (typeof node == 'object') {
      if (node instanceof rawString) {
        //console.log('========================================== ADD RAW', node.str)
        template.src += node.str;
      } else if (isArray(node)) {
        //console.log('got an array', node);
        jQuery.each(node, function(idx, nextnode) {
          processNode(template, nextnode);
        });
      } else {
        for (var tagname in node) break;
        if (tagname) {
          //console.log('got tagname', template.indentation, tagname);

          template.indent();
          template.src += '<' + tagname;

          var opts = node[tagname];
          var type = typeof opts;
          if (type == 'object' && !(opts instanceof rawString)) {
            var children = [];
            var args = null;

            if (isArray(opts)) {
              jQuery.each(opts, function(idx, opt) {
                var opttype = typeof opt;
                if (opttype == 'object') {
                  if (!children.length && isArray(opt)) {
                    children = opt;
                  } else if (!args && !isArray(opt)) {
                    //console.log("set opts", opt);
                    args = opt;
                  } else {
                    //console.log(!!args, !!children.length, opt)
                    children.push(opt);
                  }
                } else {
                  if (!args) args = {};//if a non object comes first, there are no args.
                  children.push(opt);
                }
              });
            } else {
              args = opts;
            }
            if (args) {
              var origWhitespace = template.noWhiteSpace;
              template.noWhiteSpace = true;
              for (var argname in args) {
                if (args.hasOwnProperty(argname)) {
                  template.src += ' ' + argname +'="';
                  var argval = args[argname];
                  processNode(template, argval);
                  template.src += '"';
                }
              }
              template.noWhiteSpace = origWhitespace;
            }

            if (children.length || tagname == 'script') {
              template.src += '>';
              template.endLine();
              template.indentation++;
              jQuery.each(children, function(idx, childnode) {
                processNode(template, childnode);
              });
              template.indentation--;
              //template.endLine();

              template.indent();
              template.src += '</' + tagname + '>';
              template.endLine();
            } else {
              template.src += '/>';
              template.endLine();
            }
          } else {
            template.src += '>';
            template.endLine();
            template.indentation++;
            processNode(template, opts);
            template.indentation--;
            template.indent();
            template.src += '</' + tagname + '>';
            template.endLine();
          }
        }
      }
    } else if (typeof node == 'function') {
      result = node.call(template);
      if (result) processNode(template, result);

    } else if (node) {
        template.addText(node);
        template.endLine();
    }
  };
  var processNodeWrapper = function(template, node) {
    processNode(template, node);
    if (template.src && template.src.length) template.srcList.push(new rawString(template.src));
  };
  processNodeWrapper.processNode = processNode;
  parser = processNodeWrapper;


  // *****************************************************
  /*/
  ///  HELPERS
  /*/
  // *****************************************************

  var helpersObj = {
    scriptSrc: function(func, args) {
      var aArgs = []

      if (typeof args != 'undefined') {
        if (arguments.length > 2) {
          for (var i = 1; i < arguments.length; i++) {
            aArgs.push(arguments[i]);
          }
        } else if (!utils.isArray(args)) aArgs = [args];
      }

      return function() {
        var funcsrc = func.toString();
        funcsrc = funcsrc.replace('/*[:ignore]','').replace('[/:ignore]*/','');
        var indent = /\n(\s+)\}\s*$/.exec(funcsrc)[1];
        //console.log(funcsrc, '<'+indent+'>');
        if(indent) {
          funcsrc = funcsrc.replace(new RegExp('^' + indent,'gm'), '');
        }

        var template = this;

        var scriptArgs = {type:'text/javascript'};
        var children = [];
        var scriptObj = {script:[scriptArgs, children]};

        if (typeof func == 'function') {
          var origWhiteSpace = template.noWhiteSpace;

          if (template.noWhiteSpace) {
            children.push(new rawString("(" + funcsrc + ")("));
          } else {

            children.push(new rawString(utils.getText('(' + funcsrc + ")(", template.indentation+1)));
          }





          if (aArgs.length) {
            var bFirst = true;
            jQuery.each(aArgs, function(idx, arg) {
              if (!bFirst) children.push( new rawString(','));
              else bFirst = false;
              if (typeof arg == 'function') {
                if (typeof arg.renderFunc == 'object') {
                  var actualCallback = arg.renderFunc.func;
                  arg.renderFunc.func = function(renderVars, render) {
                    actualCallback(renderVars, function(answer) {
                      render(new rawString(JSON.stringify(answer)));
                    });
                  };

                  // TODO: Figure out how to make whitespace not be added for args

                  arg.renderFunc.func.noWhiteSpace = true;
                  children.push(arg);
                } else {
                  children.push(function() {
                    return new rawString(JSON.stringify(arg()));
                  });
                }
              }else {
                children.push(new rawString(JSON.stringify(arg)));
              }
            });
          }

          children.push(new rawString(')'));
          children.push(function() {
            template.noWhiteSpace = origWhiteSpace;
            template.endLine();
          });

          var origWhitespace = template.noWhiteSpace;
          //template.noWhiteSpace = true;

          processNode(template, scriptObj);

          template.noWhiteSpace = origWhitespace;
        } else if (typeof func == 'string') {
          scriptArgs.src = func;
          processNode(template, scriptObj);
        }
      };
    },
    onRender: function(fnRenderFunc, indentation) {
      var self = this;
      var renderFunc = {func: fnRenderFunc};

      var returnFunc = function() {
        if (typeof indentation == 'undefined') indentation = this.indentation;
        var fnRenderFuncWrapper = function(renderVars, render) {
          renderFunc.func.call(self.template, renderVars, render);
        };
        utils.addOnRender(this, fnRenderFuncWrapper, indentation);
      };
      returnFunc.renderFunc = renderFunc;
      return returnFunc;
    },
    partial: function(filename, collection) {
      var self = this;
      return function(){
        var template = self.template,
            fullFilename = path.normalize(path.dirname(template.templateFile)
              + '/' + filename),
            partialTemplate = nova(fullFilename, {
              indentation: template.indentation,
              noWhiteSpace: template.opts.noWhiteSpace,
              noDocType: true
            });
        //console.log('partial parent template', template);
        if(!partialTemplate) return null;
        if (!utils.isArray(collection)) {
          collection = [collection];

        }
        var result = [];

        jQuery.each(collection, function(idx, partialVars) {
          var partialNodes = [];

          partialTemplate.jQuery.each(srcList, function(idx, chunk) {
            if (typeof chunk == 'function') {

              var onRenderResult = self.onRender(function(renderVars, render) {
                //console.log('partial onRender called', partialVars, render);
                //console.log("calling to", chunk);
                partialVars._renderVars = renderVars;
                chunk(partialVars, render);
              }, chunk.indentation);

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
        jQuery.each(collection, function(idx, partialVars) {
          partialTemplate.render(partialVars, function(partialRender) {
            partialResult.push(partialRender);
          });
        });
      });*/

    }
  };
  helpers = function(template) {
    var templateHelper = {template: template};
    for (var i in helpersObj) {
      templateHelper[i] = helpersObj[i];
    }
    return templateHelper;
  };
  helpers.helpers = helpersObj;


  // *****************************************************
  /*/
  ///  NOVA
  /*/
  // *****************************************************






  var finalizeTemplate = utils.finalizeTemplate;

  var fnGetTemplate = function(sTemplateSrc) {

    var opts = {};

    //console.log(sTemplateFile, opts);
    var noWhiteSpace = opts.noWhiteSpace = opts.noWhiteSpace || false;
    

    opts.indentation = opts.indentation || 0;

    var onTemplateData = function(err, data) {
      data = data.toString().replace(/[\s\;]+$/,'');
      //console.log('onTemplateData', data);
      var fnTemplateFunc = eval('('+data +')');

      var template = {
        // properties
        opts: opts,
        docType: '',
        templateFile: '.',
        indentation: opts.indentation || 0,
        src: '',
        noWhiteSpace: noWhiteSpace,
        srcList: [],
        onRender: [],
        rendering: false,

        // methods

        //whitespace methods
        indent: (noWhiteSpace ? function(){}: utils.templateIndent),
        endLine: (noWhiteSpace ? function(){}: utils.templateEndLine),

        //normal methods
        addText: utils.templateAddText,
        render: function(renderVars, renderCallback) {
          if (typeof renderVars == 'function') {
            renderCallback = renderVars;
            renderVars = {};
          }

          var renderTemplate = {
            // properties
            opts: opts,
            docType: '',
            templateFile: '.',
            indentation: template.indentation,
            src: '',
            noWhiteSpace: noWhiteSpace,
            helpers: template.helpers,
            srcList: template.srcList.slice(0),
            onRender: template.onRender.slice(0),
            rendering: true,

            template: template,
            renderVars: renderVars,
            renderCallback: renderCallback,

            // methods
            indent: template.indent,
            endLine: template.endLine,
            addText: utils.templateAddText,
            render: function() {
              //console.log('renderTemplate.rendering, RENDERTEMP:srcList', renderTemplate.srcList,"\nRENDERTEMP:onRender", renderTemplate.onRender);
              template.rendering = true;
              var whatToRender = renderTemplate.onRender.slice(0);
              if (whatToRender.length) {
                var origWhitespace = renderTemplate.noWhiteSpace;

                renderTemplate.template.helpers.template = renderTemplate;
                jQuery.each(whatToRender, function(idx, chunk) {
                  if (typeof chunk == 'function') {
                    //console.log('onRenderFunc:', chunk);
                    //if (typeof chunk.noWhiteSpace != 'undefined') template.noWhiteSpace = chunk.noWhiteSpace;
                    var indentation = chunk.indentation;
                    renderTemplate.indentation = indentation;
                    //console.log('executing chunk with', indentation, chunk)
                    chunk(renderTemplate.renderVars, function(answer) {
                      //console.log('got an answer', answer);
                      if (answer instanceof rawString) {
                        //console.log('got a raw string', answer);

                      } else {
                        answer = [function(){
                            //console.log("forcing indentation", indentation, answer);
                            renderTemplate.indentation = indentation;
                        }, answer, ];
                      }
                      var index = renderTemplate.srcList.indexOf(chunk);
                      if (index != -1) {
                        renderTemplate.srcList.splice(index, 1, answer);
                      }

                      var renderIndex = renderTemplate.onRender.indexOf(chunk);
                      if (renderIndex != -1) {
                        renderTemplate.onRender.splice(renderIndex, 1);
                      }
                      //console.log('got an answer', answer);
                      //console.log("onRender Left after answer",renderTemplate.onRender);
                      //console.log("first:", renderTemplate.onRender[0]);
                      //console.log("srcList after onRender", renderTemplate.srcList);
                      if(renderTemplate.onRender.length <= 0) {
                        finalizeTemplate(renderTemplate);
                      }
                    });
                    template.noWhiteSpace = origWhitespace;
                  }
                });
                renderTemplate.template.helpers.template = renderTemplate.template;
              } else {
                  finalizeTemplate(renderTemplate);
              }
              template.rendering = false;
            }
          };
          renderTemplate.render();
        }
      };
      template.helpers = helpers(template);

      var templateObj = fnTemplateFunc(template.helpers);
      //console.log('got templateObj', templateObj);
      parser(template, templateObj);

      /*if (docType && !opts.noDocType) {
        template.srcList.unshift("<!DOCTYPE " + docType + ">\n");
      }*/
      //console.log(template);
      return template;
    };

    return onTemplateData(null, sTemplateSrc);
  }
  nova = fnGetTemplate;
  return nova;
})();

