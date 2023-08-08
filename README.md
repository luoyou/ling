# ling 令
> 令的思路来源于另外一款插件macros，macros是一款构造非常精巧的插件，只有几十行代码就实现了命令的串行，用户自行配置相应的命令流，但该插件的缺点也是明显的，无法动态判断当前环境的上下文，只能机械的执行命令，令就是将当前编辑代码的上下文融入命令流中，可以快捷的帮助用户消除重复的操作。

- 「待开发」`alt i`自动定位光标后的可能输入位置，例如：`''`,`""`,`()`,`[]`,`{}`
- 添加快捷键，避免反复的移动光标
    - 「已完成」python支持
    - 「已完成」typescript/javascript支持
    - 「已完成」php支持
- 「已完成」通过一次快捷键，让git提交代码并push，支持智能生成commit信息
- 「已完成」自动识别字符串字面量跳转

## 快捷操作
1. 自动跳转至行末添加相应符号，若行尾该符号已存在，则自动跳转至行尾，不做操作；若行尾为分号，则会添加至分号前方
    1. `alt+;`跳转到行尾加`;`号
    1. `alt+ctrl+;`跳转到行尾加`;`号，但光标位于分号前
    1. `alt+,`跳转至行尾或分号前，添加`,`号
    1. `alt+ctrl+,`跳转至行尾或分号前，添加`,`号，但光标位于逗号前
    1. `alt+shift+;`跳转至行尾或分号前，添加`:`号
    1. `alt+shift+/`跳转至行尾或分号前，添加`?`号
    1. `alt+=`跳转至行尾或分号前，添加`=`号
    1. `alt+.`跳转至行尾或分号前，`typescript`,`javascript`,`vue`,`python`添加`.`号，`php`添加`->`号
    1. `alt+shift+.`跳转至行尾或分号前，添加`=>`号
    1. `alt+[`跳转至行尾或分号前，添加加`[]`
    1. `alt+shift+{`跳转至行尾或分号前，添加`{}`
    1. `alt+shift+9`跳转至行尾或分号前，添加`()`
1. `alt+shift+0`跳转至行尾或分号前，补充`)`，若当前行没有`(`，则不做任何操作
1. `alt+q alt+e`将当前编辑文件显示在资源管理器中

## 自动识别跳转
在php文件中，若字符串字面量为`'app\controller\UserController'`形式，则会依据该目录路径寻找此文件，若文件存在，支持`ctrl+click`跳转至对应的文件。

目前仅仅依据命名空间路径进行查找，尚未支持查询composer文件中的自动加载规则进行查找
后期计划依据 https://www.npmjs.com/package/php-parser 库进行查找