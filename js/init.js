/*初始化所有全局设置变量和angular设置函数
为全部页面提供config各种变量
*/
var init = new Object();

//所有API的前缀修饰，自动匹配测试服务器和正式服务器
init.apiprefix = undefined;
init.host = undefined;
init.rooturl = '';
init.upcount = 0;

var browserType = '';

var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

Math.uuidFast = function() {
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
        if (i==8 || i==13 ||  i==18 || i==23) {
            uuid[i] = '-';
        } else if (i==14) {
            uuid[i] = '4';
        } else {
            if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('');
};

init.uuid = function() {
    return Math.uuidFast();
}


//获取浏览器信息
init.getOs = function (){
    var bUat = navigator.userAgent;
    if (bUat.indexOf('MSIE')>0) {
        browserType = 'ie';
        if (bUat.indexOf("MSIE 6.0")>0 || bUat.indexOf("MSIE 7.0")>0 || bUat.indexOf("MSIE 8.0")>0 ||bUat.indexOf("MSIE 9.0")>0) {
            window.location.href = "../../borwserup.html";
            // window.open("../borwserup.html","_self");
            return;
        };
        return;
    }else if ( bUat.indexOf('Safari')>0 && bUat.indexOf('Chrome') == -1){
        console.log('Safari浏览器');
        browserType = 'safari';
        return;
    }else if ( bUat.indexOf('Firefox')>0){
        console.log('火狐浏览器');
        browserType = 'firefox';
        return;
    }else if (bUat.indexOf('Chrome')>0 && bUat.indexOf('Safari')>0){
        if (bUat.indexOf('360SE') >0 || bUat.indexOf('360ee') >0 ) {
            console.log("360浏览器");
            return;
        };
        browserType = 'chrome';
        console.log( 'Chrome浏览器')
        return;
    }else if (bUat.indexOf('Opera')){
        console.log('Opera浏览器');
        browserType = 'opera';
        return;
    };
}
init.getOs();

//防止ie没有forEach
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function forEach( callback, thisArg ) {
    var T, k;
    if ( this == null ) {
      throw new TypeError( "this is null or not defined" );
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if ( typeof callback !== "function" ) {
      throw new TypeError( callback + " is not a function" );
    }
    if ( arguments.length > 1 ) {
      T = thisArg;
    }
    k = 0;
    while( k < len ) {
      var kValue;
      if ( k in O ) {
        kValue = O[ k ];
        callback.call( T, kValue, k, O );
      }
      k++;
    }
  };
}


var isChrome = navigator.userAgent.toLowerCase().match(/chrome/) != null;//判断是否是谷歌浏览器


//获取页面设置的模版属性值，ele应使用$element
//这些值都设定在模版父层<div ng-include='aa' name='jack'>，得到{ng-include:'aa',name:'jack'}
init.getParentAttrs = function(ele) {
    var res = {};
    if (ele && ele[0] && ele.parent()[0]) {
        var attrs = ele.parent()[0].attributes;
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            res[attr.name] = attr.value;
        };
    };
    return res;
};
init.getSelfAttrs = function(ele) {
    var res = {};
    if (ele[0]) {
        var attrs = ele.attributes;
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            res[attr.name] = attr.value;
        };
    };
    return res;
};


//地址栏解析,获取地址栏传进来的数据
init.getUrlVals = function(url) {
    if (!url) url = window.location.href;
    var paras = {};
    var strarr = url.split("?");
    var parr = [];
    if (strarr.length > 1) {
        parr = strarr[1].split("&");
    }
    parr.forEach(function(v, i) {
        var ar = v.split("=");
        if (ar.length > 1) {
            paras[ar[0]] = ar[1];
        }
    });
    return paras;
}
init.urlVals = init.getUrlVals();


//根据属性获得指定父层
init.tar = function(e, attr, val) {
    if (attr == undefined) attr = "id";
    if (val) {
        var tar = $(e.target);
        if (tar.attr(attr) != val) {
            tar = $(tar.parents("[" + attr + "='" + val + "']")[0]);
        }
    } else {
        if (tar.attr(attr) != val) {
            tar = $(tar.parents("[" + attr + "']")[0]);
        }
    }
    return tar;
};



//将字符串转为json，如果失败不报错，返回null
init.parseJSON = function(str) {
    var jsn;
    try {
        jsn = JSON.parse(str);
    } catch (e) {
        console.log("数据格式转换失败:" + str.substr(0, 128));
    }
    return jsn;
}


