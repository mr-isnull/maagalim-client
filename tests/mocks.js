var maagalimDev = angular.module('maagalimDev', ['maagalimApp', 'ngMockE2E']);
maagalimDev.run(function($httpBackend) {
    var classes = [{id: 1, age: 'יב', school: 'אמית טבריה', number: '1', studentsCount: 22},
                   {id: 2, age: 'יא', school: 'אמית טבריה', number: '2ב', studentsCount: 29}];

    var dashboard = {classes: classes,
                     totalConvsCount: {month: 4, total: 12},
                     totalActivities: {month: 2, total: 7},
                     totalHours: {month: 3, total: 19},
                     guidance: {month: 5, total: 20}};

    function globalGetStudents(method, url, data, headers) {
        var groups = /\/api\/classes\/\d+\/students/.match(url);
        var classId = groups[1];
        console.log('classId = ' + classId);
        switch(classId) {
            case 1: return {status: 200, data: [{lastName: 'לפיד', firstName: 'יאיר'}, {lastName: 'נתניהו', firstName: 'בנימין'}, {lastName: 'בנט', firstName: 'נפתלי'}]};
            case 2: return {status: 200, data: [{lastName: 'דרעי', firstName: 'אריה'}, {lastName: 'ליברמן', firstName: 'אביגדור'}, {lastName: 'אורבך', firstName: 'אורי'}]};

            default: return {status: 200, data: []};
        }
    }

    $httpBackend.whenGET('/_Details/_Dashboard').respond(200, dashboard);

    $httpBackend.whenGET('/api/guider/classes/\d+/students').respond(globalGetStudents);

    $httpBackend.whenGET('/api/guider/classes/').respond(200, classes);

    $httpBackend.whenGET('/api/guider/personalConvs/$count').respond(200, 5);

    $httpBackend.whenGET(/\/.*/).passThrough();

    $httpBackend.whenGET(/.*maagalimdev\.prinz\.co\.il\/.*/).passThrough();
    $httpBackend.whenPOST(/.*maagalimdev\.prinz\.co\.il\/.*/).passThrough();
});