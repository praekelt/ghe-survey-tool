var go = {};
go;

go.app = function() {
    var vumigo = require('vumigo_v02');
    var App = vumigo.App;
    var Choice = vumigo.states.Choice;
    var ChoiceState = vumigo.states.ChoiceState;
    var EndState = vumigo.states.EndState;
    var FreeText = vumigo.states.FreeText;


    var GoApp = App.extend(function(self) {
        App.call(self, 'states:start');
        var $ = self.$;

        self.states.add('states:start', function(name) {
            return new ChoiceState(name, {
                question: $('In order to continue receiving survey questions please Text 1 for Yes and 2 for No'),

                choices: [
                    new Choice('yes', 'Yes'),
                    new Choice('no', 'No')],

                next: function(choice) {
                    return {
                        yes: 'states:age',
                        no: 'states:end_no_consent'
                    } [choice.value];
                }
            });
        });

        self.states.add('states:age', function(name) {
            return new ChoiceState(name, {
                question: $('Are you older than 18 years? Text 1 for Yes and 2 for No'),

                choices: [
                    new Choice('yes', 'Yes'),
                    new Choice('no', 'No')],

                next: function(choice) {
                    return {
                        yes: 'states:language',
                        no: 'states:end_under_age'
                    } [choice.value];
                }
            });
        });

        self.states.add('states:language', function(name) {
            return new ChoiceState(name, {
                question: $('What is your preferred language? Text 1 for English, 2 for Amharic and 3 for ኣማርኛ'),

                choices: [
                    new Choice('english', 'English'),
                    new Choice('amharic', 'Amharic'),
                    new Choice('ኣማርኛ', 'ኣማርኛ')],

                next: function(choice) {
                    return 'states:gender';
                }
            });
        });

        self.states.add('states:gender', function(name) {
            return new ChoiceState(name, {
                question: $('What is your gender? Test 1 for Male and 2 for Female'),

                choices: [
                    new Choice('male', 'Male'),
                    new Choice('female', 'Female')],

                next: function(choice) {
                    return 'states:group_name';
                }
            });
        });

        self.states.add('states:group_name', function(name) {
            return new FreeText(name, {
                question: $('Please enter your Listener Group Name'),

                next: function(content) {
                    return 'states:group_type';
                }
            });
        });

        self.states.add('states:group_type', function(name) {
            return new ChoiceState(name, {
                question: $('What is your group type? Text 1 for Mixed group, 2 or Girls only and 3 for Gatekeepers'),

                choices: [
                    new Choice('mixed', 'Mixed'),
                    new Choice('girls_only', 'Girls Only'),
                    new Choice('gatekeepers', 'Gatekeepers')],

                next: function(choice) {
                    return 'states:end_registered';
                }
            });
        });

        // End State 1 - no consent
        self.states.add('states:end_no_consent', function(name) {
            return new EndState(name, {
                text: $('Thank you, you will not receive any survey questions.'),
                next: 'states:start'
            });
        });

        // End State 2 - age not 18
        self.states.add('states:end_under_age', function(name) {
            return new EndState(name, {
                text: $('Thank you. Unfortunately, you are too young to partake in the surveys.'),
                next: 'states:start'
            });
        });

        // End State 3 - successful registration
        self.states.add('states:end_registered', function(name) {
            return new EndState(name, {
                text: $('Thank you. You are now registered to receive survey questions.'),
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
