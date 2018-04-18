const fs = require('fs');
const path = require('path');

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

let quillFilePath = require.resolve('quill');
let quillMinFilePath = quillFilePath.replace('quill.js', 'quill.min.js');

let quillLibrary = fs.readFileSync(quillMinFilePath);
let selectPolyfill = fs.readFileSync(path.join(__dirname, 'selection.js'));
let mutationObserverPolyfill = fs.readFileSync(path.join(__dirname, 'polyfill.js'));

const JSDOM_TEMPLATE = `
  <div id="editor">hello</div>
  <script>${selectPolyfill}</script>
  <script>${mutationObserverPolyfill}</script>
  <script>${quillLibrary}</script>
  <script>
    document.getSelection = function() {
      return {
        getRangeAt: function() { }
      };
    };
    document.execCommand = function (command, showUI, value) {
      try {
          return document.execCommand(command, showUI, value);
      } catch(e) {}
      return false;
    };
  </script>
`;
const JSDOM_OPTIONS = { runScripts: 'dangerously', resources: 'usable' };

const DOM = new JSDOM(JSDOM_TEMPLATE, JSDOM_OPTIONS);
const WINDOW = DOM.window;
const DOCUMENT = WINDOW.document;

const QUILL = new DOM.window.Quill('#editor');

exports.convertTextToDelta = (text) => {
  QUILL.setText(text);

  let delta = QUILL.getContents();
  return delta;
};

exports.convertHtmlToDelta = (html) => {
  QUILL.clipboard.dangerouslyPasteHTML(html, 'api');

  let delta = QUILL.getContents();
  return delta;
};

exports.convertDeltaToHtml = (delta) => {
  QUILL.setContents(delta);

  let html = DOCUMENT.querySelector('.ql-editor').innerHTML;
  return html;
};