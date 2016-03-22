


# XPlates

## What is this?

XPlates is a powerful but tiny and superfast string template library.  It compiles templates into lightweight, portable JS functions.

## Quick reference

Template creation:

    XPlates(language, template)
    XPlates(language, template, arguments)
    XPlates(language, template, arguments, name)
    XPlates(language, template, arguments, name, parameters)
    
Template calling:

    var t = XPlates('html', '<%= greeting %>, world!', ['greeting']);
    t('Hello'); //Returns "Hello, world!"

Template forms:

    <% code %>                                             //Code execution
    <%= value %>                                           //Escaped output
    <%== value %>                                          //Unescaped output
    <%? condition %>...<%?? condition %>...<%??%>...<%?%>  //If, Else If, Else
    <%~ array : index : value %>...<%~%>                   //Array iteration
    <%~~ array : index : value %>...<%~~%>                 //Reverse array iteration
    <%+ object : key : value %>...<%+%>                    //Object iteration
    <%@ varname %>...<%@%>                                 //Capture output in variable
    <%! option=value %>                                    //Template option    
    
Preprocessing:

    <# code #>                                             //Code execution
    <#= value #>                                           //Escaped output
    <#== value #>                                          //Unescaped output
    <#? condition #>...<#?? condition #>...<#??#>...<#?#>  //If, Else If, Else
    <#~ array : index : value #>...<#~#>                   //Array iteration
    <#~~ array : index : value #>...<#~~#>                 //Reverse array iteration
    <#+ object : key : value #>...<#+#>                    //Object iteration
    <#@ varname %>...<#@#>                                 //Capture output in variable
    <#! option=value #>                                    //Template option    
    
Template Bundles 

    //Create a bundle
    var b = new XPlates.bundle();
    
    //Create some templates
    b('text', '<%= greeting %>, world!', ['greeting'], 'welcome');    
    b('html', '<h1><%= text %></h1>', ['text'], 'header');
    
    //Call templates
    b.welcome('Hello');           //Returns "Hello, world!"
    b.header('Hello');            //Returns "<h1>Hello</h1>"
    b.header(b.welcome('Hello')); //Returns "<h1>Hello, world!</h1>
    
    //Create a portable bundle of code
    b.toString('my_bundle'); //Returns a string of JavaScript code

## Usage

### Compiling templates
Compiling a template returns a JavaScript function that returns a string.

    var t = XPlates('html', '<div>Hello, world!</div>');
    //t() returns "<div>Hello, world!</div>"
    
### Using arguments with templates
You can add arguments to templates, named however you'd like.

    var t = XPlates('html', '<div><%= x %>, <%= y %>!</div>', ['x','y']);
    //t('Hello','World') returns "<div>Hello, World!</div>"
    
If you don't specify argument names, every template is assumed to have a single argument named "arg".
    
### Operations
#### <% code %> Code execution
You can execute arbitrary code inside a template:

    var t = XPlates('html', '<div><% for (var i = 0; i < 5; i++) { %>X<% } %></div>');
    //t() returns "<div>XXXXX</div>"

You can also use the "out" variable to append directly to the output:

    var t = XPlates('html', '<div><% out += "hello!" %></div>');
    //t() returns "<div>hello!</div>"
    
#### <%= value %> Escaped output
Escaped output can be generated easily for the current langauge (in this case, HTML).

    var t = XPlates('html', '<div><%= "I like apples & bananas!" %></div>');
    //t() returns "<div>I like apples &amp; bananas</div>"


You can use variables, code, or anything that can be converted to a string inside this block:

    var t = XPlates('html', '<div><%= Math.floor(x.y) %></div>');
    //t({ y: 12.34 }) returns "<div>12</div>"
    
#### <%== value %> Unescaped output 
If you don't want your output escaped, use a double-equals:

    var t = XPlates('html', '<div><%== "I like apples & bananas!" %></div>');
    //t() returns "<div>I like apples < bananas</div>"
        
#### <%? condition %>...<%??%>...<%?%> Conditionals
You can add conditional statements easily:

    var t = XPlates('html', '<div><%? x %>Yes!<%?%></div>', ['x']);
    //t(true) returns "<div>Yes!</div>"
    //t(false) returns "<div></div>"
    
Here's how to do if, else if, else conditionals:

    var t = XPlates('html', '<%? x < 0 %>Negative!<%?? x > 0 %>Positive!<%??%>Zero!<%?%>',['x']);
    //t(1) returns "Positive!"
    //t(-1) returns "Negative!"
    //t(0) returns "Zero!"

#### <%~ array : index : value %>...<%~%> Array iteration
Iterating over arrays is easy, and gives you quick access to the index and value:

    var t = XPlates('html', '<%~ x : index : value %><%= index %> is <%= value %>! <%~%>',['x']);
    //t(['A','B','C']) returns "0 is A! 1 is B! 2 is C! "

The following forms are supported:

    <%~ array : index : value %>...<%~%>
    <%~ array : index %>...<%~%> //No value variable is okay!  You can still use array[index].
    <%~ array : : value %>...<%~%> //No index varaible is okay if you don't care about the index!
    <%~ array %>...<%~%> //No index or value variables are still okay if you don't need either!
    
#### <%~~ array : index : value %>...<%~~%> Reverse array iteration
Reverse array iteration works just like array iteration, but traverses it backwards:

    var t = XPlates('html', '<%~~ x : index : value %><%= index %> is <%= value %>! <%~~%>',['x']);
    //t(['A','B','C']) returns "2 is C! 1 is B! 0 is A! "
    
All the same forms apply here as in forward iteration.

