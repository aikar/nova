/**
 * Nova: A Node JS Templating system written by Daniel Ennis (Aikar <Aikar@Aikar.co>)
 * for the Starlis project.
 *
 * File: Utilities. Small helpers to be used in Nova but not large enough for its own file.
 */

(function() {
  var sys = require('util'),
      parser; //load later due to recursion
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
    templateAddText: function(text) {
      if (!this.noWhiteSpace) this.src += utils.indent(this.indentation);
      var aText = text.toString().replace("\r\n","\n").replace(/^\s+/,"").split("\n");
      var sep = "\n";
      if (!this.noWhiteSpace) sep = "\n" + utils.indent(this.indentation);
      this.src += aText.join(sep);
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
      //console.log("getText", indentation, text);
      return utils.indent(indentation) + text.replace("\r\n","\n").replace(/^\s+/,"").split("\n").join("\n" + utils.indent(indentation));
    },
    isArray: function(obj) {
      return Array.isArray(obj);
      /*if (!obj || obj.constructor.toString().indexOf("Array") == -1)
        return false;
      else
        return true;*/
    },
    finalizeTemplate: function(renderTemplate) {
      if (!parser) parser = require('./parser');
      var srcList = renderTemplate.srcList;
      //console.log("\n\n\n",'finalizeTemplate',srcList.length,"\n\n\n", srcList);
      console.log("\n\n\n======================\nfinalizeTemplate\n", sys.inspect(srcList, true, 4), "\n\n\n========================");
      if (utils.isArray(srcList)) {
        if (srcList.length == 1 && typeof srcList[0] == 'string') {

          //console.log("\n\n[DONE]\n\n");
          renderTemplate.renderCallback(srcList[0]);
        } else {
          
          renderTemplate.srcList = [];
          renderTemplate.onRender = [];
          renderTemplate.src = '';
          renderTemplate.template.helpers.template = renderTemplate;
          renderTemplate.indentation = 0;
          parser(renderTemplate, srcList);
          renderTemplate.template.helpers.template = renderTemplate.template;
          //console.log("\n\n\nafter rerender", renderTemplate.srcList.length,"\n\n\n",renderTemplate.srcList);
          //console.log("\n\nfunc: ", renderTemplate.srcList[1]);
          //console.log("\n\n[RERENDER]\n\n", renderTemplate.srcList);
          renderTemplate.render();
        }
      }
    },
    addOnRender: function(template, fnRenderMethod, indentation) {
      //console.log('addOnRender:fnRenderMethod', fnRenderMethod);
      if (template.src && template.src.length) template.srcList.push(template.src);
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
})();