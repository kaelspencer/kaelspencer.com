from django.db import models
import random, string
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name

LEXERS = (
    (u'text', u'Plain text'),
    (u'c', u'C'),
    (u'cpp', u'C++'),
    (u'csharp', u'C#'),
    (u'css', u'CSS'),
    (u'html', u'HTML'),
    (u'html+php', u'HTML+PHP'),
    (u'java', u'Java'),
    (u'js', u'JavaScript'),
    (u'php', u'PHP'),
    (u'perl', u'Perl'),
    (u'python', u'Python'),
    (u'rb', u'Ruby'),
    (u'sql', u'SQL'),
    (u'abap', u'ABAP'),
    (u'antlr', u'ANTLR'),
    (u'antlr-as', u'ANTLR With ActionScript Target'),
    (u'antlr-csharp', u'ANTLR With C# Target'),
    (u'antlr-cpp', u'ANTLR With CPP Target'),
    (u'antlr-java', u'ANTLR With Java Target'),
    (u'antlr-objc', u'ANTLR With ObjectiveC Target'),
    (u'antlr-perl', u'ANTLR With Perl Target'),
    (u'antlr-python', u'ANTLR With Python Target'),
    (u'antlr-ruby', u'ANTLR With Ruby Target'),
    (u'as', u'ActionScript'),
    (u'as3', u'ActionScript 3'),
    (u'apacheconf', u'ApacheConf'),
    (u'applescript', u'AppleScript'),
    (u'asy', u'Asymptote'),
    (u'bbcode', u'BBCode'),
    (u'bash', u'Bash'),
    (u'console', u'Bash Session'),
    (u'bat', u'Batchfile'),
    (u'befunge', u'Befunge'),
    (u'boo', u'Boo'),
    (u'brainfuck', u'Brainfuck'),
    (u'cmake', u'CMake'),
    (u'css+django', u'CSS+Django/Jinja'),
    (u'css+genshitext', u'CSS+Genshi Text'),
    (u'css+mako', u'CSS+Mako'),
    (u'css+myghty', u'CSS+Myghty'),
    (u'css+php', u'CSS+PHP'),
    (u'css+erb', u'CSS+Ruby'),
    (u'css+smarty', u'CSS+Smarty'),
    (u'cheetah', u'Cheetah'),
    (u'clojure', u'Clojure'),
    (u'common-lisp', u'Common Lisp'),
    (u'cython', u'Cython'),
    (u'd', u'D'),
    (u'dpatch', u'Darcs Patch'),
    (u'control', u'Debian Control file'),
    (u'sourceslist', u'Debian Sourcelist'),
    (u'delphi', u'Delphi'),
    (u'diff', u'Diff'),
    (u'django', u'Django/Jinja'),
    (u'dylan', u'Dylan'),
    (u'erb', u'ERB'),
    (u'ragel-em', u'Embedded Ragel'),
    (u'erlang', u'Erlang'),
    (u'erl', u'Erlang erl session'),
    (u'evoque', u'Evoque'),
    (u'fortran', u'Fortran'),
    (u'gas', u'GAS'),
    (u'glsl', u'GLSL'),
    (u'genshi', u'Genshi'),
    (u'genshitext', u'Genshi Text'),
    (u'pot', u'Gettext Catalog'),
    (u'Cucumber', u'Gherkin'),
    (u'gnuplot', u'Gnuplot'),
    (u'go', u'Go'),
    (u'groff', u'Groff'),
    (u'html+cheetah', u'HTML+Cheetah'),
    (u'html+django', u'HTML+Django/Jinja'),
    (u'html+evoque', u'HTML+Evoque'),
    (u'html+genshi', u'HTML+Genshi'),
    (u'html+mako', u'HTML+Mako'),
    (u'html+myghty', u'HTML+Myghty'),
    (u'html+smarty', u'HTML+Smarty'),
    (u'haskell', u'Haskell'),
    (u'ini', u'INI'),
    (u'irc', u'IRC logs'),
    (u'io', u'Io'),
    (u'jsp', u'Java Server Page'),
    (u'js+cheetah', u'JavaScript+Cheetah'),
    (u'js+django', u'JavaScript+Django/Jinja'),
    (u'js+genshitext', u'JavaScript+Genshi Text'),
    (u'js+mako', u'JavaScript+Mako'),
    (u'js+myghty', u'JavaScript+Myghty'),
    (u'js+php', u'JavaScript+PHP'),
    (u'js+erb', u'JavaScript+Ruby'),
    (u'js+smarty', u'JavaScript+Smarty'),
    (u'llvm', u'LLVM'),
    (u'lighty', u'Lighttpd configuration file'),
    (u'lhs', u'Literate Haskell'),
    (u'logtalk', u'Logtalk'),
    (u'lua', u'Lua'),
    (u'moocode', u'MOOCode'),
    (u'mxml', u'MXML'),
    (u'basemake', u'Makefile'),
    (u'make', u'Makefile'),
    (u'mako', u'Mako'),
    (u'matlab', u'Matlab'),
    (u'matlabsession', u'Matlab session'),
    (u'minid', u'MiniD'),
    (u'modelica', u'Modelica'),
    (u'trac-wiki', u'MoinMoin/Trac Wiki markup'),
    (u'mupad', u'MuPAD'),
    (u'mysql', u'MySQL'),
    (u'myghty', u'Myghty'),
    (u'nasm', u'NASM'),
    (u'newspeak', u'Newspeak'),
    (u'nginx', u'Nginx configuration file'),
    (u'numpy', u'NumPy'),
    (u'ocaml', u'OCaml'),
    (u'objective-c', u'Objective-C'),
    (u'ooc', u'Ooc'),
    (u'pov', u'POVRay'),
    (u'prolog', u'Prolog'),
    (u'python3', u'Python 3'),
    (u'py3tb', u'Python 3.0 Traceback'),
    (u'pytb', u'Python Traceback'),
    (u'pycon', u'Python console session'),
    (u'rebol', u'REBOL'),
    (u'rhtml', u'RHTML'),
    (u'ragel', u'Ragel'),
    (u'ragel-c', u'Ragel in C Host'),
    (u'ragel-cpp', u'Ragel in CPP Host'),
    (u'ragel-d', u'Ragel in D Host'),
    (u'ragel-java', u'Ragel in Java Host'),
    (u'ragel-objc', u'Ragel in Objective C Host'),
    (u'ragel-ruby', u'Ragel in Ruby Host'),
    (u'raw', u'Raw token data'),
    (u'redcode', u'Redcode'),
    (u'rbcon', u'Ruby irb session'),
    (u'splus', u'S'),
    (u'scala', u'Scala'),
    (u'scheme', u'Scheme'),
    (u'smalltalk', u'Smalltalk'),
    (u'smarty', u'Smarty'),
    (u'squidconf', u'SquidConf'),
    (u'tcl', u'Tcl'),
    (u'tcsh', u'Tcsh'),
    (u'tex', u'TeX'),
    (u'vb.net', u'VB.net'),
    (u'vala', u'Vala'),
    (u'vim', u'VimL'),
    (u'xml', u'XML'),
    (u'xml+cheetah', u'XML+Cheetah'),
    (u'xml+django', u'XML+Django/Jinja'),
    (u'xml+evoque', u'XML+Evoque'),
    (u'xml+mako', u'XML+Mako'),
    (u'xml+myghty', u'XML+Myghty'),
    (u'xml+php', u'XML+PHP'),
    (u'xml+erb', u'XML+Ruby'),
    (u'xml+smarty', u'XML+Smarty'),
    (u'xslt', u'XSLT'),
    (u'yaml', u'YAML'),
    (u'aspx-cs', u'aspx-cs'),
    (u'aspx-vb', u'aspx-vb'),
    (u'c-objdump', u'c-objdump'),
    (u'cpp-objdump', u'cpp-objdump'),
    (u'd-objdump', u'd-objdump'),
    (u'objdump', u'objdump'),
    (u'rst', u'reStructuredText'),
    (u'sqlite3', u'sqlite3con'),
)

