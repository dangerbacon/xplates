/** XPlates version 0.9.2
  * @license undefined
  * @preserve 
 **/
XPlates = (function()
{
  //Constant regex
  var parseRegex   = /<%([~!@$^*\-=+:.\?]*)[\s\r\n]*([\s\S]*?)[\s\r\n]*%>/g;
  var compileRegex = /<#([~!@$^*\-=+:.\?]*)[\s\r\n]*([\s\S]*?)[\s\r\n]*#>/g;
  var loopmatch = /^(.*?)[\s\r\n]*(:[\s\r\n]*(\w+)?)?[\s\r\n]*(:[\s\r\n]*(\w+)?)?$/;
  var optionmatch = /^(\w+)[\s\r\n]*=(.*)$/;
  var default_outvar = 'out';
  var counter, in_string, varnames, outvar, returnvar, noparse, lang;

  //Template function
  function XPlates()
  {
    if (this instanceof XPlates) return XPlates;
    return define.call(null, null, arguments);
  }

  //Enter and exit string mode
  var sIn  = XPlates.sIn  = function sIn()  { return (in_string  ? '+' : (in_string=true)  && (outvar+'+=')); }
  var sOut = XPlates.sOut = function sOut() { return (!in_string ? ''  : (in_string=false) || (';')); }

  //Add a new variable name
  var sVar = XPlates.sVar = function sVar(arg_name, arg_empty, arg_initialize)
  {
    if (!arg_name)
    {
      if (arg_empty) return null;
      arg_name = '__xp'+(++counter);
    }
    varnames[arg_name] = arg_initialize;
    return arg_name;
  }

  //Escape a string
  var sEscape = XPlates.sEscape = function sEscape(arg_str)
  {
    return (lang.escapeFunc||"")+"("+arg_str+")";
  }

  //Match loop iterator
  function iterparts(arg_content)
  {
    var pieces = arg_content.match(loopmatch);
    if (!pieces) throw new Error("XPlates:  Improper format for array iterator \"" + arg_content + "\"");
    return { l: sVar(), i: sVar(pieces[3]), v: sVar(pieces[5], true), o: pieces[1] };
  }

  //Operations
  var ops = {};
  ops[''] = function(arg_content)
  {
    return sOut() + arg_content + ";";
  }
  ops['='] = function(arg_content)
  {
    return sIn() + sEscape('""+('+arg_content+')');
  }
  ops['=='] = function(arg_content)
  {
    return sIn() + '(""+('+arg_content+'))';
  }
  ops['?'] = function(arg_content)
  {
    if (arg_content) return sOut() + 'if('+arg_content+'){';
    else return sOut() + '};';
  }
  ops['??'] = function(arg_content)
  {
    if (arg_content) return sOut() + '}else if('+arg_content+'){';
    else return sOut() + '} else {';
  }
  ops['~'] = function(arg_content)
  {
    if (!arg_content) { return sOut() + '};'; }
    var i = iterparts(arg_content);
    return sOut()+i.l+'='+i.o+';for('+i.i+'=0;'+i.i+'<'+i.l+'.length;'+i.i+'++){'+(i.v?i.v+'='+i.l+'['+i.i+'];':'');
  }
  ops['~~'] = function(arg_content)
  {
    if (!arg_content) { return sOut() + '};'; }
    var i = iterparts(arg_content);
    return sOut()+i.l+'='+i.o+';for('+i.i+'='+i.l+'.length-1;'+i.i+'>=0;'+i.i+'--){'+(i.v?i.v+'='+i.l+'['+i.i+'];':'');
  }
  ops['+'] = function(arg_content)
  {
    if (!arg_content) { return sOut() + '};'; }
    var i = iterparts(arg_content);
    return sOut()+i.l+'='+i.o+';for('+i.i+' in '+i.l+'){'+(i.v ? i.v+'='+i.l+'['+i.i+'];' : '');
  }
  ops['!'] = function(arg_content)
  {
    var endstr = sOut();
    var pieces = arg_content.match(optionmatch);
    if (!pieces) throw new Error("XPlates:  Improper format for option setting \"" + arg_content + "\"");
    var key = pieces[1];
    try { var value = JSON.parse(pieces[2]); } catch(e) { throw new Error("XPlates:  Invalid JSON for option value \"" + pieces[2] + "\""); }
    switch(key)
    {
      case 'outvar':
        if (typeof value !== 'string' || !value.match(/^\w+$/)) throw new Error("XPlates:  outvar must be a valid variable name! " + arg_content);
        outvar = sVar(value,false,"");
        break;
      case 'returnvar':
        if (typeof value !== 'string' || !value.match(/^\w+$/)) throw new Error("XPlates:  returnvar must be a valid variable name! " + arg_content);
        returnvar = sVar(value,false,"");
        break;
      case 'noparse':
        noparse = !!value;
        break;
      default:
        throw new Error("XPlates:  Unknown option " + key);
    }
    return endstr;
  }

  //Output verbatim
  function verbatim(arg_text)
  {
    return (arg_text.length ? sIn() + JSON.stringify(arg_text) : '')
  }

  //Compile
  function compile(arg_code, arg_argnames, arg_funcname, arg_regex, arg_params)
  {
    //Variable correction
    arg_funcname = arg_funcname || 'xplate';
    arg_argnames = arg_argnames || ['arg'];

    //Restart trackers
    counter = 0;
    varnames = {};
    returnvar = outvar = sVar(arg_params.outvar || default_outvar, false, "");
    noparse = false;
    in_string = false;

    //Create the string
    var jscode = "";
    var index = 0;
    var langops = lang.ops||{};
    var match;
    while (match = arg_regex.exec(arg_code))
    {
      jscode += verbatim(arg_code.substr(index, match.index-index));
      if (noparse && !(match[1] === '!' && /^[\s\r\n]*noparse[\s\r\n]*=/.test(match[2]))) jscode += verbatim(match[0]);
      else
      {
        var op = match[1];
        var opfunc = langops[op]||ops[op];
        if (!opfunc) throw new Error("XPlates:  Undefined operator "+op);
        jscode += opfunc(match[2].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*\/\/.*$/gm, '').trim());
      }
      index = match.index + match[0].length;
    }

    //Wrap it up
    jscode += verbatim(arg_code.substr(index, arg_code.length-index));
    jscode += sOut() + 'return ' + returnvar + '; }';

    //Build the prefix
    var jsprefix = 'return function ' + arg_funcname + '(' + arg_argnames.join(',') + '){var ';
    var varcount = 0;
    for (var k in varnames) jsprefix += (varcount++?',':'') + k + (typeof varnames[k] === 'undefined' ? '' : '='+JSON.stringify(varnames[k]));
    jsprefix += ';';

    //Build the parameters for a new function
    var fargs = [], fcall = [], reqs = lang.reqs||{};
    for (var k in reqs) { fargs.push(k); fcall.push(reqs[k]); }
    fargs.push(jsprefix + jscode);

    //Compile it safely!
    try
    {
      var f = Function.apply(null, fargs).apply(null, fcall);
      return f;
    }
    catch(e)
    {
      e.message = 'XPlates compile error: ' + e.message + '\n' + jsprefix + jscode;
      throw(e);
    }
  }

  //Define
  function define(bundle, args)
  {
    //Arguments array to variables
    var language = args[0], code = args[1], argnames = args[2], name = args[3], params = args[4]||{};

    //Setup language
    if (!XPlates.languages.hasOwnProperty(language)) throw new Error("XPlates: Unknown language "+language);
    lang = XPlates.languages[language];

    //Preprocess?
    if (params.preprocess)
    {
      var pp_keys = [], pp_vals = [];
      for (var k in params.preprocess) { pp_keys.push(k); pp_vals.push(params.preprocess[k]); }
      var pp_func = compile(code, pp_keys, null, compileRegex, params);
      code = pp_func.apply(null, pp_vals);
    }

    //Pre-compilation function?
    if (lang.precompile) code = lang.precompile(code, params);

    //Final function
    var final_func = compile(code, argnames, name, parseRegex, params);

    //If we have a name, add to bundle!
    if (bundle && name)
    {
      bundle[name] = final_func;
      final_func.__xplate_language = language;
    }

    //Return the function we just defined, too.
    return final_func;
  }

  //Convert a bundle to a string
  function bundleToString(arg_name)
  {
    //Start
    var langs = {};
    var prefix = "", suffix = "";
    prefix += 'var ' + (arg_name||'xplates') + '=new (function(){\n';

    //Walk properties
    for (var k in this)
    {
      //Add it
      var f = this[k];
      if (typeof f !== 'function' || typeof f.__xplate_language !== 'string') continue;
      suffix += 'this[' + JSON.stringify(k) + '] = ' + f.toString() + ';\n';

      //New language?
      if (!langs[f.__xplate_language])
      {
        langs[f.__xplate_language] = true;
        var reqs = XPlates.languages[f.__xplate_language].reqs;
        for (var n in reqs)
        {
          var r = reqs[n];
          prefix += 'var ' + n + ' = ' + (typeof r == 'function' ? r.toString() : JSON.stringify(r)) + ';\n';
        }
      }
    }

    //Finish up
    suffix += '})();\n';
    return prefix+suffix;
  }

  //Bundle object
  XPlates.bundle = function()
  {
    var f = function XPlateBundle() { return define.call(null, f, arguments); }
    Object.defineProperty(f, 'toString', { value: bundleToString });
    return f;
  }

  //Languages definition
  XPlates.languages = {};

  //Return the constructor
  return XPlates;
})();

