'use strict';

var rest = require('rest');
var bindCallback = require('when/node/function').bindCallback;

var errorCodeInterceptor = require('rest/interceptor/errorCode');
var pathPrefixInterceptor = require('rest/interceptor/pathPrefix');
var entityInterceptor = require('rest/interceptor/entity');



function Plugin(messenger, options){
  this.messenger = messenger;
  this.options = options;

  var prefix = options.baseUrl;
  console.log(options, prefix);
  this.restCall = rest
  .chain(pathPrefixInterceptor, {
    prefix: prefix
  })
  .chain(entityInterceptor)
  .chain(errorCodeInterceptor);

  return this;
}

var optionsSchema = {
  type: 'object',
  properties: {
    baseUrl: {
      type: 'string',
      required: true
    }
  }
};

var messageSchema = {
  type: 'object',
  properties: {
    method: {
      type: 'string'
    },
    path: {
      type: 'string'
    },
    entity: {
      type: 'object'
    }
  }
};

Plugin.prototype.onMessage = function(data, cb){
  var payload = data.payload || data.message || {};
  var result = this.restCall({
      path: payload.path,
      method: payload.method || 'GET',
      entity: payload.entity
  });
  return bindCallback(result, cb);
};

Plugin.prototype.destroy = function(){
  //clean up
  console.log('destroying.', this.options);
};


module.exports = {
  Plugin: Plugin,
  optionsSchema: optionsSchema,
  messageSchema: messageSchema
};
