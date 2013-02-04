/*
** © 2013 by Philipp Dunkel <p.dunkel@me.com>. Licensed under MIT-License.
*/

module.exports = macadamia;
module.exports.module = loadModule;
(function(exports) {
  var utility = require('./lib/utils.js');
  Object.keys(utility).forEach(function(name) {
    Object.defineProperty(exports, name, {
      value:utility[name],
      enumerable:true
    });
  });
}(module.exports));

var App = require('./lib/app.js');
function macadamia(server) {
  var app = new App();
  if (server) server.on('request', app.handle);
  return app;
}

function loadModule(name, options) {
  var module = require('./mod/'+name);
  return module(options);
}

if (require.main === module) (function() {
  var options = {
    root:__dirname+'/doc/',
    errors:{ root:__dirname+'/err/' },
    index:[ '.html', '/index.html', '.md', '/Readme.md' ],
    indexName:'Readme',
    maxAge:0,
    markdown:{
      fixIndexLinks:true,
      before:'<html>\n  <head>\n    <title>${title}</title>\n    <link rel="stylesheet" type="text/css" href="/styles.css"/>\n  </head>\n  <body>',
      extension:'.md',
      fixLinks:[
        { search:'\\.md$', replace:'' }
      ]
    },
    compress:{ types:[ 'text/html', 'text/css', 'application/javascript' ] }
  };
  var http = require('http');
  var app = macadamia();
  app.engine('error', loadModule('htmlerror', options));
  app.post('**', loadModule('requestbody', options));
  app.get('**', loadModule('compress', options));
  app.get('*.html', loadModule('noexten', options));
  app.get('*.md', loadModule('rewrite', {
    rewrite:{
      rules:[
        { search:'\\.md$', replace:'.markdown' }
      ]
    }
  }));
  app.get(/\/(?:[^\.]+)?$/, loadModule('indexfix', options));
  app.get(/\.(?:md|markdown)/, loadModule('rewrite', {
    rewrite:{
      rules:[
        { search:'\\.md$', replace:'.html' },
        { search:'\\.markdown', replace:'.md' }
      ]
    }
  }));
  app.get('*.html', loadModule('markdown', options));
  app.get('**', loadModule('static', options));

  app.on('http-request', function(req, res) {
    // console.log([ 'REQUEST('+makeTime(Date.now())+')'+'"'+req.url.pathname+'"', 'N/A', makeTime(res.time) , 'INIT' ].join(' - '));
  });
  app.on('http-access', function(req, res, status, time) {
    console.log([ 'ACCESS('+makeTime(Date.now())+')', '"'+req.url.pathname+'"', status, makeTime(time) ].join(' - '));
  });
  app.on('http-error', function(err, req, res, status, time) {
    console.log('ERROR('+makeTime(Date.now())+')'+[ '"'+req.url.pathname+'"', status, makeTime(time) , err ? err.message : (http.STATUS_CODES[status] || 'N/A') ].join(' - '));
  });
  var server = http.createServer(app.handle);
  server.listen(1234);
}());

function makeTime(milli) {
  var d = new Date(milli);
  return [
    [
      ('00'+d.getUTCHours()).slice(-2),
      ('00'+d.getUTCMinutes()).slice(-2),
      ('00'+d.getUTCSeconds()).slice(-2)
    ].join(':'),
    ('000'+d.getUTCMilliseconds()).slice(-3)
  ].join('.');
}