//HTML Language
(function()
{
  //Whitespace stripping
  var regex_tags       = /(<(\/?)([\w\-]+)([^<]+|<%.*?%>)*?>)|([^<]+)|(<%.*?%>)/g;
  //parethesis            1 2    3        4                   5       6

  var regex_end        = /[\s\r\n]+>$/;

  var regex_attr       = /([\s\r\n]+)(([\w-]+)(=(")((<%.*?%>|[^"])*)(\5))?)/g;
  //parenthesis           1          23       4 5  67               8

  var regex_attr_space = /[\s\r\n]+(<%.*?%>)/g
  //parenthesis                    1

  //Whitespace-strip an attribute
  function html_attr_strip(whole, space, nameeqval, name, eqval, quote, val)
  {
    return ' ' + name + '=' + quote + val.trim().replace(regex_attr_space, ' $1') + quote;
  }

  //Whitespace-strip an HTML segment
  function html_strip(html, params)
  {
    //Param check
    if (!params.strip) return html;

    //Variables
    var s = '';
    var match;
    var tag_stack = [];
    var nostrip = {'script':true,'pre':true};
    var tagpop;
    var offset = 0;
    while (match = regex_tags.exec(html))
    {
      //Missed anything?
      if (match.index > offset) s += html.substr(offset, match.index-offset);
      offset = match.index + match[0].length;

      //Tag
      if (match[1])
      {
        s += match[1].replace(regex_attr, html_attr_strip).replace(regex_end,'>');
        var tagname = match[3].toLowerCase();
        if (tagname in nostrip)
        {
          if (match[2]) { while ((tagpop = tag_stack.pop()) && tagpop !== tagname) { }; }
          else tag_stack.push(tagname);
        }
      }
      //Text text
      else if (match[5]) s += (tag_stack.length ? match[5] : match[5].trim().replace(/\s*[\r\n][\r\n\s]*/g,'\n').replace(/\s+/g,' '));
      //Template language
      else if (match[6]) s += match[6];
    }
    if (html.length > offset) s += html.substr(offset, html.length-offset);
    return s;
  }

  //Plain Text is built in and requires nothing!
  XPlates.languages.text = {};

  //HTML
  var __xphtmlchars   = {'&':'&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'};
  function __xphtmlreplace(c) { return __xphtmlchars[c]; }
  function __xphtmlescape(s) { return s.replace(/[&<>"']/g, __xphtmlreplace); }
  XPlates.languages.html = {
    escapeFunc: '__xphtmlescape',
    reqs: {
      __xphtmlchars:   __xphtmlchars,
      __xphtmlescape:  __xphtmlescape,
      __xphtmlreplace: __xphtmlreplace
    },
    precompile: html_strip
  };

  //Markdown Language
  var __xpmdchars   = {'&':'&amp;', '<': '&lt;'};
  function __xpmdreplace(c) { return __xpmdchars[c]; }
  function __xpmdescape(s) { return s.replace(/[&<]/g, __xpmdreplace); }
  XPlates.languages.md = {
    escapeFunc: '__xpmdescape',
    reqs: {
      __xpmdchars:   __xpmdchars,
      __xpmdescape:  __xpmdescape,
      __xpmdreplace: __xpmdreplace
    }
  };

  //URL Language
  XPlates.languages.url = {
    escapeFunc: 'encodeURIComponent',
  }

})();


//Node.js export
if (typeof module === 'object' && typeof module.exports === 'object') module.exports = XPlates;