//上传文件限制
init.fileTypes = {
    all: '.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.pdf,.png,.jpg,.gif,.zip,.rar',
    pic: '.png,.jpg,.gif,.jpeg',
    file: ".doc,.docx,.pdf,.dot,.rtf,.txt,.xps,.odt,.xml,.html,.mht,.mhtml,.dotm,.docm,.dotx,.wps,.wpt,.ppt,.pptx,.xlsx,.xls,.xlsx,.ods,.xlsb,.xlsm,.et,.ett,.xlt,.dps,.dpt,.pot,.pps",
    audio: ".mp4",
    compressedFile:".rar,.zip,.7-zip,.cab,.arj,.tar,.gzip,.jar",
    xls : '.xlsx,.xls',
    xlsx:'.xlsx'
    //audio: "audio/mp4, video/mp4"
};

//所有可能的依赖库module
init.moduleLib = [{
    name: 'ui.bootstrap',
    url: init.rooturl +'js/ui-bootstrap-tpls-2.5.0.js',
}, {
    name: 'sun',
    url: init.rooturl + 'js/app.js'
}];


//初始化整个页面
//前提是jquery和angular已经存在
//自动载入所有css和js，初始化app
init.initPage = function(midAngularFn, beforeAngularFn, afterAngularfn) {
    //兼容已有，防止angualr自动初始化，去除ng-app标签
    var jo = $('[ng-app]');
    jo.removeAttr('ng-app');

    //所有需要载入的css,js,module库
    var filearr = [];
    init.csslib.forEach(function(one, i) {
        filearr.push(one.url);
    });
    init.jslib.forEach(function(one, i) {
        filearr.push(one.url);
    });
    init.moduleLib.forEach(function(one, i) {
        filearr.push(one.url);
    });

    //载入文件
    init.loadFiles(filearr, function() {
        angular.element(document).ready(function() {
            //初始化angular
            if (beforeAngularFn) beforeAngularFn();
            var app = init.initApp();
            if (midAngularFn) midAngularFn();
            angular.bootstrap(document, ['app']);
            if (afterAngularfn) afterAngularfn();
        });
    });
};




//初始化app的同步版本，自动载入所有的依赖库和需要的文件
//由于css文件是即时的，所以不考虑是否载入完成
init.loadModules = function(okfn) {
    //先自动检查需要的依赖是否已经载入
    var farr = [];
    init.moduleLib.forEach(function(one, i) {
        var isready = false;
        try {
            var isok = angular.module(one.name);
            if (isok) {
                isready = true;
            };
        } catch (err) {};
        if (!isready) {
            farr.push(one.url);
        }
    });
    //自动载入缺失的modules
    init.loadFiles(farr, okfn);
};


//载入一个外部文件队列，然后执行一个函数
init.loadFiles = function(arr, okfn, n) {
    if (n == undefined) n = 0;
    //最后一次执行完成函数
    if (n >= arr.length) {
        okfn();
        return;
    }
    //载入第n个文件
    var url = arr[n];
    var ext = init.getFileExt(url);
    if (ext == 'js') {
        //载入完成后跳下一个
        n++;
        jQuery.getScript(url, function() {
            init.loadFiles(arr, okfn, n);
        });
    } else if (ext == 'css') {
        //直接插入到页面head，然后跳下一个
        init.loadCss(url);
        n++;
        init.loadFiles(arr, okfn, n);
    } else {
        //css,js以外的文件不处理，跳下一个
        n++;
        init.loadFiles(arr, okfn, n);
    };
};

//载入css单独函数,只是插入到head，不做其他处理
init.loadCss = function(url) {
    $("<link>").attr({
        rel: "stylesheet",
        type: "text/css",
        href: url,
    }).appendTo("head");
};



//初始化angular设置的函数，app如果为空则自动创建
//包含$rootScope各种通用变量和函数，post格式设置等
init.initApp = function(app) {

    //自动判断哪些module是html里面已经载入完成的
    var depModules = [];

    init.moduleLib.forEach(function(one, i) {
        var isready = false;
        try {
            isready = angular.module(one.name);
            if (isready) {
                depModules.push(one.name);
            };
        } catch (err) {};
    });
    console.log('Default app inject modules:', depModules);

    //如果不存在自动创建并在底部返回这个app
    if (!app) {
        app = angular.module('app', depModules);
    };
    if (!app) return;

    //为引入模板做设定
    app.config(function($controllerProvider, $compileProvider, $filterProvider, $provide) {
        app.controller = $controllerProvider.register;
        //app.controller = $controllerProvider.register;
        //app.service = $provide.service;
        //app.factory = $provide.factory;
        //app.directive = $compileProvider.directive;
        //app.filter = $filterProvider.register;
    });



    //初始化设置post的json格式
    app.config(function($httpProvider) {
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        $httpProvider.defaults.transformRequest = [

            function(data) {
                var param = function(obj) {
                    var query = '';
                    var name, value, fullSubName, subName, subValue, innerObj, i;

                    for (name in obj) {
                        value = obj[name];

                        if (value instanceof Array) {
                            for (i = 0; i < value.length; ++i) {
                                subValue = value[i];
                                fullSubName = name + '[' + i + ']';
                                innerObj = {};
                                innerObj[fullSubName] = subValue;
                                query += param(innerObj) + '&';
                            }
                        } else if (value instanceof Object) {
                            for (subName in value) {
                                subValue = value[subName];
                                fullSubName = name + '[' + subName + ']';
                                innerObj = {};
                                innerObj[fullSubName] = subValue;
                                query += param(innerObj) + '&';
                            }
                        } else if (value !== undefined && value !== null) {
                            query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                        }
                    }
                    return query.length ? query.substr(0, query.length - 1) : query;
                };
                return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
            }
        ];
    });

    //返回app，即使没有传app进来也能创建app
    return app;
};



