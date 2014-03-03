(function(window){
    // 依赖jq，配合requirejs来执行
    // *****************************************公共方法  开始***************************************
    function paramToObject(param){
        if (param==''|| param==undefined) { return false; };
        //格式a=1&b=2
        //['a=1','b=2']
        var paramArr = param.split('&')
        var Object = {};
        for (var i = 0; i < paramArr.length; i++) {
            var tmpArr = paramArr[i].split('=');
            Object[tmpArr[0]] = tmpArr[1];  //转化为K-V
        };
        return Object;
    }
    function beginLoading(msg){
        if($('#loading')[0] != undefined) return false;
        var msg = msg == undefined ? '正在加载数据.....' : msg;
        $('body').append('<div class="g-loading use-progress" style="" id="loading">'+
                         '<span class="img-loading"></span>'+msg+
                         '<div class="progress-bar" id="progressBar" style="width: 100%;"></div></div>');
        $("#loading").addClass("show");
        $('#progressBar').css({width: "0%"});
        $('#progressBar').animate({
            width: "100%"
        },5000);
    }

    // 加载进度条——加载结束
    function afterLoading(){
        $('#progressBar').stop();
        $("#loading").fadeOut(function(){
            $(this).remove();
        })
    }

    // 统一加载数据的接口
    // 加载数据有两种：
    // 第一种：填充模板之后，再加载数据
    // 第二种：已经有模块了，直接加载数据，
    // 第二种：多个异步请求，等待多个返回后才回调
    function loadData(api,callback,template){
        if (template!=undefined) {
            $('#wrap').prepend('<div id="tpl" style="display:none">'+template+'</div>'); //加入临时的dom，做模板的缓冲区
        };

        // 多个ajax的情况下
        if($.isArray(api)){
            beginLoading();
            //动态生成变量
            var arr = [];
            for (var i = 0; i < api.length; i++) {
                arr.push($.ajax(api[i]));
            };
            $.when.apply(this,arr).done(function(){
                callback(arguments);
                afterLoading();
            });
        }else{
            $.ajax({
                url:api,
                beforeSend:function(){
                    beginLoading();
                },
                success:function(data){
                    if(callback!=undefined){
                        callback(data);
                        afterLoading();
                    }
                }
            })
        }
    }
    // *****************************************公共方法  结束***************************************

    var _saturn = function(){
        this.controllerList = {};
        this.routeTable={},
        this.init();
    }

    // 初始化操作
    _saturn.prototype.init = function(){

    }

    // 监听锚点链接变化,做兼容
    _saturn.prototype.hashChange = function(){
        var that = this;
        if( ('onhashchange' in window) && ((typeof document.documentMode==='undefined') || document.documentMode==8)) {
            // 浏览器支持onhashchange事件
            window.onhashchange = this.route;  // TODO，对应新的hash执行的操作函数
        } else {
            // 不支持则用定时器检测的办法
            setInterval(function() {
                var ischanged = isHashChanged();  // TODO，检测hash值或其中某一段是否更改的函数,isHashChanged方法还没有写
                if(ischanged) {
                    this.route();  // TODO，对应新的hash执行的操作函数
                }
            }, 150);
        }
    }

    _saturn.prototype.controller = function(controllerName,fn){
        eval("var controllerName = new _controller(controllerName);");
        var currentController = eval(controllerName);
        Saturn.controllerList[currentController] = currentController;
        fn.apply(currentController);

    };
    _saturn.prototype.execController = _execController;
    _saturn.prototype.model = _model;
    _saturn.prototype.route = _route;
    _saturn.prototype.createRoute = _createRoute;

    // *****************************************控制器  开始***************************************
    // 实例化控制器
    // 返回一个对象，这个对象拥有指定的一些方法，他本身也可以新建一些方法
    // 把他绑定在Satrun下
    // 控制器拥有什么功能？通常控制器负责从视图读取数据，控制用户输入，并向模型发送数据
    function _controller(controllerName,fn){
        this.name = controllerName;
    }
    _controller.prototype.getController = function(){

    }

    function _execController(urlSetting){
        debugger;
        /*
        childrenModuleName: "list"
        module: "article"
        params: Object
         */
        if(urlSetting.module != '' && urlSetting.childrenModuleName != '' && urlSetting.params !=''){
            //http://127.0.0.1/saturnV4/cms/themes/newmanage/#article/list?status=all&page=1
            //加载控制器
            var controllerObject = this.routeTable[module];
            $.ajax({
                url:controllerObject.path+"/"+controllerObject.controllerName+".js",
                beforeSend:function(){
                    beginLoading();
                }
                success:function(){
                    afterLoading();
                }
            })

        }else if(urlSetting.module != '' && urlSetting.childrenModuleName != ''){
            //http://127.0.0.1/saturnV4/cms/themes/newmanage/#article/create/

        }else if(urlSetting.module != ''&& urlSetting.params !=''){
            //http://127.0.0.1/saturnV4/cms/themes/newmanage/#login?a=1

        }else if(urlSetting.module != ''){
            //http://127.0.0.1/saturnV4/cms/themes/newmanage/#login

        }else{
            //http://127.0.0.1/saturnV4/cms/themes/newmanage/

        }
    }

    //function _loadController(){}
    // *****************************************控制器  结束***************************************







    // *****************************************模型  开始***************************************
    function _model(){

    }
    // *****************************************模型  结束***************************************




    // *****************************************路由器  开始***************************************
    // 路由器
    // 如果第一次进来的话，路由表还没有加载
    function _route(roueObject){
        //http://127.0.0.1/saturnV4/cms/themes/newmanage/ 最顶级
        //http://127.0.0.1/saturnV4/cms/themes/newmanage/#login
        //http://127.0.0.1/saturnV4/cms/themes/newmanage/#article/
        //http://127.0.0.1/saturnV4/cms/themes/newmanage/#article/list?status=all&page=1
        //http://127.0.0.1/saturnV4/cms/themes/newmanage/#article/edit/
        var hashContent = location.hash.substr(1); //拿到article/list?status=all&page=1
        var module='';    //模块
        var childrenModuleName='';
        var params='';

        // 如果最后一个是/，去掉
        hashContent = hashContent.charAt(hashContent.length-1) == '/' ? hashContent.substr(0,hashContent.length-1) : hashContent;
        if(hashContent!==''){
            // 如果有/ ,而且/不是最后的，/后的是方法名称
            if(/\//.test(hashContent)){
                var hashArray = hashContent.split('/');     //article, list?status=all&page=1
                module = hashArray[0];
                if(/\?/.test(hashArray[1])){
                    var childrenModule = hashArray[1].split('?');
                    childrenModuleName = childrenModule[0];
                    params = paramToObject(childrenModule[1]);    //转化为对象，{status:all,page:1}
                }else{
                    childrenModuleName = hashArray[1];
                }
            }else{
                if(/\?/.test(hashContent)){
                    var hashArray = hashContent.split('?');
                    var module = hashArray[0];
                    params = paramToObject(childrenModule[1]);    //转化为对象，{status:all,page:1}
                }else{
                    var module = hashContent;
                }
            }
        }
        var urlSetting = {
            module:module,
            childrenModuleName:childrenModuleName,
            params:params
        }
        this.execController(urlSetting);
    }
    function _createRoute(roueObject){
        this.routeTable = roueObject;
        this.hashChange();
        this.route();
    }
    // *****************************************路由器  结束***************************************


    window.Saturn = new _saturn();

})(window);