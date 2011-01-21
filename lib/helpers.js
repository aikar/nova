(function() {
  var utils = require('./utils'), 
      processNode = require('./parser').processNode,
      path = require('path'),
      nova;
  var helpers = {
    scriptSrc: function(func, aArgs) {
      var self = this;
      if (!utils.isArray(aArgs)) aArgs = [aArgs];
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
          children.push(function() {
            template.noWhiteSpace = true;
          });
          
          if (template.noWhiteSpace) {
            children.push("(" + funcsrc + ")(");
          } else {
            children.push(utils.getText("(" + funcsrc + ")(", template.indentation+1));
          }
          
          
          if (aArgs.length) {
            var bFirst = true;

            aArgs.forEach(function(arg) {
              if (!bFirst) children.push(',');
              else bFirst = false;
              if (typeof arg == 'function') {
                if (typeof arg.renderFunc == 'object') {
                  var actualCallback = arg.renderFunc.func;
                  arg.renderFunc.func = function(renderVars, render) {
                    actualCallback(renderVars, function(answer) {
                      render(JSON.stringify(answer));
                    });
                  };

                  // TODO: Figure out how to make whitespace not be added for args

                  arg.renderFunc.func.noWhiteSpace = true;
                  children.push(arg);
                } else {
                  children.push(function() {
                    return JSON.stringify(arg());
                  });
                }
              }else {
                children.push(JSON.stringify(arg));
              }
            });
          }
          
          children.push(')');
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

        collection.forEach(function(partialVars) {
          var partialNodes = [];

          partialTemplate.srcList.forEach(function(chunk) {
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
        collection.forEach(function(partialVars) {
          partialTemplate.render(partialVars, function(partialRender) {
            partialResult.push(partialRender);
          });
        });
      });*/
      
    }
  };
  var wrapHelpers = function(template) {
    nova = require('./nova');//cache it so when a user is rendering its cached
    var templateHelper = {template: template};
    for (var i in helpers) {
      templateHelper[i] = helpers[i];
    }
    return templateHelper;
  };
  wrapHelpers.helpers = helpers;
  module.exports = wrapHelpers;
})();