init.applyScope = function(scp) {
    if (scp) {
        if (scp.$root.$$phase != '$apply' && scp.$root.$$phase != '$digest') {
            scp.$apply();
        };
    };
};


//时间和日期相关----------------
//将日期对象转为指定格式字符串
init.formatDate = function(dt, formatStr) {
    if (!dt) dt = new Date();
    if (dt.constructor != Date) {
        dt = init.getDate(dt);
    };
    if (!formatStr) formatStr = 'YYYY-MM-DD hh:mm:ss';
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    str = str.replace(/yyyy|YYYY/, dt.getFullYear());
    str = str.replace(/yy|YY/, (dt.getYear() % 100) > 9 ? (dt.getYear() % 100).toString() : '0' + (dt.getYear() % 100));
    str = str.replace(/MM/, dt.getMonth() > 9 ? (dt.getMonth() + 1).toString() : '0' + (dt.getMonth() + 1));
    str = str.replace(/M/g, dt.getMonth());
    str = str.replace(/w|W/g, Week[dt.getDay()]);
    str = str.replace(/dd|DD/, dt.getDate() > 9 ? dt.getDate().toString() : '0' + dt.getDate());
    str = str.replace(/d|D/g, dt.getDate());
    str = str.replace(/hh|HH/, dt.getHours() > 9 ? dt.getHours().toString() : '0' + dt.getHours());
    str = str.replace(/h|H/g, dt.getHours());
    str = str.replace(/mm/, dt.getMinutes() > 9 ? dt.getMinutes().toString() : '0' + dt.getMinutes());
    str = str.replace(/m/g, dt.getMinutes());
    str = str.replace(/ss|SS/, dt.getSeconds() > 9 ? dt.getSeconds().toString() : '0' + dt.getSeconds());
    str = str.replace(/s|S/g, dt.getSeconds());
    return str;
};




//从字符串获取日期对象
init.getDate = function(str) {
    if (str.constructor == String) {
        return (new Date(Date.parse(str)));
    } else if (str.constructor == Number) {
        return (new Date(str));
    } else {
        return (new Date());
    };
};
//从日期对象获取字符串时间
init.getStr = function(dt) {
    return init.formatDate(dt);
};
//获取两个日期对象的时间差
init.getDist = function(tomor, yest) {
    var d1 = tomor;
    var d2 = yest;
    var dt1;
    var dt2;
    if (typeof(d1) == "string") {
        dt1 = init.getDate(d1);
    } else {
        dt1 = d1;
    };
    if (typeof(d2) == "string") {
        dt2 = init.getDate(d2);
    } else {
        dt2 = d2;
    };
    var obj = {};

    if (dt1 != "Invalid Date" && dt2 != "Invalid Date") {
        var dist = dt1 - dt2;
        obj = {
            year: 0,
            month: 0,
            week: 0,
            day: 0,
            hour: 0,
            minute: 0,
            absyear: 0,
            absmonth: 0,
            absweek: 0,
            absday: 0,
            abshour: 0,
            absminute: 0,
        };
        obj.absyear = (dist / (1000 * 3600 * 24 * 365)).toFixed(1);
        obj.absmonth = (dist / (1000 * 3600 * 24 * 30)).toFixed(1);
        obj.absweek = (dist / (1000 * 3600 * 24 * 7)).toFixed(1);
        obj.absday = (dist / (1000 * 3600 * 24)).toFixed(1);
        obj.abshour = (dist / (1000 * 3600)).toFixed(1);
        obj.absminute = (dist / (1000 * 60)).toFixed(1);

        obj.year = Math.floor(dist / (1000 * 3600 * 24 * 365));
        dist -= obj.year * 1000 * 3600 * 24 * 365;
        obj.month = Math.floor(dist / (1000 * 3600 * 24 * 30));
        dist -= obj.month * 1000 * 3600 * 24 * 30;
        obj.week = Math.floor(dist / (1000 * 3600 * 24 * 7));
        dist -= obj.week * 1000 * 3600 * 24 * 7;
        obj.day = Math.floor(dist / (1000 * 3600 * 24));
        dist -= obj.day * 1000 * 3600 * 24;
        obj.hour = Math.floor(dist / (1000 * 3600));
        dist -= obj.hour * 1000 * 3600;
        obj.minute = Math.floor(dist / (1000 * 60));
    }
    return obj;
};

