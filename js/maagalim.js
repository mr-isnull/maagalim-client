
Array.prototype.any = function(prop) {
    console.log('any function');
    for (var idx = 0; idx < this.length; ++idx) {
        if (this[idx][prop]) {
            return true;
        }
    }
    return false;
}

Array.prototype.all = function(prop) {
    console.log('all function');
    return !(this.any(prop));
}

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
    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 5 || date.getDay() === 6 ) );
    };

    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };
    $scope.opened = true;

    $scope.dateOptions = {
        'year-format': "'yyyy'",
        'starting-day': 0,
        'show-weeks': false
    };

    $scope.format = 'dd/MM/yyyy';
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
