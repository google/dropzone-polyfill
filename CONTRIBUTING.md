# How to contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement. You (or your employer) retain the copyright to your contribution,
this simply gives us permission to use and redistribute your contributions as
part of the project. Head over to <https://cla.developers.google.com/> to see
your current agreements on file or to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult [GitHub Help] for more
information on using pull requests.

[GitHub Help]: https://help.github.com/articles/about-pull-requests/

## Running the tests

The tests can be ran automatically on Chrome, but that requires a
[Chromium checkout](https://www.chromium.org/developers/how-tos/get-the-code).
Clone the repository inside the checkout and run the tests as shown below.

```bash
# Clone the repository under LayoutTests.
cd src/third_party/LayoutTests
git clone https://github.com/google/dropzone-polyfill
cd ../../..

# Run the tests from the Chromium checkout root.
third_party/WebKit/Tools/Scripts/run-webkit-tests -t Default --no-retry dropzone-polyfill/test/*
```

Alternatively, the tests can be run manually using
[web-platform-tests](https://github.com/w3c/web-platform-tests). Clone the
repository inside the checkout and open the files in `test/` inside your
browser.

```bash
# Clone the repository inside the web-platform-tests checkout.
cd web-platform-tests
git clone https://github.com/google/dropzone-polyfill

# Start the HTTP server.
./serve

# Open the directory with tests in the browser.
xdg-open http://localhost:8000/dropzone-polyfill/test/
```
