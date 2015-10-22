function clearOutput() {
  var o = document.getElementById('output');
  o.innerHTML = '';
}

function getCode(editors) {
  var js = editors[0].getValue();
  var html = editors[1].getValue();
  var css = editors[2].getValue();

  return {
    js: js,
    html: html,
    css: css
  };
}

function injectPreview(element, html, js, css) {
  var result = [
    '<html>',
    '<head>',
    '<style>',
    css,
    '</style>',
    '</head>',
    '<body>',
    html,
    '<script type="text/javascript">',
    js,
    '</script>',
    '</body>',
    '</html>'
  ].join('');
  var iframe = document.getElementById(element);
  var doc;

  if (iframe.contentDocument) {
    doc = iframe.contentDocument;
  } else if (iframe.contentWindow) {
    doc = iframe.contentWindow.document;
  } else {
    doc = iframe.document;
  }

  doc.open();
  doc.writeln(result);
  doc.close();
}

function createSandbox(code, that, locals) {
  var params = []; // the names of local variables
  var args = []; // the local variables

  for (var param in locals) {
    if (locals.hasOwnProperty(param)) {
      args.push(locals[param]);
      params.push(param);
    }
  }

  var context = Array.prototype.concat.call(that, params, code); // create the parameter list for the sandbox
  var sandbox = new (Function.prototype.bind.apply(Function, context)); // create the sandbox function
  context = Array.prototype.concat.call(that, args); // create the argument list for the sandbox

  return Function.prototype.bind.apply(sandbox, context); // bind the local variables to the sandbox
}

function run() {
  // get the user code
  // var code = editors[0].getValue();
  // var html = editors[1].getValue();
  // var style = editors[2].getValue();

  // TODO: decoupling from editors
  var code = getCode(editors);

  // console.log('html:', html);

  if (code.html !== '') {
    injectPreview('preview', code.html, code.js, code.css);
    return;
  }

  // create our own local versions of window and document with limited functionality
  var locals = {
    window: {
    },
    console: {
      log: function(str) {
        var o = document.getElementById('output');
        o.innerHTML += str + '<br />';
        // console.log(str);
      }
    },
    document: {
    }
  };

  var that = Object.create(null); // create our own this object for the user code
  var sandbox = createSandbox(code.js, that, locals); // create a sandbox

  try {
    sandbox(); // call the user code in the sandbox
  } catch(err) {
    // show error in the fake console
    locals.console.log(err.message);
  }
}

function tabOpened(tab) {
  // TODO: decoupling from editors
  editors[tab.index].focus();
}

function save() {
  if (typeof (localStorage) === 'undefined') {
    alert('This feature is disabled on old browsers');
    return;
  }
  // var code = editors[0].getValue();
  // var html = editors[1].getValue();
  // var style = editors[2].getValue();

  var code = getCode(editors);

  // var savedDoc = {
  //   js: code,
  //   html: html,
  //   css: style
  // };

  localStorage.setItem('project', JSON.stringify(code));
}

function getSavedDoc(name) {
  var retrievedDoc = false;
  // TODO: implement names for projects
  name = name || 'project';
  if (localStorage[name]) {
    retrievedDoc = localStorage.getItem(name);
    retrievedDoc = JSON.parse(retrievedDoc);
  }
  return retrievedDoc;
}

// main code
// TODO: move to another file
riot.mount('*');

var editors = [];

function initEditor(id, mode, theme) {
  var editor = ace.edit(id);
  var usedTheme = theme || 'ace/theme/monokai';
  editor.setTheme(usedTheme);
  editor.getSession().setMode('ace/mode/' + mode);
  return editor;
}

editors[0] = initEditor('js-editor', 'javascript');
editors[1] = initEditor('html-editor', 'html');
editors[2] = initEditor('css-editor', 'css');

// populate the editors with the stored code
var userCode = getSavedDoc();
if (userCode) {
  editors[0].setValue(userCode.js);
  editors[1].setValue(userCode.html);
  editors[2].setValue(userCode.css);
}

// var jsEditor = ace.edit('js-editor');
// jsEditor.setTheme('ace/theme/monokai');
// jsEditor.getSession().setMode('ace/mode/javascript');

// var htmlEditor = ace.edit('html-editor');
// htmlEditor.setTheme('ace/theme/monokai');
// htmlEditor.getSession().setMode('ace/mode/html');

// var cssEditor = ace.edit('css-editor');
// cssEditor.setTheme('ace/theme/monokai');
// cssEditor.getSession().setMode('ace/mode/css');
