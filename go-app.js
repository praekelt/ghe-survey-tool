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
                        yes: 'states:language',
                        no: 'states:end_no_consent'
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
                    return 'states:age';
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