//将一个数字转换成指定位数的字符串
init.numtostr = function(num, n) {
    var str = String(num);
    var dis = n - str.length;
    if (dis > 0) {
        for (var i = 0; i < dis; i++) {
            str = "0" + str;
        };
    };
    if (dis < 0) {
        str = str.substr(0, n);
    };
    return str;
};

//从一个数组里面随机抽取
init.genRandArr = function(totalcount, randcount, repeat) {
    var arr = [];
    var arrtmp = [];
    for (var i = 0; i < totalcount; i++) {
        arrtmp.push(i);
    };
    if (randcount >= totalcount || repeat == true) {
        //肯定会重复
        for (var i = 0; i < randcount; i++) {
            var rd = Math.floor(Math.random() * totalcount);
            arr.push(rd);
        };
    } else {
        for (var i = 0; i < randcount; i++) {
            var rd = Math.floor(Math.random() * arrtmp.length);
            arr.push(arrtmp[rd]);
            arrtmp.splice(rd, 1);
        };
    }
    return arr;
}

//以href的链接模式在新窗口打开链接;即使禁止弹窗也可以打开
init.openurl = function(url) {
    var randid = "zclickatagtemp" + Number(new Date());
    var ele = document.createElement('a');
    ele.href = url;
    ele.style.display = 'none';
    console.log('a click!');
    ele.id = randid;
    ele.target = '_blank';
    ele.innerHTML = randid;
    document.body.appendChild(ele);
    document.getElementById(randid).click();
};


//拼合分享链接
init.buildshareurl = function(shareto, title, url,pic) {
    console.log(title,'title in init.............................');
    if(title == "用户名片") title = "看看我在项目工场的成就吧！";
    if (title == undefined) title = $('head').find("title").html();
    if (url == undefined) url = "http://www.xmgc360.com";

    var strp = "title=" + title + "&url=" + url + "&pic=" + pic;
    var str;
    if (shareto == "weibo") {
        str = "http://service.weibo.com/share/share.php?" + strp;
        return str;
    };
    if (shareto == "qzone") {
        str = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?" + strp + "&summary=赶紧分享加入吧！！！";
        return str;
    };
    if (shareto == "qq") {
        str = "http://connect.qq.com/widget/shareqq/index.html?" + strp;
        return str;
    };
    str = shareto + strp;
    return str;
};

//将json格式化成html显示的字符串
init.formatJson = function(json) {
    var reg = null,
        formatted = '',
        pad = 0,
        PADDING = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    //PADDING = '&#09;&#09;&#09;&#09';

    //括号前添加回车
    reg = /([\{\}])/g;
    json = json.replace(reg, '<br>$1<br>');

    //括号后添加回车
    reg = /([\[\]])/g;
    json = json.replace(reg, '<br>$1<br>');

    //逗号后添加回车
    reg = /(\,)/g;
    json = json.replace(reg, '<br>$1<br>');

    //清理多余的回车
    reg = /(<br><br>)/g;
    json = json.replace(reg, '<br>');

    //清理逗号前的回车
    reg = /<br>\,/g;
    json = json.replace(reg, ',');

    //其他格式化
    reg = /\:<br>\{/g;
    json = json.replace(reg, ':{');
    reg = /\:<br>\[/g;
    json = json.replace(reg, ':[');
    reg = /\:/g;
    json = json.replace(reg, ': ');

    //清理逗号前的回车
    reg = /],<br>}/g;
    json = json.replace(reg, '],}');
    reg = /},<br>,}/g;
    json = json.replace(reg, '},}')

    $.each(json.split('<br>'), function(index, node) {
        var i = 0,
            indent = 0,
            padding = '';

        if (node.match(/\{$/) || node.match(/\[$/)) {
            indent = 1;
        } else if (node.match(/\}/) || node.match(/\]/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else {
            indent = 0;
        }

        for (i = 0; i < pad; i++) {
            padding += PADDING;
        }

        formatted += padding + node + '<br>';
        pad += indent;
    });

    reg = /<br>(&nbsp;)*(\s)*<br>/g;
    formatted = formatted.replace(reg, '<br>');

    return formatted;
};



//合并两个对象,base对象将被cover覆盖,如果base为空自动创建
//默认不覆盖
init.mergeObjs = function(base, cover, override) {
    if (!override) override = false;
    if (!base) base = {};
    for (var k in cover) {
        if (override) {
            base[k] = cover[k];
        } else {
            if (!base[k] || base[k] == '') {
                base[k] = cover[k];
            }
        };
    };
    return base;
};