#### <%+ object : key : value %>...<%+%> Object iteration
This will iterator over the keys of an object:

    var t = XPlates('html', '<%+ x : key : value %><%= key %> is <%= value %>! <%+%>',['x']);
    //t({ A: 1, B: 2, C: 3 }) returns "A is 1! B is 2! C is 3! "
    
The following forms are supported:

    <%+ object : key : value %>...<%+%>
    <%+ object : key %>...<%+%> //No value variable is okay!  You can still use object[key].
    <%+ object : : value %>...<%+%> //No key varaible is okay if you don't care about the key!
    <%+ object %>...<%+%> //No key or value variables are still okay if you don't need either!
    
#### <%@ varname %>...<%@%> Capture output as variable
This will capture string output in between the two tags into a variable:

    var t = XPlates('html', '<%@ x %>Hello, <%= name %>!<%@%><%== x %>  <%== x %>',['name']);
    //t("World") returns "Hello, World! Hello, World!"

#### <%! option=value %> Template options
    
##### <%! noparse=boolean %>
You can turn off template parsing if you want.  This is useful when you have templates inside templates:
     
    var t = XPlates('html', 'Hello, <%! noparse = true %><%= name %><%! noparse = false %>!');
    //t() returns "Hello, <%= name %>!"
    
    
### Preprocessing
To make your templates a little faster, you can pre-compile your template with variables and operations, so only necessary work is done at the last minute.

To use this, add a "preprocess" object to the parameters, and use <# #> blocks:

    var t = XPlates('html', '<div><#= greeting #>, <%= name %>!</div>', ['name'], null, { preprocess: { greeting: 'Hello' } });
    //t('World') returns 'Hello, World!';

Use the same template format, but with a <# #> instead of <% %>:

    <# code #>                                             //Code execution
    <#= value #>                                           //Escaped output
    <#== value #>                                          //Unescaped output
    <#? condition #>...<#?? condition #>...<#??#>...<#?#>  //If, Else If, Else
    <#~ array : index : value #>...<#~#>                   //Array iteration
    <#~~ array : index : value #>...<#~~#>                 //Reverse array iteration
    <#+ object : key : value #>...<#+#>                    //Object iteration
    <#@ varname %>...<#@#>                                 //Capture output in variable
    <#! option=value #>                                    //Template option
    
### Pre-defined variables
Your template can be compiled with variable references pre-defined, making things available later on without explicit argument.

To use this, add a "predefined" object to the parameters:

    var t = XPlates('html', '<div><%= greeting %>, <%= name %>!</div>', ['name'], null, { predefined: { greeting: 'Hello' } });
    //t('World') returns 'Hello, World!';
    
This is different from pre-processing:  pre-processing variables are available only at compile time, while predefined variables are available at runtime.
    
### Template Bundles

#### Creating and using bundles
Multiple templates can be packaged into a bundle:

    //Create a bundle
    var b = new XPlates.bundle();
    
    //Create some templates
    b('text', '<%= greeting %>, world!', ['greeting'], 'welcome');    
    b('html', '<h1><%= text %></h1>', ['text'], 'header');
    
    //Call templates
    b.welcome('Hello');           //Returns "Hello, world!"
    b.header('Hello');            //Returns "<h1>Hello</h1>"
    b.header(b.welcome('Hello')); //Returns "<h1>Hello, world!</h1>
      
#### Making bundles into portable JavaScript code 
Bundles can be tranformed into portable JavaScript code that will run anywhere by calling toString(name)

    b.toString('my_bundle'); //Returns a compact JavaScript string
    
This code can run anywhere, and will include all the necessary code to do so - for example, escape functions.
    
For example, the bundle in the section above would look like this:

    var my_bundle = new (function() {
    var __xplates_html_chars = {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&apos;"};
    var __xplates_html_escape = function (s) { return s.replace(/[&<>"']/g, __xplates_html_replace); };
    var __xplates_html_replace = function (c) { return __xplates_html_chars[c]; };
    this["welcome"] = function welcome(greeting){var out="";out+=(""+(greeting))+", world!";return out; };
    this["header"] = function header(text){var out="";out+="<h1>"+__xplates_html_escape(""+(text))+"</h1>";return out; };
    return this; })();
    
### Multiple Language Support

XPlates supports multiple langauges, and can be easily extended to support more.

#### Language "html"
The "html" language includes escape characters for <>&"' characters:

    var t = XPlates('html', '<%= message %>', ['message']);
    t('Peanut Butter & Jelly'); //Returns "Peanut Butter &amp; Jelly"

For HTML, whitespace stripping functionality can be enabled for this language:

    var t = XPlates('html', '  <div    class="    <%=   c    %>    "   >   Hello   </div  >   ', ['c'], null, { strip: true });
    t('red'); //Returns '<div class="red">Hello</div>'
    
#### Language "text"
The "text" language is plain text - it includes no escape functionality and no special support.

    var t = XPlates('text', '<%= message %>', ['message']);
    t('Peanut Butter & Jelly'); //Returns "Peanut Butter & Jelly"
    
#### Language "url"
The "url" language escapes all non-URL safe characters with encodeURLComponent

    var t = XPlates('url', 'I like <%= message %>', ['message']);
    t('Peanut Butter & Jelly'); //Returns "Peanut%20Butter%20%26%20Jelly"
    
#### Language "md"
The "md" (Markdown) language escapes the < and & characters:

    var t = XPlates('url', 'I like <%= message %>', ['message']);
    t('Peanut Butter & Jelly'); //Returns "Peanut Butter &amp; Jelly"
    