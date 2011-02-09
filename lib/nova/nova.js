(function(){
  var fs = require('fs'),
  vm = require('vm'),
  sys = require('sys'),
  utils = require('./utils'),
  parser = require('./parser'),
  helpers = require('./helpers'),
  path = require('path'),
  rawString = utils.rawString,
  finalizeTemplate = utils.finalizeTemplate;

  
  var compileCache = {};

  var fnGetTemplate = function(sTemplateFile, opts, fnCallback) {
    
    opts = opts || {};
    if (typeof opts == 'function') {
      fnCallback = opts;
      opts = {};
    }
    //console.log(sTemplateFile, opts);
    var noWhiteSpace = opts.noWhiteSpace = opts.noWhiteSpace || false;
    var docType = opts.docType = opts.docType || "html";//html5
    var async = false;

    opts.indentation = opts.indentation || 0;

    if (typeof fnCallback == 'function') async = true;
    
    if (!path.extname(sTemplateFile)) sTemplateFile += '.js';
    var cacheKey = sTemplateFile + opts.indentation;
    if (typeof compileCache[cacheKey] != 'undefined' && compileCache[cacheKey]) {
      if (async) {
        fnCallback(compileCache[cacheKey]);
      }else{
        return compileCache[cacheKey];
      }
    }else{
      var onTemplateData = function(err, data) {
        if(!err) {
          var template = {
            // properties
            opts: opts,
            docType: docType,
            templateFile: sTemplateFile,
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
                docType: docType,
                templateFile: sTemplateFile,
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
                    utils.forEach(whatToRender, function(chunk) {
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
                        }, renderTemplate.renderVars);
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
          

          
          var sandbox = template.helpers;
          for (var k in global) {
            sandbox[k] = global[k];
          }
          sandbox.require = require;
          sandbox.__filename = sTemplateFile;
          sandbox.__dirname = path.dirname(sTemplateFile);
          sandbox.global = sandbox;
          
          data = data.toString();
          //console.log(data);
          var templateObj = vm.runInNewContext(data, sandbox, sTemplateFile);
          
          //console.log('got templateObj', templateObj);
          parser(template, templateObj);
          
          if (docType && !opts.noDocType) {
            template.srcList.unshift(rawString("<!DOCTYPE " + docType + ">\n"));
          }
          
          compileCache[cacheKey] = template;
          //console.log('compiled', sTemplateFile, compileCache[cacheKey].srcList);
          //console.log('async', async);
          if (async) {
            //console.log('calling fnCallback', fnCallback, fnCallback.toString());
            fnCallback(compileCache[cacheKey]);
          }
        } else {
          if (async) {
            fnCallback(null);
          }
        }
      };
      if (async) {
        fs.readFile(sTemplateFile, onTemplateData);
      } else {
        try {
          var sTemplateSrc = fs.readFileSync(sTemplateFile);
          onTemplateData(null, sTemplateSrc);
          return compileCache[cacheKey];
        } catch(e) {
          console.log(e.message);
          console.log(e.stack);
        }
      }
    }
    return null;
  }
  module.exports = fnGetTemplate;
})();