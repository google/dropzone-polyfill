# Polyfill for the removed HTML5 dropzone attribute

This is not an official Google product.

This is a polyfill intended to help sites impacted by
[the removal of webkitdropzone from Chromium](https://www.chromestatus.com/features/5718005866561536).

## Usage

If your Web application's drag-and-drop functionality works in Firefox, Edge,
or any other browser that is not based on Blink or WebKit, stop reading now.
You do not need this polyfill.

If you're still here, the quickest way to get your site working again is to
download [lib/dropzone-polyfill.js](lib/dropzone-polyfill.js) and include it in
your site's JavaScript bundler, then call `DropzonePolyfill.handleDom()` after
your DOM is ready. For example,

```javascript
window.addEventListener('load', function() {
  DropzonePolyfill.handleDom();
}, false);
```

In the long run, you should switch to the
[imperative API for handling drops](https://developer.mozilla.org/docs/Web/API/HTML_Drag_and_Drop_API#Define_a_drop_zone).
This polyfill is way more complex than the code you'll have to write for your
own application, due to the need of handling the entire `dropzone` syntax.

The code needed to replace `webkitdropzone` can be as simple as:

## Limitations

In Safari and Firefox, the polyfill is not able to obtain the MIME type of
dragged files at the time needed to implement the filters expressed by `file:`
tokens in the `dropzone` attribute. The polyfill errs on the side of false
positives, by having any dragged file match against any `file:` token.

For example, if a Safari user drags a HTML file over an element with a
`dragzone` attribute set to `file:text/plain`, the polyfill will decide that the
dragged file matches the `dragzone` conditions. However, the polyfill will not
match non-file drags to the `dragzone` value above.

On the other hand, it is worth noting that `dropzone` / `webkitdropzone` were
never implemented in Firefox so, if your application relies on these attributes,
it is already broken in Firefox. Along the same lines, the `webkitdropzone` in
Chrome was unable to match `file:` tokens against dragged files, until M57.

In conclusion, if you wish to accept file drags in a portable manner, you need
to use the
[imperative API for handling drops](https://developer.mozilla.org/docs/Web/API/HTML_Drag_and_Drop_API#Define_a_drop_zone).
