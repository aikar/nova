(function(){
  var utils = require('./utils'), 
      isArray = utils.isArray, 
      getText = utils.getText, 
      indent = utils.indent;
  
  var processNode = function (template, node) {
    //console.log('processNode', template.indentation, node);
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
          //console.log('got tagname', template.indentation, tagname);
          
          template.indent();
          template.src += '<' + tagname;

          var opts = node[tagname];
          var type = typeof opts;
          if (type == 'string') {
            template.src += '>';
            template.endLine();
            
            template.src += getText(opts, template.indentation+1);
            template.endLine();
            
            template.indent();
            template.src +=  '</' + tagname + '>';
            template.endLine();
          } else if (type == 'object') {
            var children = [];
            var args = null;
            
            if (isArray(opts)) {
              opts.forEach(function(opt) {
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

            if (children || tagname == 'script') {
              template.src += '>';
              template.endLine();
              template.indentation++;
              children.forEach(function(childnode) {
                processNode(template, childnode);
                //console.log(childnode);
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
          } else if (type == 'function') {
            template.src += '>';
            template.endLine();
            template.indentation++;
            processNode(template, opts.call(template));
            template.indentation--;
            template.src += indent() + '</' + tagname + '>';
            template.endLine();
          }
        }
      }
    } else if (typeof node == 'function') {
      processNode(template, node.call(template));
    } else if (node) {
        //console.log('unknown <', typeof node,'>', node);
      node = node.toString();
      if (node) {
        template.src += getText(node, template.noWhiteSpace ? 0 : template.indentation);
        template.endLine();
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


