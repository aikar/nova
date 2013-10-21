(function(){
  var fs               = require('fs'),
      vm               = require('vm'),
      path             = require('path'),
      utils            = require('./utils'),
      parser           = require('./parser'),
      helpers          = require('./helpers'),
      rawString        = utils.rawString,
      finalizeTemplate = utils.finalizeTemplate;


  var compileCache = {};

  var getTemplate = function(templateFile, opts, cb) {

    opts = opts || {};
    if (typeof opts == 'function') {
      cb = opts;
      opts = {cache: true};
    } else if (opts.cache == undefined) {
      opts.cache = true;
    }
    //console.log(templateFile, opts);
    var noWhiteSpace = opts.noWhiteSpace = opts.noWhiteSpace || false;
    var docType = opts.docType = opts.docType || "html";//html5
    var async = false;

    opts.indentation = opts.indentation || 0;

    if (typeof cb == 'function') async = true;

    if (!path.extname(templateFile)) templateFile += '.js';
    var cacheKey = templateFile + ':' + JSON.stringify(opts);
    if (typeof compileCache[cacheKey] != 'undefined' && compileCache[cacheKey]) {
      //console.log("got " + templateFile + " from cache " + cacheKey);
      if (async) {
        cb(null, compileCache[cacheKey]);
      }else{
        return compileCache[cacheKey];
      }
    }else{
      //console.log("nocache for " + templateFile + " - " + cacheKey);
      var onTemplateData = function(err, data) {
        if(!err) {
          var template = {
            // properties
            opts: opts,
            docType: docType,
            templateFile: templateFile,
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
            add: utils.templateAdd,
            render: function(renderVars, renderCallback) {
              if (typeof renderVars == 'function') {
                renderCallback = renderVars;
                renderVars = {};
              }

              var renderTemplate = {
                // properties
                opts: opts,
                docType: docType,
                templateFile: templateFile,
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
                add: utils.templateAdd,
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
                        //console.log('executing chunk with', indentation, chunk.actual.stub)
                        chunk.call(renderTemplate, renderTemplate.renderVars, function(answer) {
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
          sandbox.__filename = templateFile;
          sandbox.__dirname = path.dirname(templateFile);
          sandbox.global = sandbox;

          data = data.toString();
          //console.log(data);
          var templateObj = vm.runInNewContext(data, sandbox, templateFile);

          //console.log('got templateObj', templateObj);
          parser(template, templateObj);

          if (docType && !opts.noDocType) {
            template.srcList.unshift(rawString("<!DOCTYPE " + docType + ">\n"));
          }
          if (opts.cache) {
            compileCache[cacheKey] = template;
          }
          //console.log('compiled', templateFile, compileCache[cacheKey].srcList);
          //console.log('async', async);
          if (async) {
            //console.log('calling cb', cb, cb.toString());
            cb(null, template);
          } else {
            return template;
          }
        } else {
          if (async) {
            cb(err);
          } else {
            throw err;
          }
        }
      };
      if (async) {
        fs.readFile(templateFile, onTemplateData);
      } else {
        var templateSrc = fs.readFileSync(templateFile);
        return onTemplateData(null, templateSrc);
      }
    }
    return null;
  }
  module.exports = getTemplate;
  module.exports.__express = function(file, opts, cb) {
    getTemplate(file, opts, function (err, template) {
      if (!opts) {
        opts = {}
      }
      if (err) {
        cb(err);
      } else {
        template.render(opts.locals || {}, function(data) {
          cb(null, data);
        });
      }
    });
  }
})();