EXPIRATION_CHOICES = (
    (0, u'Never'),
    (60, u'1 Minute'),
    (600, u'10 Minutes'),
    (3600, u'1 Hour'),
    (86400, u'1 Day'),
    (604800, u'1 Week'),
)

EXPOSURE_CHOICES = (
    (True, u'Public'),
    (False, u'Private')
)

class Paste(models.Model):
    title = models.CharField(max_length=50, null=True)
    url = models.CharField(max_length=10)
    pastedate = models.DateTimeField(auto_now=True)
    rawbody = models.TextField()
    lexedbody = models.TextField()
    lexedcss = models.TextField()
    lexer = models.CharField(choices=LEXERS, max_length=30, default='text')
    expiration = models.IntegerField(choices=EXPIRATION_CHOICES, null=False, default=0)
    active = models.BooleanField(default=True)
    exposed = models.BooleanField(default=True)

    def __unicode__(self):
        return self.title 
    
    def get_absolute_url(self):
        return '/p/' + self.url + '/'
    
    def highlight(self):
        # TODO: The different lexers should store their CSS in another table.
        lexer = get_lexer_by_name(self.lexer)
        formatter = HtmlFormatter(nobackground=True)
        self.lexedbody = highlight(self.rawbody, lexer, formatter)
        self.lexedcss = formatter.get_style_defs('.highlight')
    
    def save(self, *args, **kwargs):
        self.url = ''.join(random.choice(string.ascii_letters + string.digits) for x in range(10))
        self.highlight()
        super(Paste, self).save(*args, **kwargs)
