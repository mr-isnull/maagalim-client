
var maagalimApp = angular.module('maagalimApp', ['ui.bootstrap', 'ui.router', 'blockUI'])
                         .run(function($rootScope, $state, userService) {
                                                $rootScope.$on("$stateChangeStart",
                                                    function(event, toState, toParams, fromState, fromParams) {
                                                        if (userService.getUser() === undefined && toState.name !== 'anonymous.login') {
                                                            console.log('coming from state ' + fromState.name + ' to state ' + toState.name);
                                                            event.preventDefault();
                                                            $state.go('anonymous.login');
                                                        }
                                                    });
                                                $rootScope.$on("$locationChangeSuccess",
                                                    function(next, current) {
                                                        //align master/details views according to content
                                                        if(angular.element('#master').children().length) {
                                                            angular.element('#master').removeClass('hidden-lg');
                                                            angular.element('#master').addClass('col-lg-2');

                                                            angular.element('#detail').removeClass('col-lg-10');
                                                            angular.element('#detail').addClass('col-lg-8');
                                                        } else {
                                                            angular.element('#master').removeClass('col-lg-2');
                                                            angular.element('#master').addClass('hidden-lg');

                                                            angular.element('#detail').removeClass('col-lg-8');
                                                            angular.element('#detail').addClass('col-lg-10');
                                                        }
                                                    });
                                             });

maagalimApp.config(
    function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        // login routes
        $stateProvider.state('anonymous', {abstract: true, views: {'topbar': {template: '<ui-view/>'}}, data: {access: 'anon'}})
                      .state('anonymous.login',  {url: '/login',  templateUrl: 'partials/login.html', controller: 'loginController'})
                      .state('anonymous.logout', {url: '/logout', template: '<ui-view/>', controller: 'logoutController'});


        $stateProvider.state('app',           {abstract: true,    views: {'topbar@':  {templateUrl: 'partials/topbar.html'}, 'sidemenu@': {templateUrl: 'partials/sidemenu.html'}},    data: {access: 'app'}})
                      .state('app.main',      {url: '/',          views: {'cont@': {templateUrl: 'partials/main.html',        controller: 'dashboardController'}}})
                      .state('app.wizard',    {url: '/wizard',    views: {'cont@': {templateUrl: 'partials/wizard.html'}},    controller: 'wizardController'})
                      .state('app.direction', {url: '/direction', views: {'master@': {templateUrl: 'partials/students.html'},'cont@': {templateUrl: 'partials/direction.html'}}, controller: 'directionController'});
    });

maagalimApp.config(function(blockUIConfigProvider) {
    blockUIConfigProvider.message('מתחבר...');
    blockUIConfigProvider.delay(1);

});

// some generic function for prototyping js objects

Number.prototype.pad = function(size) {
    var s = this + "";
    while (s.length < size) s = "0" + s;
    return s;
}

Date.prototype.string = function(with_time) {
    return this.getDate().pad(2) + '/' + (this.getMonth()+1).pad(2) + '/' + (this.getYear()+1900) +
           (with_time ? (' ' + this.getHours().pad(2) + ':' + this.getMinutes().pad(2) + ':' + this.getSeconds().pad(2)) : '');
}

Array.prototype.any = function(prop) {
    for (var idx = 0; idx < this.length; ++idx) {
        if (this[idx][prop]) {
            return true;
        }
    }
    return false;
}

Array.prototype.all = function(prop) {
    return !(this.any(prop));
}

function extend(base, sub) {
    // Avoid instantiating the base class just to setup inheritance
    // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
    // for a polyfill
    sub.prototype = Object.create(base.prototype);
    // Remember the constructor property was set wrong, let's fix it
    sub.prototype.constructor = sub;
    // In ECMAScript5+ (all modern browsers), you can make the constructor property
    // non-enumerable if you define it like this instead
    Object.defineProperty(sub.prototype, 'constructor', {
        enumerable: false,
        value: sub
    });
}

function parseDate(str){
    var d=0, m=0, y=0;
    var parsed = false;
    var t = str.match(/^(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})$/);
    if(t!==null){
        d=+t[1];
        m=+t[2];
        y=+t[3];
        parsed = true;
    }
    else {
        t = str.match(/^(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})$/);
        if(t!==null){
            d=+t[3];
            m=+t[2];
            y=+t[1];
            parsed = true;
        }
    }

    if (parsed) {
        var date = new Date(y,m-1,d);
        if(date.getFullYear()===y && date.getMonth()===m-1){
            return date;
        }
    }
    return null;
}

maagalimApp.directive('scrollSpy', function($timeout){
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
            var offset = parseInt(attr.scrollOffset, 10)
            if(!offset) offset = 10;
            console.log("offset:  " + offset);
            elem.scrollspy({ "offset" : offset});
            scope.$watch(attr.scrollSpy, function(value) {
                $timeout(function() {
                    elem.scrollspy('refresh', { "offset" : offset})
                }, 1);
            }, true);
        }
    }
});

maagalimApp.directive('preventDefault', function() {
    return function(scope, element, attrs) {
        jQuery(element).click(function(event) {
            event.preventDefault();
        });
    }
});

maagalimApp.directive("scrollTo", ["$window", function($window){
    return {
        restrict : "AC",
        compile : function(){

            function scrollInto(elementId) {
                if(!elementId) $window.scrollTo(0, 0);
                //check if an element can be found with id attribute
                var el = document.getElementById(elementId);
                if(el) el.scrollIntoView();
            }

            return function(scope, element, attr) {
                element.bind("click", function(event){
                    scrollInto(attr.scrollTo);
                });
            };
        }
    };
}]);
