
maagalimApp.controller('loginController', function($scope, $rootScope, $state, userService) {
    console.log('login controller init called');
    $scope.login = function() {
        if (!$scope.username || !$scope.password) {
            return;
        }
        console.log('do login for username ' + $scope.username);
        var user = userService.login($scope.username, $scope.password,
            function(user) {
                if (user !== undefined)  {
                    $rootScope.loggedIn = user;
                    $state.go('app.main');
                }
            });
    }
});

maagalimApp.controller('logoutController', function($scope, $state, $window) {
    delete $window.sessionStorage.user;
    $state.go('anonymous.login');
});

maagalimApp.controller('dashboardController', function($scope, $http) {
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

maagalimApp.controller('userController', function ($scope, userService) {
    console.log('userController init called');
    $scope.guider = userService.getUser();

    $scope.full_name = function() {
        console.log('full name called')
        return $scope.guider.firstName;
    }

    $scope.messages = [
        {id: 1234, from: 'דוד', time: new Date(), message: 'מי שלח אותך?', seen: true},
        {id: 4321, from: 'משה', time: new Date(), message: 'מה עם הדוחות?', seen: true}
    ];
});

maagalimApp.controller('wizardController', function ($scope, $timeout, $location, $anchorScroll, wizardService) {
    console.log('wizardController created');

    if (!$location.hash()) {
        wizardService.initWizard();
    }

    $scope.dates = wizardService.dates_step;
    $scope.$watch('dates', function() {
        wizardService.dates_step.change();
        $scope.wizard_changed();
    }, true);

    $scope.hours = wizardService.hours_step;
    $scope.$watch('hours', function() {
        wizardService.hours_step.change();
        $scope.wizard_changed();
    }, true);


    $scope.wizard_changed = function () {
        var percentage = 0;
        var all_errors = [];
        $.each(wizardService.wizard_steps, function (index, step) {
            percentage += (step.percentage / wizardService.wizard_steps.length);
            Array.prototype.push.apply(all_errors, step.errors);
            var enabled = true;
            $.each(step.predecessors, function (index, pre_step_name) {
                var pre_step = wizardService.find_step(pre_step_name);
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
        $scope.wizard_errors = all_errors;
        console.log('$scope.wizard_percentage = ' + $scope.wizard_percentage);
        $scope.wizard_progress_color = percentage > 10 ? '#ffffff' : '#000000';
    };
    $scope.wizard_changed();

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

    $scope.error_list_open = false;
});

maagalimApp.controller('directionController', function($scope) {
    console.log('directionController created');

    var shvatVisits = [{inst:"קרני שומרון" , feedback : "היה מוצלח"},
        {inst: "ישיבת תל אביב", feedback : "היה מעפן"}];

    var adarVisits = [{inst: "עלי", feedback : "היה מאוד מוצלח, נראה שזה המקום"}];

    $scope.visits = {shvat : shvatVisits , adar : adarVisits};
});

