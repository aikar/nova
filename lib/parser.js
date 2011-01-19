(function(){
  var utils = require('./utils'), 
      isArray = utils.isArray, 
      getText = utils.getText, 
      addOnRender = utils.addOnRender,
      indent = utils.indent;
  
  var processNode = function (template, node) {
    //console.log('processNode', node);
    //if(!node) console.log(utils.printStackTrace());
    if (typeof node == 'object') {
      if (isArray(node)) {
        //console.log('got an array', node);
        node.forEach(function(nextnode) {
          processNode(template, nextnode);
        });
      } else {
        for (var tagname in node) break;
        if (tagname) {
          //console.log('got tagname', tagname);
          template.src += indent() + '<' + tagname;
          var opts = node[tagname];
          var type = typeof opts;
          if (type == 'string') {
            template.src += '>';
            if (!template.noWhiteSpace) template.src += "\n";
            template.src += getText(opts, template.indentation);
            if (!template.noWhiteSpace) template.src += "\n";
            template.src += indent() + '</' + tagname + '>';
            if (!template.noWhiteSpace) template.src += "\n";
          } else if (type == 'object') {
            var children = null;
            var args = null;
            var innersrc = '';
            if (isArray(opts)) {
              opts.forEach(function(opt) {
                var opttype = typeof opt;
                if (opttype == 'object') {
                  if (isArray(opt)) {
                    children = opt;
                  } else {
                    args = opt;
                  }
                } else if (opttype == 'string') {
                  template.indentation++;
                  innersrc += getText(opt, template.indentation);
                  template.indentation--;
                  if (!template.noWhiteSpace) innersrc += "\n";
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

            if (children) {
              template.src += '>';
              if (!template.noWhiteSpace) template.src += "\n";
              template.indentation++;
              children.forEach(function(childnode) {
                //console.log('has child', childnode);
                processNode(template, childnode);
              });
              template.indentation--;
            } else if (!innersrc && tagname != 'script') {
              template.src += '/>';
              if (!template.noWhiteSpace) template.src += "\n";
            } else {
              template.src += '>';
              if (!template.noWhiteSpace) template.src += "\n";
            }
            if (innersrc || tagname == 'script') {
              template.src += innersrc;
              //if (!noWhiteSpace) src += "\n";
              template.src += indent(template.indentation) + '</' + tagname + '>';
              if (!template.noWhiteSpace) template.src += "\n";
            }else {
                    template.src += indent() + '</' + tagname + '>';
                    if (!template.noWhiteSpace) template.src += "\n";
                  }
          } else if (type == 'function') {
            template.src += '>';
            if (!template.noWhiteSpace) template.src += "\n";
            template.indentation++;
            processNode(template, opts.call(template));
            template.indentation--;
            template.src += indent() + '</' + tagname + '>';
            if (!template.noWhiteSpace) template.src += "\n";
          }
        }
      }
    } else if (typeof node == 'function') {
      processNode(template, node.call(template));
    } else if (node) {
        //console.log('unknown <', typeof node,'>', node);
      node = node.toString();
      if(node) {
        template.src += getText(node, template.noWhiteSpace ? 0 : template.indentation);
        if (!template.noWhiteSpace) template.src += "\n";
      }
    }
  };
  var processNodeWrapper = function(template, node) {
    processNode(template, node);
    if (template.src && template.src.length) template.srcList.push(template.src);
  };
  processNodeWrapper.processNode = processNode;
  module.exports = processNodeWrapper;
})();


