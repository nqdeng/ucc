var should = require('should'),
    Compiler = require('../lib/compiler');

describe('#mount() pipeline base file extname',function(){
    describe('mount()', function () {

        var compiler = new Compiler();

        it('should have two pipelines for js', function () {

            var mountTable = compiler.mount('.js',['decode','minify'])._mountTable;

            mountTable.should.have.property('.js');
            mountTable['.js'].length.should.equal(2);
        });

        it('should have one pipelines for css', function () {
            var mountTable = compiler.mount('.css',['minify'])._mountTable;

            mountTable.should.have.property('.css');
            mountTable['.css'].length.should.equal(1);
        });
    });
});

describe('#compile() file',function(){
    describe('compile()',function(){
        var compiler = new Compiler(),
            pathname = 'a/b/c.js',
            data = 'var a = function(){}';

        it('should return a file after compile pipeline',function(){
           var file = compiler.compile(pathname,data);
            file.should.have.property('data');
            file.pathname.should.equal('a/b/c.js');
            file.data.should.equal('var a = function(){}');
        });
    });
});

describe('pipeline function check:',function(){
   describe('decode pipeline',function(){
       var compiler = new Compiler(),
           pathname = 'a.js',
           data = new Buffer('var a = function(){}');
       compiler.mount('.js',['decode']);

       it('should return binary data',function(){
            var file = compiler.compile(pathname, data);

       });

   });

   describe('dependency pipeline',function(){
      var compiler = new Compiler();
          pathname = 'a.js',
          data = new Buffer('//#require "c.js"');

       compiler.mount('.js',['decode','dependency']);

       it('should dependency c.js',function(){
           var file = compiler.compile(pathname,data);
           file.meta.requires.length.should.equal(1);
           file.meta.requires[0].should.equal('c.js');
       });
   });

   describe('json pipeline',function(){
       var compiler = new Compiler(),
           pathname = 'a.json',
           data = new Buffer('{"a":123}');

       compiler.mount('.json',['decode','json']);

       it('should convert JSON file to cmd module',function(){
           var file = compiler.compile(pathname,data);
           file.meta.mime.should.equal('application/javascript');
       });

       it('should convert error JSON to empty object',function(){
           var data = new Buffer('{"a"}'),
               file = compiler.compile(pathname,data);

           /\{\}/.test(file.data.toString('binary')).should.be.true;

       })
   });

   describe('modular pipeline',function(){
       var compiler = new Compiler(),
           pathname = 'a.js',
           data = new Buffer('define(function(require){var b = require("b.js");})');

       compiler.mount('.js',['decode','modular']);

       it('should parse cmd module requires',function(){
            var file = compiler.compile(pathname,data);
           file.meta.requires.length.should.equal(1);
           file.meta.requires[0].should.equal('b.js');
       });
   });

    describe('template pipeline',function(){
        var compiler = new Compiler(),
            pathname = 'a.tpl',
            data = new Buffer('<div>123</div>');

        compiler.mount('.tpl',['decode','template']);

        it('should parse cmd module requires',function(){
            var file = compiler.compile(pathname,data);
            file.meta.mime.should.equal('application/javascript');
        });
    });

    describe('meta pipeline',function(){
        var compiler = new Compiler(),
            pathname = 'a.js',
            data = new Buffer('define(function(require){var b = require("b.js");})');

        compiler.mount('.js',['decode','modular','meta']);

        it('should write meta to file',function(){
            var file = compiler.compile(pathname,data);
            file.meta.requires.length.should.equal(1);
            file.meta.requires[0].should.equal('b.js');
            /\/\*!meta/.test(file.data.toString('binary')).should.be.true;
        });
    });


});