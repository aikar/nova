(function(){
  var utils = require('./utils'),
      rawString = utils.rawString,
      isArray = utils.isArray, 
      getText = utils.getText;
  
  var processNode = function (template, node) {
    //console.log('processNode', template.indentation, node);
    var result;
    //if (node) console.log(typeof node, node, utils.printStackTrace());
    //handle using HTML helpers w/o calling them ie: div(hr, p('foo), hr)
    if (node && node.__helperTag) {
      node = node();
    }
    if (typeof node == 'object') {
      if (node instanceof rawString) {
        //console.log('========================================== ADD RAW', node.str)
        template.src += node.str;
      } else if (isArray(node)) {
        //console.log('got an array', node);
        utils.forEach(node, function(nextnode) {
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
              utils.forEach(opts, function(opt) {
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
              utils.forEach(children, function(childnode) {
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
      result = node.call(template, template.opts);
      
      if (result) processNode(template, result);

    } else if (node) {
        template.addText(node);
        template.endLine();
    }
  };
  var processNodeWrapper = function(template, node) {
    processNode(template, node);
    if (template.src && template.src.length) template.add(new rawString(template.src));
  };
  processNodeWrapper.processNode = processNode;
  module.exports = processNodeWrapper;
})();


