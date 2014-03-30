
var maagalimApp = angular.module('maagalimApp', ['ngRoute', 'ui.bootstrap']);

maagalimApp.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {templateUrl: 'partials/main.html', controller: 'dashboardController' })
            .when('/wizard', {templateUrl: 'partials/wizard.html', controller: 'wizardController'})
            .when('/direction', {templateUrl: 'partials/direction.html', controller: 'directionController'});
        $locationProvider.html5Mode(true);
    }]);

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
