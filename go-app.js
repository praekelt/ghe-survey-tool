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

        self.init = function() {
            return self.im.contacts
                .for_user()
                .then(function(user_contact) {
                   self.contact = user_contact;
                });
        };


        // S1
        self.states.add('states:start', function(name, opts) {
            var valid = ['1', '2'];

            var error = $('Sorry, your choice was not valid. In order to continue receiving survey questions please Text 1 for Yes and 2 for No');
            var question = $('In order to continue receiving survey questions please Text 1 for Yes and 2 for No');

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

            var lang_map = {
                '1': 'en',
                '2': 'am1',
                '3': 'am2'
            };

            var error = $('Sorry, your choice was not valid. What is your preferred language? Text 1 for English, 2 for Amharic and 3 for ኣማርኛ');
            var question = $('What is your preferred language? Text 1 for English, 2 for Amharic and 3 for ኣማርኛ');

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!_.contains(valid, content.trim())) {
                        return error;
                    }
                },

                next: function(content) {
                    return self.im.user.set_lang(lang_map[content])
                        .then(function() {
                            return 'states:age';
                        });
                }
            });
        });

        // S3
        self.states.add('states:age', function(name, opts) {
            var valid = ['1', '2'];

            var error = $('Sorry, your choice was not valid. Are you older than 18 years? Text 1 for Yes and 2 for No');
            var question = $('Are you older than 18 years? Text 1 for Yes and 2 for No');

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
            var question = $('What is your gender? Text 1 for Male and 2 for Female');

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!_.contains(valid, content.trim())) {
                        return error;
                    }
                },

                next: function(content) {
                    return 'states:group_id';
                }
            });
        });

        // S5
        self.states.add('states:group_id', function(name, opts) {
            var num_listener_groups = _.size(self.im.config.group_id); // better than hardcoding, but can fall over if a group is deleted
            var valid = [];

            for (var i = 1; i <= num_listener_groups; i++) {
                valid.push(i.toString());
            }

            var error = $('Sorry, your choice was not valid. Please enter your Listener Group Name');
            var question = $('Please enter your Listener Group Name');

            return new FreeText(name, {
                question: question,

                check: function(content) {
                    if (!_.contains(valid, content.trim())) {
                        return error;
                    }
                },

                next: function(content) {
                    // set answers against contact extras
                    self.contact.extra.user_language = self.im.user.answers['states:language'];
                    self.contact.extra.user_age = self.im.user.answers['states:age'];
                    self.contact.extra.user_gender = self.im.user.answers['states:gender'];
                    self.contact.extra.group_id = self.im.user.answers['states:group_id'];

                    // look up group info and set against contact extras
                    self.contact.extra.group_type = self.im.config.group_id[content].group_type;
                    self.contact.extra.group_name = self.im.config.group_id[content].group_name;
                    self.contact.extra.urban_rural = self.im.config.group_id[content].urban_rural;

                    return self.im.groups.get(self.contact.extra.group_type)
                        .then(function(group) {
                            self.contact.groups.push(group.key);
                            return self.im.groups.get("registered")
                                .then(function(reg_group){
                                    self.contact.groups.push(reg_group.key);
                                    return self.im.contacts.save(self.contact)
                                        .then(function() {
                                            return 'states:end_registered';
                                        });
                                });
                        });
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
