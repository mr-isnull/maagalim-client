
var controllers = angular.module('controllers', []);

controllers.controller('dashboardController', function($scope, $http) {
    console.log('dashboardController init called');

    $http.get('/_Details/_Dashboard')
         .success(function(data) {
             $scope.classes = data.classes;
             $.each($scope.classes, function(item, value) {
                 $scope.studentsCount += value.studentsCount;
             });
             $scope.totalConvsCount = data.totalConvsCount;
             $scope.totalActivities = data.totalActivities;
             $scope.totalHours = data.totalHours;
             $scope.guidance = data.guidance;
         })
        .error(function(data, status) {
             console.error('ERROR while lodaing dashboard ' + data + ' status: ' + status);
         });

    $scope.classes = undefined;

    $scope.studentsCount = 0;

    $scope.totalConvsCount = 0;

    $scope.totalActivities = 0;

    $scope.totalHours = 0;

    $scope.features = [];
    $scope.addFeature = function(title, number, bullets) {
        $scope.features.push({
            image: '../img/',
            title: title,
            mainNumber: number,
            bullets: bullets
        });
    };

    $scope.addFeature('שיחות אישיות', '4', []);
    $scope.addFeature('פעילויות', '2', []);
    $scope.addFeature('הכוון', '5', ['דגש לגבי מילוי החודש']);
    $scope.addFeature('נעילת חודש', '72%', ['קצת פירוט על מה חסר', 'ומה דרוש להשלמה']);
});

controllers.controller('userController', function ($scope) {
    console.log('userController init called');
    $scope.guider = {lastName: 'כהן', firstName: 'משה', id: 1234};

    $scope.messages = [
        {id: 1234, from: 'דוד', time: new Date(), message: 'מי שלח אותך?', seen: true},
        {id: 4321, from: 'משה', time: new Date(), message: 'מה עם הדוחות?', seen: true}
    ];
});

