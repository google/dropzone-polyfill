/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
'use strict';
(function(){

var polyfill = {};

window.DropzonePolyfill = polyfill;

// Parses the value in a dropzone attribute.
//
// Returns an object with the following properties:
// * operation is a string that should be assigned to dataTransfer's dropEffect,
//   or null if the attribue doesn't include an operation
// * types in an object with properties "file" and "string"
//   * types.file is an object whose properties are the MIME types in the tokens
//     of kind "file"
//   * types.string is an object whose properties are the MIME types in the
//     tokens of kind "string"
//  * hasFileTypes is true if the dropzone contains at least one file: token
//
// Specification URL:
// https://html.spec.whatwg.org/multipage/interaction.html#the-dropzone-attribute
polyfill.parseAttribute = function(dropzoneString) {
  var fileTypes = {};
  var stringTypes = {};
  var effect = null;
  var hasFileTypes = false;

  var tokens = dropzoneString.split(/\s+/);
  for (let i = 0; i < tokens.length; ++i) {
    var token = tokens[i];
    if (token === 'copy' || token === 'move' || token === 'link') {
      effect = effect || token;
      continue;
    }

    var colonIndex = token.indexOf(':');
    if (colonIndex === -1)
      continue;

    var kind = token.substring(0, colonIndex);
    var type = token.substring(colonIndex + 1);
    if (kind === 'file') {
      fileTypes[type] = true;
      hasFileTypes = true;
    } else if (kind === 'string') {
      stringTypes[type] = true;
    }
  }

  return {
    effect: effect, types: { file: fileTypes, string: stringTypes },
    hasFileTypes: hasFileTypes
  };
}

// Checks if a DataTransfer's data matches the pattern in a dropzone attribute.
//
// Returns the match data produced by parseAttribute if the data inside the
// DataTransfer matches the pattern specified by the datazone attribute.
// Otherwise, returns null.
//
// Specification URL:
// https://html.spec.whatwg.org/multipage/interaction.html#the-dropzone-attribute
polyfill.matchData = function(dropzoneString, dataTransfer) {
  var match = polyfill.parseAttribute(dropzoneString);

  if (dataTransfer.items) {
    // Chrome, Firefox, Edge support the items collection.
    var items = dataTransfer.items;
    for (var i = 0; i < items.length; ++i) {
      var item = items[i];
      var matchTypes = match.types[item.kind];
      if (matchTypes && matchTypes[item.type])
        return match;

      // Firefox uses application/x-moz-file for all file types. It also returns
      // an empty "files" collection.
      //
      // We have to choose between false positives (all file match any file:
      // token) seem better and false negatives (file: tokens never match).
      // This polyfill chooses the former.
      if (item.type === 'application/x-moz-file' && match.hasFileTypes)
        return match;
    }

    return null;
  }

  // Safari doesn't support the items collection.
  var stringMatches = match.types.string;
  var stringTypes = dataTransfer.types;
  var hasFiles = false;
  for (var i = 0; i < stringTypes.length; ++i) {
    var type = stringTypes[i];
    if (type.indexOf('/') === -1) {
      // Skip legacy types like "text" and "Files".
      if (type === 'Files')
        hasFiles = true;
      continue;
    }
    if (stringMatches[type])
      return match;
  }

  // This block doesn't actually work, because Safari returns an empty "files"
  // collection. Leaving it in, in case Safari fixes their problem.
  var files = dataTransfer.files;
  var fileTypes = match.types.file;
  for (var i = 0; i < files.length; ++i) {
    if (fileTypes[files[i].type])
      return match;
  }

  if (hasFiles && files.length === 0 && match.hasFileTypes) {
    // We have to choose between false positives (all file match any file:
    // token) seem better and false negatives (file: tokens never match).
    // This polyfill chooses the former.
    return match;
  }

  return null;
}

// Possible names for the dropzone attribute.
//
// Only Blink and WebKit shipped a prefixed attribute.
var dropzoneAttributeNames = ['dropzone', 'webkitdropzone'];

// Extracts the dropzone attribute value from a DOM element.
//
// Returns the (string) value of the attribute, or null if the element does not
// contain an attribute.
polyfill.dropzoneString = function(element) {
  for (var i = 0; i < dropzoneAttributeNames.length; ++i) {
    var name = dropzoneAttributeNames[i];
    if (element.hasAttribute(name))
      return element.getAttribute(name);
  }
  return null;
}

// dragenter event handler that polyfills the dropzone behavior.
//
// Specification URL:
// https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
// https://html.spec.whatwg.org/multipage/interaction.html#the-datatransfer-interface
polyfill.onDragEnter = function(element, event) {
  var dropzoneString = polyfill.dropzoneString(element);
  if (!dropzoneString)
    return;

  var dataTransfer = event.dataTransfer;
  if (polyfill.matchData(dropzoneString, dataTransfer)) {
    event.preventDefault();
    event.stopPropagation();
  }
}

// dragover event handler that polyfills the dropzone behavior.
//
// Specification URL:
// https://html.spec.whatwg.org/multipage/interaction.html#drag-and-drop-processing-model
// https://html.spec.whatwg.org/multipage/interaction.html#the-datatransfer-interface
polyfill.onDragOver = function(element, event) {
  var dropzoneString = polyfill.dropzoneString(element);
  if (!dropzoneString)
    return;

  var dataTransfer = event.dataTransfer;
  var matchData = polyfill.matchData(dropzoneString, dataTransfer);
  if (matchData) {
    dataTransfer.dropEffect = matchData.effect || 'copy';
    event.preventDefault();
    event.stopPropagation();
  }
}

// Polyfills the dropzone attribute for a DOM element.
//
// This function is idempotent. Idempotency is achieved by setting a
// data-dropzone-polyfilled attribute on elements that the function acts on.
polyfill.handleElement = function(element) {
  if (!polyfill.dropzoneString(element) ||
      element.hasAttribute('data-dropzone-polyfilled')) {
    return;
  }

  element.setAttribute('data-dropzone-polyfilled', '1');
  element.addEventListener('dragenter', function(event) {
    polyfill.onDragEnter(element, event);
  }, false);
  element.addEventListener('dragover', function(event) {
    polyfill.onDragOver(element, event);
  }, false);
}

// Sets up the polyfill for all the elements in the given DOM tree.
//
// Pass in document to apply the polyfill to the entire document.
polyfill.handleDom = function(domRoot) {
  for (var i = 0; i < dropzoneAttributeNames.length; ++i) {
    var name = dropzoneAttributeNames[i];
    var elements = domRoot.querySelectorAll('[' + name + ']');
    for (var j = 0; j < elements.length; ++j)
      polyfill.handleElement(elements[j]);
  }
}

})();
