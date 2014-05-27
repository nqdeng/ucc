
# UniCornCompiler

The static file compiler for Unicorn System.

[![Build Status](https://travis-ci.org/nqdeng/ucc.svg?branch=master)](https://travis-ci.org/nqdeng/ucc)

## Install

    npm install ucc -g

## Usage


### Command

    ucc

命令模式下，ucc唯一依赖文件目录下面的package.json文件，该文件的结构如下：

``` javascript

    {
        src:'src', // 指定源文件目录
        target:'build', // 指定build后的文件目录
        name:'biz/home', // 指定当前编译的名称
        version:'1.0.0', // 指定当前编译的版本
        alias:{  // CMD 模块的映射

        }
    }
```

### Grunt Adapter

<a href="http://github.com/windygex/grunt-ucc">grunt-ucc</a>


### Glup Adapter

<a href="http://github.com/windygex/gulp-ucc">gulp-ucc</a>

## API




### `compile(pathname, data)`

* pathname {String} 文件路径
* data {String | Buffer} 文件数据

根据提供的路径和内容编译文件，返回一个文件对象。

``` javascript
var ucc = require('ucc'),
    compiler = ucc({
        modular:{
            alias:{}
        }
    }),
    data = new Buffer('define({name:"test.js"})'),
    pathname = 'test.js';

var file = compiler.compile(pathname,data);

console.log(file.pathname,file.data);
```

### `mount(extname, pipeline)`

* extname {String} 文件扩展名
* pipeline {Function | String} 文件处理方法

根据扩展名挂载不同的处理函数

``` javascript
var ucc = require('ucc'),
    compiler = ucc({
        modular:{
            alias:{}
        }
    });

compiler.mount('.tpl',['decode','template','encode'])
```

## Test

``` shell
    npm install
    mocha
```
