(function() {
  var utils = require('./utils'), 
      processNode = require('./parser').processNode,
      path = require('path');
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

          children.push("(" + funcsrc + ")(");
          
          if (aArgs.length) {
            var bFirst = true;
            aArgs.forEach(function(arg) {
              if (!bFirst) children.push(',');
              else bFirst = false;
              //if (typeof arg == 'function') children.push()
              //TODO: Fix json encoding
              children.push(arg);
            });
          }
          children.push(')');
          
          var origWhitespace = template.noWhiteSpace;
          template.noWhiteSpace = true;
          
          processNode(template, scriptObj);
          
          template.noWhiteSpace = origWhitespace;
        } else if (typeof func == 'string') {
          scriptArgs.src = func;
          processNode(template, scriptObj);
        }
      };
    },
    onRender: function(fnRenderFunc) {
      return function() {
        fnRenderFunc.__template = this;
        fnRenderFunc.__indent = this.indentation;
        utils.addOnRender(this, fnRenderFunc, this.indentation);
      };      
    },
    partial: function(filename, collection) {
      var self = this;
      var template = this.template,
          fullFilename = path.normalize(path.dirname(template.templateFile)
            + '/' + filename),
          partialTemplate = require('./nova')(fullFilename, {
            noWhiteSpace: template.opts.noWhiteSpace,
            noDocType: true
          });
      
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
            });
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
    require('./nova');//cache it so when a user is rendering its cached
    var templateHelper = {template: template};
    for (var i in helpers) {
      templateHelper[i] = helpers[i];
    }
    return templateHelper;
  };
  wrapHelpers.helpers = helpers;
  module.exports = wrapHelpers;
})();