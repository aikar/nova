/**
 * Nova: A Node JS Templating system written by Daniel Ennis (Aikar <Aikar@Aikar.co>)
 * for the Starlis project.
 *
 * File: Utilities. Small helpers to be used in Nova but not large enough for its own file.
 */

(function() {
  var sys = require('util');
  var utils = module.exports = {
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

    //normal funcs
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
      return utils.indent(indentation) + text.replace("\r\n","\n").replace(/^\s+/,"").split("\n").join("\n" + utils.indent(indentation));
    },
    isArray: function(obj) {
      if (!obj || obj.constructor.toString().indexOf("Array") == -1)
        return false;
      else
        return true;
    },
    finalizeTemplate: function(renderTemplate) {
      var srcList = renderTemplate.srcList;
      //console.log("\n\n\n",'finalizeTemplate',srcList.length,"\n\n\n", srcList);
      if (utils.isArray(srcList)) {
        if (srcList.length == 1 && typeof srcList[0] == 'string') {

          //console.log("\n\n[DONE]\n\n");
          renderTemplate.renderCallback(srcList[0]);
        } else {
          renderTemplate.srcList = [];
          renderTemplate.onRender = [];
          renderTemplate.src = '';
          renderTemplate.template.helpers.template = renderTemplate;
          require('./parser')(renderTemplate, srcList);
          renderTemplate.template.helpers.template = renderTemplate.template;
          //console.log("\n\n\nafter rerender", renderTemplate.srcList.length,"\n\n\n",renderTemplate.srcList);
          //console.log("\n\nfunc: ", renderTemplate.srcList[1]);
          renderTemplate.render();
        }
      }
    },
    addOnRender: function(template, fnRenderMethod, indentation) {
      //console.log('addOnRender:fnRenderMethod', fnRenderMethod);
      if (template.src && template.src.length) template.srcList.push(template.src);
      //console.log('addOnRender', template.src, '<--->',template.srcList);
      indentation = indentation || template.indentation || 0;
      if (indentation && !fnRenderMethod.noIdent) {
        var indentWrapper = function(renderVars, render) {
          //console.log('>>> using args', renderVars, 'to call', fnRenderMethod);
          
          fnRenderMethod(renderVars, function(answer) {
            //render(utils.getText(answer, indentation));
            //console.log("calling render(answer) in indentWrapper", render);
            render(answer);
          });
        };
        template.srcList.push(indentWrapper);
        template.onRender.push(indentWrapper);
      } else {
        var uniqueFunction = function(renderVars, render) {
          //console.log('unique', fnRenderMethod);
          fnRenderMethod(renderVars, render);
        };
        template.srcList.push(uniqueFunction);
        template.onRender.push(uniqueFunction);
      }
      template.src = '';
    }
  }
})();