controllers.controller('wizardController', function ($scope, $timeout, $location, $anchorScroll) {
    console.log('wizardController created');

    $scope.goto = function(id) {
        console.log('scrolling to id ' + id);
        $location.hash(id);
        $anchorScroll();
    };

    var wizard_steps = [];

    var WizardStep = function (name, predecessors) {
        this.name = name;
        this.predecessors = predecessors;
        this.percentage = 0;
        this.complete = function () {
            return this.percentage == 100;
        };
    };

    var WizardDatesStep = function () {
        WizardStep.call(this, 'Dates', []);
        var self = this;

        this.STEP_TOTAL_FIELDS = 2;
        this.wizard_date = undefined;
        this.wizard_class = undefined;

        this.today = function () {
            this.wizard_date = new Date();
        };

        // Disable weekend selection
        this.disabled = function (date, mode) {
            return ( mode === 'day' && ( date.getDay() === 5 || date.getDay() === 6 ) );
        };

        this.openDate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            this.date_opened = true;
        };
        this.date_opened = false;

        this.date_options = {
            'year-format': "'yyyy'",
            'starting-day': 0,
            'show-weeks': false
        };

        this.date_format = 'dd/MM/yyyy';

        this.change = function () {
            console.log('change dates...');
            var filled = 0;
            if (self.wizard_date)  filled++;
            if (self.wizard_class) filled++;
            self.percentage = Math.round((filled / self.STEP_TOTAL_FIELDS) * 100);
        }
    };

    var WizardHoursStep = function () {
        WizardStep.call(this, 'Hours', ['Dates']);
        var self = this;

        this.wizard_hours = undefined;
        this.wizard_km = undefined;
        this.wizard_trans = undefined;
        this.wizard_other_refunds = undefined;
        this.wizard_other_refunds_notes = '';

        this.STEP_TOTAL_FIELDS = 4;
        this.change = function () {
            console.log('hours change...');
            var filled = 0;
            if (self.wizard_hours || self.wizard_hours == 0)         filled++;
            if (self.wizard_km || self.wizard_km == 0)            filled++;
            if (self.wizard_trans || self.wizard_trans == 0)         filled++;
            if (self.wizard_other_refunds || self.wizard_other_refunds == 0) {
                if (self.wizard_other_refunds == 0) {
                    filled++;
                }
                else {
                    if (self.wizard_other_refunds_notes && self.wizard_other_refunds_notes.trim() != '') {
                        filled++;
                    }
                }
            }
            self.percentage = Math.round((filled / self.STEP_TOTAL_FIELDS) * 100);
        }
    }

    extend(WizardStep, WizardDatesStep);
    extend(WizardStep, WizardHoursStep);

    var dates_step = new WizardDatesStep();
    $scope.dates = dates_step;
    $scope.$watch('dates', function() {
        dates_step.change();
        $scope.wizard_changed();
    }, true);

    var hours_step = new WizardHoursStep();
    $scope.hours = hours_step;
    $scope.$watch('hours', function() {
        hours_step.change();
        $scope.wizard_changed();
    }, true);

    $scope.wizard_steps = wizard_steps;
    $scope.wizard_steps.push(dates_step);
    $scope.wizard_steps.push(hours_step);

    var find_step = function (name) {
        for (var idx = 0; idx < $scope.wizard_steps.length; ++idx) {
            if ($scope.wizard_steps[idx].name == name) {
                return $scope.wizard_steps[idx];
            }
        }
        return undefined;
    };

    $scope.wizard_percentage = 0;
    $scope.wizard_changed = function () {
        var percentage = 0;
        $.each(wizard_steps, function (index, step) {
            percentage += (step.percentage / wizard_steps.length);
            var enabled = true;
            $.each(step.predecessors, function (index, pre_step_name) {
                var pre_step = find_step(pre_step_name);
                if (pre_step && pre_step.complete() == false) {
                    enabled = false;
                }
            });
            var step_selector = 'div [step="' + step.name + '"]';
            if (enabled) {
                $(step_selector).find('*').prop('disabled', false);
                $(step_selector).css('background-color', '').fadeTo(200, 1);
            }
            else {
                $(step_selector).find('*').prop('disabled', true);
                $(step_selector).css('background-color', 'gray').fadeTo(200, 0.3);
            }
        });
        $scope.wizard_percentage = percentage;
        console.log('$scope.wizard_percentage = ' + $scope.wizard_percentage);
        $scope.wizard_progress_color = percentage > 10 ? '#ffffff' : '#000000';
        //$scope.wizard_progress_type = calc_wizard_progress_type(percentage);
    };

    var progress_types = {30: 'danger', 50: 'warning', 90: 'primary', 100: 'success'};
    $scope.calc_wizard_progress_type = function() {
        var bot_range = -1;
        for (var up_range in progress_types) {
            if ($scope.wizard_percentage > bot_range && $scope.wizard_percentage <= up_range) {
                console.log('in range - wizard_progress_type() return ' + progress_types[up_range]);
                return progress_types[up_range];
            }
            bot_range = up_range;
        }
        console.log('not in range - wizard_progress_type() return ' + progress_types[30]);
        return progress_types[30];
    }
    //$timeout(function() { console.log('changing %...'); $scope.wizard_changed();}, 1);

//    dates_step.wizard_date = new Date();
//    dates_step.wizard_class = 'כיתה א';
//    hours_step.wizard_other_refunds = 2;

});

controllers.controller('directionController', function($scope) {
    console.log('directionController created');

    var shvatVisits = [{inst:"קרני שומרון" , feedback : "היה מוצלח"},
                        {inst: "ישיבת תל אביב", feedback : "היה מעפן"}];

    var adarVisits = [{inst: "עלי", feedback : "היה מאוד מוצלח, נראה שזה המקום"}];

    $scope.visits = {shvat : shvatVisits , adar : adarVisits};
});

var maagalimApp = angular.module('maagalimApp', ['ngRoute', 'ui.bootstrap', 'controllers']);

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

