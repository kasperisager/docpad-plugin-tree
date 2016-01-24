'use strict';

var _ = require('underscore');
_.str = require('underscore.string');

_.mixin(_.str.exports());

function Tree (collection, includeRoot) {
  // Unsorted tree of documents
  var documents = this.documents = {};

  // Target trailing slashes and index.* in URLs. This regex is applied
  // whenever a URL is handled internally and should never be used to
  // manipulate URLs defined in DocPad core.
  var urlRegex = this.urlRegex = /^\/|\/$|index\.\w*$/g;

  var addChild = function (doc, parts, parent, index) {
    var part = parts[index];

    // Intialize the new context if it doesn't exist
    var current = parent[part] = parent[part] || { children: {} };

    // If this is the current document context, add the document meta
    if ((parts.length - 1) === index) {
      current.title  = doc.menu || doc.title;
      current.url    = doc.url;
      current.order  = doc.order || 0;
      current.hidden = doc.hidden || false;
    }
    // Otherwise, assume that this page has children
    else {
      addChild(doc, parts, current.children, index + 1);
    }
  };

  collection.forEach(function (doc) {
    // Split the document URL into an array
    var parts = _.compact(doc.url.replace(urlRegex, '').split('/'));

    if (includeRoot) {
      parts.unshift('/');
    }

    if (parts.length) {
      addChild(doc, parts, documents, 0);
    }
  });
}

Tree.prototype.toJSON = function (context) {
  var output    = []
    , documents = this.documents
    , urlRegex  = this.urlRegex;

  var addDocument = function (parent, current) {
    if (current.hidden) {
      return;
    }

    // Push the current doc onto the parent
    parent.push(current);

    // Mark documents in the current navigation path as active
    if (context) {
      var contextUrl = context.url.replace(urlRegex, '')
        , currentUrl = current.url.replace(urlRegex, '');

      // Is this page part of the currently active path?
      current.active = _.startsWith(contextUrl, currentUrl);

      // Is this page the currently selected page?
      current.current = contextUrl === currentUrl;
    }

    // Grab all child documents of the current document and sort them
    var children = _.sortBy(current.children, function (doc) {
      return parseFloat(doc.order);
    });

    if (_.isEmpty(children)) {
      return delete current.children;
    }

    // Re-initialize document children as array
    current.children = [];

    Object.keys(children).forEach(function (child) {
      addDocument(current.children, children[child]);
    });
  };

  // Sort all 'first-level' documents
  documents = _.sortBy(documents, function (doc) {
    return parseFloat(doc.order);
  });

  Object.keys(documents).forEach(function (child) {
    addDocument(output, documents[child]);
  });

  return output;
};

module.exports = function (BasePlugin) {
  return BasePlugin.extend({
    name: 'tree',
    extendTemplateData: function (options) {
      var docpad       = this.docpad
        , templateData = options.templateData;

      templateData.tree = function (collection, context, includeRoot) {
        if (collection === null) {
          collection = 'documents';
        }

        // Get all documents from the collection
        collection = docpad.getCollection(collection);

        // Construct the menu tree
        var tree = new Tree(collection.toJSON(), includeRoot);

        return tree.toJSON(context);
      };
    }
  });
};
