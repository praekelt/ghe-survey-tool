var go = {};
go;

go.app = function() {
    var vumigo = require('vumigo_v02');
    var _ = require('lodash');
    var App = vumigo.App;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'states:start');
        var $ = self.$;

        // S1
        self.states.add('states:start', function(name, opts) {
            var valid = ['1', '2'];

            var error = $('Sorry, your choice was not valid. In order to continue receiving survey questions please Text 1 for Yes and 2 for No');

            var question;
            if (!opts.retry) {
                question = $('In order to continue receiving survey questions please Text 1 for Yes and 2 for No');
            } else {
                question = error;
            }

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!_.contains(valid, content.trim())) {
                        return error;
                    }
                },

                next: function(content) {
                    return {
                        '1': 'states:language',
                        '2': 'states:end_no_consent'
                    } [content.trim()];
                }
            });
        });

        // S2
        self.states.add('states:language', function(name, opts) {
            var valid = ['1', '2', '3'];

            var error = $('Sorry, your choice was not valid. What is your preferred language? Text 1 for English, 2 for Amharic and 3 for ኣማርኛ');

            var question;
            if (!opts.retry) {
                question = $('What is your preferred language? Text 1 for English, 2 for Amharic and 3 for ኣማርኛ');
            } else {
                question = error;
            }

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!_.contains(valid, content.trim())) {
                        return error;
                    }
                },

                next: function(content) {
                    return 'states:age';
                }
            });
        });

        // S3
        self.states.add('states:age', function(name, opts) {
            var valid = ['1', '2'];

            var error = $('Sorry, your choice was not valid. Are you older than 18 years? Text 1 for Yes and 2 for No');

            var question;
            if (!opts.retry) {
                question = $('Are you older than 18 years? Text 1 for Yes and 2 for No');
            } else {
                question = error;
            }

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!_.contains(valid, content.trim())) {
                        return error;
                    }
                },

                next: function(content) {
                    return 'states:gender';
                }
            });
        });

        // S4
        self.states.add('states:gender', function(name, opts) {
            var valid = ['1', '2'];

            var error = $('Sorry, your choice was not valid. What is your gender? Text 1 for Male and 2 for Female');

            var question;
            if (!opts.retry) {
                question = $('What is your gender? Text 1 for Male and 2 for Female');
            } else {
                question = error;
            }

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!_.contains(valid, content.trim())) {
                        return error;
                    }
                },

                next: function(content) {
                    return 'states:group_name';
                }
            });
        });

        // S5
        self.states.add('states:group_name', function(name, opts) {
            var num_listener_groups = 35;
            var valid = [];

            for (var i = 1; i <= num_listener_groups; i++) {
                valid.push(i.toString());
            }
            
            var error = $('Sorry, your choice was not valid. Please enter your Listener Group Name');

            var question;
            if (!opts.retry) {
                question = $('Please enter your Listener Group Name');
            } else {
                question = error;
            }

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!_.contains(valid, content.trim())) {
                        return error;
                    }
                },

                next: function(content) {
                    return 'states:end_registered';
                }
            });
        });

        // End State 1 - no consent
        self.states.add('states:end_no_consent', function(name) {
            return new EndState(name, {
                text: $('Thank you for reaching out to Yegna Listener Group Registration Survey'),
                next: 'states:start'
            });
        });

        // End State 2 - successful registration
        self.states.add('states:end_registered', function(name) {
            return new EndState(name, {
                text: $('Thank you! You are now registered as a member of the Yegna Listener Group. Please share your feedback with us every week. Your input is very important to us.'),
                next: 'states:start'
            });
        });
    });

    return {
        GoApp: GoApp
    };
}();

go.init = function() {
    var vumigo = require('vumigo_v02');
    var InteractionMachine = vumigo.InteractionMachine;
    var GoApp = go.app.GoApp;


    return {
        im: new InteractionMachine(api, new GoApp())
    };
}();
