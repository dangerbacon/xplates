
var XPlates = require('../lib/xplates.js');



var assert = require('chai').assert;

describe('HTML Template Generation', function()
{
  describe('Basics', function()
  {
    it('Exported an function', function()
    {
      assert.equal(typeof XPlates, 'function');
    });
    it('Compiles functions', function()
    {
      assert.equal(typeof XPlates('html', '<div>hello</div>'), 'function');
    });
    it('Works with "new XPlates()"', function()
    {
      var xp = new XPlates();
      assert.equal(typeof xp('html', '<div>hello</div>'), 'function');
    });
    it('Leaves alone simple code', function()
    {
      assert.equal(XPlates('html', '<div>hello</div>')(), '<div>hello</div>');
    });
    it('Processes directives at the beginning', function()
    {
      assert.equal(XPlates('html', '<%== arg %><div></div>')(123), '123<div></div>');
    });
    it('Processes directives at the end', function()
    {
      assert.equal(XPlates('html', '<div></div><%== arg %>')(123), '<div></div>123');
    });
    it('Processes directives in the middle', function()
    {
      assert.equal(XPlates('html', '<div><%== arg %></div>')(123), '<div>123</div>');
    });
    it('Works with argument names', function()
    {
      assert.equal(XPlates('html', '<div><%== x %></div>',['x'])(123), '<div>123</div>');
    });
    it('Works with /**/ comments', function()
    {
      assert.equal(XPlates('html', '<div><%== x /* Test comment */ %></div>',['x'])(123), '<div>123</div>');
      assert.equal(XPlates('html', '<div><%== x /* Test \n comment */ %></div>',['x'])(123), '<div>123</div>');
      assert.equal(XPlates('html', '<div><%== x /* Test comment */ %></div>',['x'])(123), '<div>123</div>');
      assert.equal(XPlates('html', '<div><% var x = 1; /* Test comment */ %></div>',['x'])(123), '<div></div>');
      assert.equal(XPlates('html', '<div><% var x = 1; /* Test \n\n comment */ %></div>',['x'])(123), '<div></div>');
    });
    it('Works with // comments', function()
    {
      assert.equal(XPlates('html', '<div><%== x //comment %></div>',['x'])(123), '<div>123</div>');
      assert.equal(XPlates('html', '<div><%== //comment \n x %></div>',['x'])(123), '<div>123</div>');
      assert.equal(XPlates('html', '<div><%== x //comment+1 %></div>',['x'])(123), '<div>123</div>');
      assert.equal(XPlates('html', '<div><%== x //comment\n+1 %></div>',['x'])(123), '<div>124</div>');
      assert.equal(XPlates('html', '<div><%== x //comment\n+1//more comment %></div>',['x'])(123), '<div>124</div>');
    });
  });
  describe('Operations', function()
  {
    it('Works code injection', function()
    {
      assert.equal(XPlates('html', '<% var a = 123; %><div><%= a %></div>')(), '<div>123</div>');
      assert.equal(XPlates('html', '<% var a = 123 %><div><%= a %></div>')(), '<div>123</div>');
      assert.equal(XPlates('html', '<div><% out += "Hello!" %></div>')(), '<div>Hello!</div>');
    });
    it('Works with "=" operator and escapes', function()
    {
      assert.equal(XPlates('html', '<div><%= arg %></div>')('a<b'), '<div>a&lt;b</div>');
      assert.equal(XPlates('html', '<div><%= arg %></div>')('a>b'), '<div>a&gt;b</div>');
      assert.equal(XPlates('html', '<div><%= arg %></div>')('a&b'), '<div>a&amp;b</div>');
      assert.equal(XPlates('html', '<div><%= arg %></div>')('a"b'), '<div>a&quot;b</div>');
      assert.equal(XPlates('html', '<div><%= arg %></div>')("a'b"), '<div>a&apos;b</div>');
      assert.equal(XPlates('html', '<div><%= arg; %></div>')("a'b"), '<div>a&apos;b</div>');
      assert.equal(XPlates('html', '<div><%= arg ; ; %></div>')("a'b"), '<div>a&apos;b</div>');
      assert.equal(XPlates('html', '<div><%= arg %></div>')('a"<>&<>"b'), '<div>a&quot;&lt;&gt;&amp;&lt;&gt;&quot;b</div>');
    });
    it('Works with "==" operator and no escapes', function()
    {
      assert.equal(XPlates('html', '<div><%== arg %></div>')('a<b'), '<div>a<b</div>');
      assert.equal(XPlates('html', '<div><%== arg %></div>')('a>b'), '<div>a>b</div>');
      assert.equal(XPlates('html', '<div><%== arg %></div>')('a&b'), '<div>a&b</div>');
      assert.equal(XPlates('html', '<div><%== arg %></div>')('a"b'), '<div>a"b</div>');
      assert.equal(XPlates('html', '<div><%== arg %></div>')('a"<>&<>"b'), '<div>a"<>&<>"b</div>');
      assert.equal(XPlates('html', '<div><%== arg;%></div>')('a"<>&<>"b'), '<div>a"<>&<>"b</div>');
      assert.equal(XPlates('html', '<div><%== arg ; ; %></div>')('a"<>&<>"b'), '<div>a"<>&<>"b</div>');
      assert.equal(XPlates('html', '<div><%== arg //comment %></div>')('a<b'), '<div>a<b</div>');
    });
    it('Works with "?" operator', function()
    {
      assert.equal(XPlates('html', '<div><%? true %>a<%?%></div>')(), '<div>a</div>');
      assert.equal(XPlates('html', '<div><%? true %>a<%?    %></div>')(), '<div>a</div>');
      assert.equal(XPlates('html', '<div><%? false %>a<%?%></div>')(), '<div></div>');
      assert.equal(XPlates('html', '<div><%? false %>a<%?    %></div>')(), '<div></div>');
      assert.equal(XPlates('html', '<div><%? false //comment %>a<%?    %></div>')(), '<div></div>');
    });
    it('Works with "??" operator', function()
    {
      assert.equal(XPlates('html', '<div><%? true %>a<%??%>b<%?%></div>')(), '<div>a</div>');
      assert.equal(XPlates('html', '<div><%? true %>a<%??    %>b<%?%></div>')(), '<div>a</div>');
      assert.equal(XPlates('html', '<div><%? false %>a<%??%>b<%?%></div>')(), '<div>b</div>');
      assert.equal(XPlates('html', '<div><%? false %>a<%??    %>b<%?%></div>')(), '<div>b</div>');

      assert.equal(XPlates('html', '<div><%? true %>a<%?? true %>b<%??%>c<%?%></div>')(), '<div>a</div>');
      assert.equal(XPlates('html', '<div><%? false %>a<%?? true %>b<%??%>c<%?%></div>')(), '<div>b</div>');
      assert.equal(XPlates('html', '<div><%? false %>a<%?? false %>b<%??%>c<%?%></div>')(), '<div>c</div>');

      assert.equal(XPlates('html', '<div><%? true %>a<%?? //comment%>b<%?%></div>')(), '<div>a</div>');
    });
    it('Works with "~" operator', function()
    {
      var t = ['a','b','c'];
      assert.equal(XPlates('html', '<%~ arg : i : v %><i><%== i %><%== v %></i><%~%>')(t), '<i>0a</i><i>1b</i><i>2c</i>');
      assert.equal(XPlates('html', '<%~ arg :   : v %><i><%== v %></i><%~%>')(t), '<i>a</i><i>b</i><i>c</i>');
      assert.equal(XPlates('html', '<%~ arg : i :   %><i><%== i %></i><%~%>')(t), '<i>0</i><i>1</i><i>2</i>');
      assert.equal(XPlates('html', '<%~ arg : i     %><i><%== i %></i><%~%>')(t), '<i>0</i><i>1</i><i>2</i>');
      assert.equal(XPlates('html', '<%~ arg :   :   %><i>!</i><%~%>')(t), '<i>!</i><i>!</i><i>!</i>');
      assert.equal(XPlates('html', '<%~ arg :       %><i>!</i><%~%>')(t), '<i>!</i><i>!</i><i>!</i>');
      assert.equal(XPlates('html', '<%~ arg         %><i>!</i><%~%>')(t), '<i>!</i><i>!</i><i>!</i>');

      assert.equal(XPlates('html', '<%~ arg //comment : i : v %><i>!</i><%~ //comment%>')(t), '<i>!</i><i>!</i><i>!</i>');
    });
    it('Works with "~~" operator', function()
    {
      var t = ['a','b','c'];
      assert.equal(XPlates('html', '<%~~ arg : i : v %><i><%== i %><%== v %></i><%~~%>')(t), '<i>2c</i><i>1b</i><i>0a</i>');
      assert.equal(XPlates('html', '<%~~ arg :   : v %><i><%== v %></i><%~~%>')(t), '<i>c</i><i>b</i><i>a</i>');
      assert.equal(XPlates('html', '<%~~ arg : i :   %><i><%== i %></i><%~~%>')(t), '<i>2</i><i>1</i><i>0</i>');
      assert.equal(XPlates('html', '<%~~ arg : i     %><i><%== i %></i><%~~%>')(t), '<i>2</i><i>1</i><i>0</i>');
      assert.equal(XPlates('html', '<%~~ arg :   :   %><i>!</i><%~~%>')(t), '<i>!</i><i>!</i><i>!</i>');
      assert.equal(XPlates('html', '<%~~ arg :       %><i>!</i><%~~%>')(t), '<i>!</i><i>!</i><i>!</i>');
      assert.equal(XPlates('html', '<%~~ arg         %><i>!</i><%~~%>')(t), '<i>!</i><i>!</i><i>!</i>');
      
      assert.equal(XPlates('html', '<%~~ arg //comment %><i>!</i><%~~%>')(t), '<i>!</i><i>!</i><i>!</i>');
    });
    it('Works with "+" operator', function()
    {
      var t = { a: 0, b: 1, c: 2 }
      assert.equal(XPlates('html', '<%+ arg : i : v %><i><%== i %><%== v %></i><%+%>')(t), '<i>a0</i><i>b1</i><i>c2</i>');
      assert.equal(XPlates('html', '<%+ arg :   : v %><i><%== v %></i><%+%>')(t), '<i>0</i><i>1</i><i>2</i>');
      assert.equal(XPlates('html', '<%+ arg : i :   %><i><%== i %></i><%+%>')(t), '<i>a</i><i>b</i><i>c</i>');
      assert.equal(XPlates('html', '<%+ arg : i     %><i><%== i %></i><%+%>')(t), '<i>a</i><i>b</i><i>c</i>');
      assert.equal(XPlates('html', '<%+ arg :   :   %><i>!</i><%+%>')(t), '<i>!</i><i>!</i><i>!</i>');
      assert.equal(XPlates('html', '<%+ arg :       %><i>!</i><%+%>')(t), '<i>!</i><i>!</i><i>!</i>');
      assert.equal(XPlates('html', '<%+ arg         %><i>!</i><%+%>')(t), '<i>!</i><i>!</i><i>!</i>');
      assert.equal(XPlates('html', '<%+ arg //comment %><i>!</i><%+%>')(t), '<i>!</i><i>!</i><i>!</i>');
    });
    it('Works with "@" operator', function()
    {
      assert.equal(XPlates('html', '<%@ x %><%= n*n %><%@%><%== x %> <%== x %>',['n'])(2), '4 4');
      assert.equal(XPlates('html', '<%@ x %><%= n*n %><%@%><%== x %> <%@ x %><%= n*n*n %><%@%><%== x %>',['n'])(2), '4 8');      
      assert.equal(XPlates('html', '<%@ x %><%@ y %>!<%@%><%== y %><%== y %><%@%><%== x %><%== x %>',[])(), '!!!!');      
      assert.equal(XPlates('html', 'A<%@ x %><%= n*n %><%@%>B<%== x %> <%== x %>C',['n'])(2), 'AB4 4C');
      assert.equal(XPlates('html', '<% n*= 2 %><%@ x %><%= n*n %><%@%><%== x %> <%== x %>',['n'])(2), '16 16');
      assert.throws(() => { XPlates('html', '<%@ x 4 %><%= n*n %><%@%><%== x %> <%== x %>',['n'])(2) });      
      assert.throws(() => { XPlates('html', '<%@ x %><%= n*n %>',['n'])(2) });      
      assert.throws(() => { XPlates('html', '<%@ x %><%= n*n %><%@%><%@%>',['n'])(2) });      
    });
  });

  describe('Options', function()
  {
    it('Works with "!" noparse change', function()
    {
      assert.equal(XPlates('html', '<div><%== 1+1 %></div>')(), '<div>2</div>');
      assert.equal(XPlates('html', '<%! noparse=true %><div><%== 1+1 %></div>')(), '<div><%== 1+1 %></div>');
      assert.equal(XPlates('html', '<%! noparse=true %><div><%== 1+1 %></div><%! noparse=false %><%= 1+1 %>')(), '<div><%== 1+1 %></div>2');
      assert.equal(XPlates('html', '<%! noparse = 1 %><div><%== 1+1 %></div>')(), '<div><%== 1+1 %></div>');
      assert.equal(XPlates('html', '<%! noparse=false %><div><%== 1+1 %></div>')(), '<div>2</div>');      
      assert.equal(XPlates('html', '<%! noparse =   null %><div><%== 1+1 %></div>')(), '<div>2</div>');
      assert.equal(XPlates('html', '<%! noparse =   null //comment %><div><%== 1+1 %></div>')(), '<div>2</div>');
      assert.equal(XPlates('html', '<%! noparse=true %><%! returnvar="x" %><% x = "test" %>')(), '<%! returnvar="x" %><% x = "test" %>');
      assert.equal(XPlates('html', '<%! noparse=true %><%! returnvar="x" %><% x = "test" %><%! noparse=false %><%= 1+1 %>')(), '<%! returnvar="x" %><% x = "test" %>2');
    });

  });

  describe('Preprocessing', function()
  {
    it('Works with preprocessor', function()
    {
      assert.equal(XPlates('html', '<div><#== x #></div>',[],null,{ preprocess: { x: 123 } })(), '<div>123</div>');
      assert.equal(XPlates('html', '<div><#= x #></div>',[],null,{ preprocess: { x: 'a<b' } })(), '<div>a&lt;b</div>');
    });
  });

  describe('HTML Whitespace stripping', function()
  {
    it('Does not strip whitespace unless asked', function()
    {
      assert.equal(XPlates('html', '    <div     id="   abc   "   >      a b c     </div>       ',[],null,{})(), '    <div     id="   abc   "   >      a b c     </div>       ');
    });
    it('Strips whitespace when asked', function()
    {
      assert.equal(XPlates('html', '    <div     id="   abc   "   >      a b c     </div>       ',[],null,{ strip: true })(), '<div id="abc">a b c</div>');
    });
    it('Handles pre/script blocks without stripping', function()
    {
      assert.equal(XPlates('html', '    <div   id="   abc   "   >  <pre>      a b c   </pre>  </div>       ',[],null,{ strip: true })(), '<div id="abc"><pre>      a b c   </pre></div>');
      assert.equal(XPlates('html', '    <div   id="   abc   "   >  <pre>      <pre>      a b c   </pre>    </pre>   </div>       ',[],null,{ strip: true })(), '<div id="abc"><pre>      <pre>      a b c   </pre>    </pre></div>');
      assert.equal(XPlates('html', '    <div   id="   abc   "   >  <script>      a b c   </script>  </div>       ',[],null,{ strip: true })(), '<div id="abc"><script>      a b c   </script></div>');
    });
    it('Does not strip templates', function()
    {
      assert.equal(XPlates('html', '    <div     id="   abc   "   >      a b<%= "    " %>c     </div>       ',[],null,{ strip: true })(), '<div id="abc">a b    c</div>');
    });
  });

  describe('Does multiple languages', function()
  {
    it('Works with plain text', function()
    {
      assert.equal(XPlates('text', '<%= arg %>')('a & b < c & d'), 'a & b < c & d');
    });
    it('Works with HTML', function()
    {
      assert.equal(XPlates('html', '<%= arg %>')('a & b < c & d'), 'a &amp; b &lt; c &amp; d');
    });
    it('Works with URL', function()
    {
      assert.equal(XPlates('url', 'http://server/index.html?a=<%= a %>', ['a'])('<hello world>!'), 'http://server/index.html?a=%3Chello%20world%3E!');
    });
    it('Works with Markdown', function()
    {
      assert.equal(XPlates('md', '<%= arg %>')('<hello & world>!'), '&lt;hello &amp; world>!');
    });
  });
 

  describe('Works as a bundle', function()
  {
    var xp;
    it('Can create bundles', function()
    {
      xp = new XPlates.bundle();
      xp('text', '<%= title %> <%= surname %>', ['title','surname'], 'fullname');
      xp('text', 'Hello, <%== this.fullname(title,surname) %>!', ['title','surname'], 'hello');
    });
      
    it('Bundles together named templates', function()
    {     
      assert.equal(typeof xp.fullname, 'function');
      assert.equal(typeof xp.hello, 'function');
      assert.equal(xp.fullname('Mr.', 'Smith'), 'Mr. Smith');
      assert.equal(xp.hello('Mr.', 'Smith'), 'Hello, Mr. Smith!');
    });
    
    it('Creates executable strings', function()
    {
      eval(xp.toString('mytemplates'));
      assert.equal(typeof mytemplates.fullname, 'function');
      assert.equal(typeof mytemplates.hello, 'function');
      assert.equal(mytemplates.fullname('Mr.', 'Smith'), 'Mr. Smith');
      assert.equal(mytemplates.hello('Mr.', 'Smith'), 'Hello, Mr. Smith!');           
    });
    
    it('Can use pre-defined variables in bundles', function()
    {
      xp = new XPlates.bundle();
      xp('text', '<%= abc %>', [], 'test', { predefined: { abc: 123 } });
      assert.equal(xp.test(), '123');
    });
  });

  describe('Simplifications', function()
  {
    it('Compiles no-operation templates to simple string returns', function()
    {
      assert.equal(XPlates('html', 'Hello, world!').toString(), 'function xplate(){;return "Hello, world!"; }');      
      assert.equal(XPlates('html', 'Hello,   world!',null,'xplate',{strip:true}).toString(), 'function xplate(){;return "Hello, world!"; }');
    });  
  });
});

