(function(){
  var fs = require('fs'),
  vm = require('vm'),
  sys = require('sys'),
  utils = require('./utils'),
  parser = require('./parser'),
  helpers = require('./helpers'),
  path = require('path'),
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
    if (typeof fnCallback == 'function') async = true;
    
    if (!path.extname(sTemplateFile)) sTemplateFile += '.js';
    if (typeof compileCache[sTemplateFile] != 'undefined' && compileCache[sTemplateFile]) {
      if (async) {
        fnCallback(compileCache[sTemplateFile]);
      }else{
        return compileCache[sTemplateFile];
      }
    }else{
      var onTemplateData = function(err, data) {
        if(!err) {
          data = data.toString().replace(/[\s\;]+$/,'');
          //console.log('onTemplateData', data);
          var fnTemplateFunc = eval(data);
          /*vm
            .createScript(data)
            .runInThisContext();
          */
          var template = {
            // properties
            opts: opts,
            docType: docType,
            templateFile: sTemplateFile,
            indentation: 0,
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
                indentation: 0,
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
                render: function() {
                  //console.log('renderTemplate.rendering, RENDERTEMP:srcList', renderTemplate.srcList,"\nRENDERTEMP:onRender", renderTemplate.onRender);
                  template.rendering = true;
                  var whatToRender = renderTemplate.onRender.slice(0);
                  if (whatToRender.length) {
                    whatToRender.forEach(function(chunk) {
                      if (typeof chunk == 'function') {
                        //console.log('onRenderFunc:', chunk);
                        chunk(renderTemplate.renderVars, function(answer) {
                          
                          //console.log('got an answer', answer);

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

                      }
                    });
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
          
          if (docType && !opts.noDocType) {
            template.srcList.unshift("<!DOCTYPE " + docType + ">\n");
          }
          
          compileCache[sTemplateFile] = template;
          //console.log('compileCache[sTemplateFile]', compileCache[sTemplateFile]);
          //console.log('async', async);
          if (async) {
            //console.log('calling fnCallback', fnCallback, fnCallback.toString());
            fnCallback(compileCache[sTemplateFile]);
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
          return compileCache[sTemplateFile];
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