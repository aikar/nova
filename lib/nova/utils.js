/**
 * Nova: A Node JS Templating system written by Daniel Ennis (Aikar <Aikar@Aikar.co>)
 * for the Starlis project.
 *
 * File: Utilities. Small helpers to be used in Nova but not large enough for its own file.
 */

(function() {
  var parser; //load later due to recursion
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
      var aText = utils.htmlentities(text.toString()).replace("\r\n","\n").replace(/^\s+/,"").split("\n");
      var sep = "\n";
      if (!this.noWhiteSpace) sep = "\n" + utils.indent(this.indentation);
      this.src += aText.join(sep);
      this.endLine();
    },
    templateAdd: function(node) {
      this.srcList.push(node);
    },




    //normal funcs
    htmlentities: htmlentities,
    rawString: rawString,
    indent: function(level) {
      level = level || 0;
      return new Array(level+1).join("\t");
    },
    printStackTrace: function() {
      try {
        i.dont.exist+=0; //doesn't exist- that's the point
      } catch(e) {
        return e.stack.split("\n").slice(2).join("\n");
      }
      return null;
    },
    
  


    forEach: function(list, cb) {
      if (typeof cb != 'function' || !list.length) return;
      for (var i = 0; i < list.length; i++) {
        cb.call(list[i], list[i], i);
      }
    },
    getText: function(text, indentation) {
      //console.log(utils.printStackTrace());
      //console.log("getText", indentation, text);
      return utils.indent(indentation) + text.replace("\r\n","\n")
        .replace(/^\s+/,"").split("\n").join("\n" + utils.indent(indentation));
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
      //console.log("\n\n\n======================\nfinalizeTemplate\n", sys.inspect(srcList, true, 4), "\n\n\n========================");
      if (srcList.length == 1 && srcList[0] instanceof (utils.rawString)) {
        //console.log("\n\n[DONE]\n\n");
        if (typeof renderTemplate.renderCallback == 'function') {
          renderTemplate.renderCallback(srcList[0].str);
        }
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
      if (template.src && template.src.length) template.add(rawString(template.src));
      //console.log('addOnRender', template.src, '<--->',template.srcList);
      indentation = indentation || template.indentation || 0;
      //console.log(indentation, fnRenderMethod.stub)
      // Unique function wrapper as fnRenderMethod may a variable thats used
      // for multiple onRender calls, and we don't want to mistakenly
      // replace the wrong function area. (ie same func is used in 2 places,
      // 2nd one returns first, but the first one would get its answer)
      var uniqueFunction = function(renderVars, render) {
        //addOnRender:unique
        fnRenderMethod.call(this, renderVars, render);
      };
      uniqueFunction.actual = fnRenderMethod;
      uniqueFunction.toString = fnRenderMethod.toString;
      
      //console.log('adding onRender', indentation, fnRenderMethod);
      uniqueFunction.indentation = indentation;
      template.add(uniqueFunction);
      template.onRender.push(uniqueFunction);

      template.src = '';
    }
  }
  
})();


var entities = [];
function build_entities() {
  if (!entities.length) {
    //this causes issues with already entitied codes
    //entities.push([String.fromCharCode('38'), '&amp;']);
    /*
    These may be useful but I think the main intent we should be doing is to
    escape tags that may otherwise break HTML. These tags commented out
    wont "break" HTML.
    
    The more entities we have here, the more performance impact it occurs.
    So Id rather keep it to bare minimum to ensure data integrity only.
      
    entities.push([String.fromCharCode('160'), '&nbsp;']);
    entities.push([String.fromCharCode('162'), '&cent;']);
    entities.push([String.fromCharCode('163'), '&pound;']);
    entities.push([String.fromCharCode('164'), '&curren;']);
    entities.push([String.fromCharCode('165'), '&yen;']);
    entities.push([String.fromCharCode('169'), '&copy;']);
    entities.push([String.fromCharCode('171'), '&laquo;']);
    entities.push([String.fromCharCode('183'), '&middot;']);
    entities.push([String.fromCharCode('187'), '&raquo;']);*/
    entities.push([String.fromCharCode('34'), '&quot;']);
    entities.push([String.fromCharCode('39'), '&#39;']);
    entities.push([String.fromCharCode('60'), '&lt;']);
    entities.push([String.fromCharCode('62'), '&gt;']);
  }
  return entities;
}
build_entities();

function htmlentities (string) {
  
    for (var i = 0; i < entities.length; i++) {
        var symbol = entities[i][0],
            entity = entities[i][1];
        if(string.indexOf(symbol) != -1) {
          //js is lame and doesnt have replaceAll, so split/join
          string = string.split(symbol).join(entity);
        }
        //if the data already had an entity, we just entitied the & incorrectly, fix!
        /*if(string.indexOf('&amp;amp' + entity.substr(1)) != -1) {
          string = string.split('&amp;' + entity.substr(1)).join(entity);
        }*/
    }

    return string;
}

function rawString(str) {
  if (!(this instanceof rawString)) {
    return new rawString(str);
  }
  this.str = str.toString();
}