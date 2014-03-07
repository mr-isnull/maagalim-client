
var controllers = angular.module('controllers', []);

controllers.controller('dashboardController', function($scope, $http) {
    console.log('dashboardController init called');
    var students = {};

    Class = function(id, age, school, number, studentsCount) {
        this.id = id;
        this.age = age;
        this.school = school;
        this.number = number;
        this.studentsCount = studentsCount;
    }

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

controllers.controller('userController', function($scope, $http) {
    console.log('userController init called');
    $scope.guider = {lastName: 'כהן', firstName: 'משה', id: 1234};

    var messages = [{id: 1234, from: 'דוד', time: new Date(), message: 'מי שלח אותך?', seen: true},
                    {id: 4321, from: 'משה', time: new Date(), message: 'מה עם הדוחות?', seen: true}];

    $scope.messages = messages;
});

controllers.controller('wizardController', function($scope) {
    console.log('wizardController created');

    var wizard_steps = [];

    WizardStep = function(name, predecessors) {
        this.name = name;
        this.predecessors = predecessors;
        this.percentage = 0;
        this.complete = function() {
            return this.percentage == 100;
        };
    }

    WizardDatesStep = function() {
        WizardStep.call(this, 'Dates', []);
        var self = this;

        this.STEP_TOTAL_FIELDS = 2;
        this.wizard_date = undefined;
        this.wizard_class = undefined;

        this.today = function() {
            this.wizard_date = new Date();
        };

        // Disable weekend selection
        this.disabled = function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 5 || date.getDay() === 6 ) );
        };

        this.openDate = function($event) {
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

        this.change = function() {
            console.log('change dates...');
            var filled = 0;
            if (self.wizard_date) {
                filled++;
            }
            if (self.wizard_class) {
                filled++;
            }
            var percentage = Math.round((filled / self.STEP_TOTAL_FIELDS) * 100);
            self.percentage = percentage;
            wizard_changed();
        }
    }

    WizardHoursStep = function() {
        WizardStep.call(this, 'Hours', ['Dates']);
        var self = this;

        this.STEP_TOTAL_FIELDS = 1;
        this.wizard_hours = undefined;
        this.change = function() {
            console.log('hours change...');
            var filled = 0;
            if (self.wizard_hours) {
                filled++;
            }
            var percentage = Math.round((filled / self.STEP_TOTAL_FIELDS) * 100);
            self.percentage = percentage;
            wizard_changed();
        }
    }

    extend(WizardStep, WizardDatesStep);
    extend(WizardStep, WizardHoursStep);

    var dates_step = new WizardDatesStep();
    $scope.dates = dates_step;
    $scope.$watch('dates', dates_step.change, true);

    var hours_step = new WizardHoursStep();
    $scope.hours = hours_step;
    $scope.$watch('hours', hours_step.change, true);

    $scope.wizard_steps = wizard_steps;
    $scope.wizard_steps.push(dates_step);
    $scope.wizard_steps.push(hours_step);

    var find_step = function(name) {
        for (var idx = 0; idx < $scope.wizard_steps.length; ++idx) {
            if ($scope.wizard_steps[idx].name == name) {
                return $scope.wizard_steps[idx];
            }
        }
    }

    $scope.wizard_percentage = 0;
    var wizard_changed = function() {
        $scope.wizard_percentage = 0;
        $.each(wizard_steps, function(index, step) {
            $scope.wizard_percentage += (step.percentage / wizard_steps.length);
            var enabled = true;
            $.each(step.predecessors, function(index, pre_step_name) {
                var pre_step = find_step(pre_step_name);
                if (pre_step && pre_step.complete() == false) {
                    enabled = false;
                }
            });
            if (enabled) {
                $('div [step="' + step.name + '"]').find('*').prop('disabled',false);
                $('div [step="' + step.name + '"]').css('background-color', '').fadeTo(200, 1);
            }
            else {
                $('div [step="' + step.name + '"]').find('*').prop('disabled',true);
                $('div [step="' + step.name + '"]').css('background-color', 'gray').fadeTo(200, 0.3);
            }
        });
    }
    $scope.wizard_progress_color = $scope.wizard_percentage > 10 ? '#ffffff' : '#000000';
    var progress_types = {30: 'danger', 50: 'warning', 90: 'primary', 100: 'success'};
    $scope.wizard_progress_type = function() {
        bot_range = 0;
        for (up_range in progress_types) {
            if ($scope.wizard_percentage > bot_range && $scope.wizard_percentage <= up_range) {
                return progress_types[up_range];
            }
            bot_range = up_range;
        }
        return progress_types[0];
    }

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
    return this.getDay().pad(2) + '/' + (this.getMonth()+1).pad(2) + '/' + (this.getYear()+1900) +
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

