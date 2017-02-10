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

// Disable the testharness.js timeout mechanism.
setup({explicit_timeout: true});

function testOperation(feedDataTransfer) {
  DropzonePolyfill.handleDom(document);

  var source = document.querySelector('#source');
  var target = document.querySelector('#target');
  var done = document.querySelector('#done');
  var download = document.querySelector('a[download]');
  var preventNavigation = document.querySelector('#prevent-navigation');
  var dropPromise = new Promise(function(resolve, reject) {
    var gotDrop = false;
    target.ondrop = function(event) {
      event.preventDefault();  // Needed to prevent navigation.
      console.log(event.target);
      console.log(event.target.getAttribute('id'));
      gotDrop = true;
    };
    if (source) {
      source.ondragend = function(event) {
        var effect = event.dataTransfer.dropEffect;
        resolve({ drop: gotDrop, effect: effect });
      };
    }
    if (done) {
      done.onclick = function() {
        resolve({ drop: gotDrop });
      };
    }
  });

  if (source) {
    source.ondragstart = function(event) {
      feedDataTransfer(event.dataTransfer);
    }

    var sourceRect = source.getBoundingClientRect();
    var sourceX = (sourceRect.left + sourceRect.right) / 2;
    var sourceY = (sourceRect.top + sourceRect.bottom) / 2;
  }

  var targetRect = target.getBoundingClientRect();
  var targetX = (targetRect.left + targetRect.right) / 2;
  var targetY = (targetRect.top + targetRect.bottom) / 2;

  if (done) {
    var doneRect = done.getBoundingClientRect();
    var doneX = (doneRect.left + doneRect.right) / 2;
    var doneY = (doneRect.top + doneRect.bottom) / 2;
  }

  if (download) {
    var downloadHref = download.getAttribute('href');
  }

  if (preventNavigation) {
    preventNavigation.ondragover = function(event) {
      event.preventDefault();
    }
    preventNavigation.ondrop = function(event) {
      event.preventDefault();
    }
  }

  if (window.eventSender) {
    if (source) {
      eventSender.mouseMoveTo(sourceX, sourceY);
      eventSender.mouseDown();
    } else {
      eventSender.mouseMoveTo(0, 0);
      eventSender.beginDragWithFiles([downloadHref]);
    }

    setTimeout(function() {
      eventSender.mouseMoveTo(targetX, targetY);
      eventSender.mouseUp();

      if (done) {
        setTimeout(function() {
          eventSender.mouseMoveTo(doneX, doneY);
          eventSender.mouseDown();
          eventSender.mouseUp();
        }, 0);
      }
    }, 100);  // Make sure we pass the drag time threshold.
  }

  return dropPromise;
}
