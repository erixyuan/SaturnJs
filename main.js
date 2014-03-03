/***************************************
 * 执行代码
 ***************************************/
Saturn.createRoute({
    'article':{
        controllerName:'ArticleController',
        beforLogin:"LoginController"
        path:"js/controllers"
    },
    'application':"ApplicationController"
});

Saturn.controller('ArticleController',function(){
    // 一个function该表一个页面模块
    this.index = function(){
        alert('index');
    }
    this.list = function(){
        alert('index');
    }