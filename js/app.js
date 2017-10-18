angular.module('sun', ['components', 'basics', 'templates', 'tools']);


angular.module('components', [])


angular.module('basics', [])
.constant('URL', 'http://www.github.com')
.config(function($httpProvider) {
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [function(data) {
            /**
             * The workhorse; converts an object to x-www-form-urlencoded serialization.
             * @param {Object} obj
             * @return {String}
             */
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
                        query += encodeURIComponent(name) + '='
                            + encodeURIComponent(value) + '&';
                    }
                }

                return query.length ? query.substr(0, query.length - 1) : query;
            };

            return angular.isObject(data) && String(data) !== '[object File]'
                ? param(data)
                : data;
        }];
    })

angular.module('templates', [])
    .directive('hello', function() {
        return {
            restrict: 'E',
            template: '<div>Hi there <span ng-transclude></span></div>',
            transclude: true
        }
    })

angular.module('tools', [])
    .filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            try{
                text = text.replace(/<[//]{0,1}(script|style)[^><]*>/ig,"");
                text = text.replace(/(onabort|onblur|onchange|onclick|ondblclick|onerror|onfocus|onkeydown|onkeypress|onkeyup|onload|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onreset|onresize|onselect|onsubmit|onunload)/ig,'马赛克');
                //<a href="http://www.baidu.com" target="_blank">hello</a>
                //if(text){
                //    /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/
                //}else{
                //    text = "your script is not allowed!only a style!"
                //}
                text = '<pre style="width:inherit;white-space: pre-wrap;word-wrap: break-word;">'+text+'</pre>';
                return $sce.trustAsHtml(text);
            }catch(e){
            }
        };
    }])
    .directive('sce', function ($compile,$parse) {
    return{
        restrict: 'EA',
        transclude: true,
        replace: true,
        controller:"SceController",
        scope:{
            modeType:"@",
            bindData:"="
        },
        template:function(element,attrs){
            if(attrs.modeType == "html"){
                return '<p ng-bind-html="bindData"></p>';
            }else{
                return '<p ng-bind="bindData"></p>';
            }
        },
        link:function(scope,element,attrs){
//                if(attrs.modeType == "html"){
//                    var parsed = $parse(attrs.ngBindHtml);
//                    function getStringValue(){
//                        return (parsed(scope)||'').toString();
//                    }
//                    scope.$watch(getStringValue,function(){
//                       $compile(element,null,-9999)(scope);
//                    });
////                    scope.bindData = $sce.trustAsHtml(scope.bindData);
//                }
        }
    };
})
    .controller('SceController', ['$scope','$attrs','$sce', function ngBindHtmlCtrl($scope,$attrs,$sce) {
        if($attrs.modeType == "html"){
            function filterBD(text) {
                text = text.replace(/<[//]{0,1}(script|style)[^><]*>/ig,"");
                text = text.replace(/(onabort|onblur|onchange|onclick|ondblclick|onerror|onfocus|onkeydown|onkeypress|onkeyup|onload|onmousedown|onmousemove|onmouseout|onmouseover|onmouseup|onreset|onresize|onselect|onsubmit|onunload)/ig,'马赛克');
                return text;
            };
            function safehtml(str) {
                //reg1替换script标签，reg2替换style以外的属性
                var reg1rep = '<unsupported-tag>';
                var reg2rep = ' unknown-attribute-';
                var reg1 = /<\s*script.*>/g;
                //空格开始且不等于style的字段
                var reg2 = /\s+(?!style)(?!src)(?!href)/g;
                str = str.replace(reg1, reg1rep);

                //每次<>截取的起始点终结点
                var start = -1;
                var end = -1;
                var arr = [];

                //排除单引号双引号中间的<>
                var inquot1 = false;
                var inquot2 = false;

                //刚刚截取了一个<>
                var haspushtag = false;

                //htmlinnner内容截取点
                var sstart = 0;

                for (var i = 0; i < str.length; i++) {
                    var s = str.charAt(i);
                    if (s == "'") {
                        //单引号开关，排除单引号中间内容
                        inquot1 = !inquot1;
                    } else if (s == '"') {
                        //双引号开关，排除双引号中间内容
                        inquot2 = !inquot2;
                    } else if (s == '<' && !inquot1 && !inquot2) {
                        //每次遇到<就定义tag截取开始点
                        //定义开始点并不一定从这里截取
                        start = i;
                    } else if (s == '>' && !inquot1 && !inquot2) {
                        //每次遇到>一定会往前最近的开始点截取<...>
                        //同时尝试把这个<...>开始点之前到前一个>之后的内容截取为innnerhtml
                        //这是为了避免<<<<p>...</p>一类情况，所以按照后>为标准
                        //如果本来就是纯文本，那么数组长度会为0，最后return时候处理
                        //如果是少于4个（开始也会有一个空‘’），那么代表低于2个<>，不匹配，最后return处理
                        end = i;
                        if (start != -1) {
                            arr.push(str.substr(sstart, start - sstart));

                            var sh = str.substr(start, end - start + 1);
                            sh = sh.replace(/\s+/g, ' ');
                            sh = sh.replace(reg2, reg2rep);
                            arr.push(sh);

                            start = -1;
                            sstart = i + 1;

                            haspushtag = true;
                        };
                    };
                };
                var res = str;
                //只有截取出来的<>达到2个（arr长度达到4个）才有意义
                if (arr.length >= 2) {
                    res = arr.join('');
                };
                return res;
            };
            $scope.bindData = $sce.trustAsHtml(filterBD($scope.bindData));
            //$scope.bindData = $sce.trustAsHtml(safehtml($scope.bindData));
        }
    }]);
