
maagalimApp.service('connection', function($http) {
    var self = this;
    this.base_url = 'http://maagalimdev.prinz.co.il';

    this.get = function(url, success, error) {
        $http({
            method: 'GET',
            url: self.base_url + '/' + url,
            withCredentials: true
        })
        .success(function(data) {
            if (success) {
                success(data);
            };
        })
        .error(function(data) {
            if (error) {
                error(data);
            }
        });

    };

    this.post = function(url, data, success, error) {
        var postish_data = $.param(data);
        $http({
            method: 'POST',
            url: self.base_url + '/' + url,
            data: postish_data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            withCredentials: true
        })
        .success(function(data) {
            if (success) {
                success(data);
            };
        })
        .error(function(data) {
            if (error) {
                error(data);
            }
        });
    };
});

maagalimApp.service('userService', function($http, $window, connection) {
    console.log('user service init...');
    var self = this;
    this.login = function(username, password, success, error) {
        console.log('userSerivce: login ' + username);
        var creds = {username: username, password: password, year: 2013};
        connection.post('/_Account/_Login', creds, function(data){
            console.log('got ' + data.status + ' as response...');
            var id = data.status;
            if (data.status > 0) {
                connection.get('/_Account/_WhoAmI', function(data){
                    data[id] = data.status;
                    $window.sessionStorage.user = JSON.stringify(data);
                    if (success) {
                        success(self.getUser());
                    }
                });
            }
        });
    }

    this.getUser = function() {
        if ($window.sessionStorage.user) {
            return $.parseJSON($window.sessionStorage.user);
        }
    }
});

maagalimApp.service('wizardService', function() {
    var self = this;
    this.wizard_steps = [];

    var WizardStep = function (name, predecessors) {
        var self = this;
        this.name = name;
        this.predecessors = predecessors;
        this.percentage = 0;
        this.errors = [];
        this.complete = function () {
            return this.percentage == 100;
        };
        this.update_errors = function(is_error, field, title) {
            if (is_error) {
                self[field+'_error'] = title;
                self.errors.push({title: title, field: field});
                return 0;
            }
            else {
                self[field+'_error'] = '';
                return 1;
            }
        };
    };

    var WizardDatesStep = function () {
        WizardStep.call(this, 'Dates', []);
        var self = this;

        this.STEP_TOTAL_FIELDS = 2;
        this.wizard_date = undefined;
        this.wizard_class = undefined;
        this.errors = [];

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
            self.errors = [];
            filled += self.update_errors((!self.wizard_date),  'wizard_date', 'חובה למלא תאריך');
            filled += self.update_errors((!self.wizard_class), 'wizard_class', 'חובה לבחור כיתה');
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
            self.errors = [];
            if (self.wizard_hours || self.wizard_hours == 0)         filled++; else self.errors.push({title: "חובה למלא ערך במס' שעות (אפילו 0)", field: self.wizard_hours});
            if (self.wizard_km    || self.wizard_km == 0)            filled++; else self.errors.push({title: "חובה למלא ערך במס' ק\"מ (אפילו 0)", field: self.wizard_km});
            if (self.wizard_trans || self.wizard_trans == 0)         filled++; else self.errors.push({title: "חובה למלא ערך בנסיעות (אפילו 0)", field: self.wizard_trans});
            if (self.wizard_other_refunds || self.wizard_other_refunds == 0) {
                if (self.wizard_other_refunds == 0) {
                    filled++;
                }
                else {
                    if (self.wizard_other_refunds_notes && self.wizard_other_refunds_notes.trim() != '') {
                        filled++;
                    }
                    else {
                        self.errors.push({title: "במידה ושונות אינו 0, חובה למלא סיבה", field: self.wizard_other_refunds_notes});
                    }
                }
            }
            else {
                self.errors.push({title: "חובה למלא ערך בשונות (אפילו 0)", field: self.wizard_other_refunds});
            }
            self.percentage = Math.round((filled / self.STEP_TOTAL_FIELDS) * 100);
        }
    }

    extend(WizardStep, WizardDatesStep);
    extend(WizardStep, WizardHoursStep);

    this.initWizard = function() {
        self.dates_step = new WizardDatesStep();
        self.hours_step = new WizardHoursStep();
        self.wizard_steps.push(self.dates_step);
        self.wizard_steps.push(self.hours_step);

        self.dates_step.wizard_date = new Date();
        self.dates_step.wizard_class = 'כיתה א';

        self.hours_step.wizard_hours = 4;
        self.hours_step.wizard_km = 10;
        self.hours_step.wizard_trans = 0;
        self.hours_step.wizard_other_refunds = 2;
        self.hours_step.wizard_other_refunds_notes = 'סתם ככה';

        self.dates_step.change();
        self.hours_step.change();
    }

     this.find_step = function(name) {
        for (var idx = 0; idx < self.wizard_steps.length; ++idx) {
            if (self.wizard_steps[idx].name == name) {
                return self.wizard_steps[idx];
            }
        }
        return undefined;
    };
});
