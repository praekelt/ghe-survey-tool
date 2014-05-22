var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var AppTester = vumigo.AppTester;


describe("app", function() {
    describe("GoApp", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();

            tester = new AppTester(app);

            tester
                .setup.char_limit(160)
                .setup.config.app({
                    name: 'test_app'
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("S0a. when the user starts a session", function() {
            it("should ask if they want to receive survey questions", function() {
                return tester
                    .start()
                    .check.interaction({
                        state: 'states:start',
                        reply: 'In order to continue receiving survey questions please Text 1 for Yes and 2 for No'
                    })
                    .run();
            });
        });

        describe("S1a. when the user chooses not to receive survey questions", function() {
            it("should thank them and end registration process", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('2')
                    .check.interaction({
                        state: 'states:end_no_consent',
                        reply: 'Thank you for reaching out to Yegna Listener Group Registration Survey'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("S1b. when the user gives consent to receive survey questions", function() {
            it("should ask for their preferred language", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('1')
                    .check.interaction({
                        state: 'states:language',
                        reply: 'What is your preferred language? Text 1 for English, 2 for Amharic and 3 for ኣማርኛ'
                    })
                    .run();
            });
        });

        describe("S2a. after the user has selected their language", function() {
            it("should ask about their age", function() {
                return tester
                    .setup.user.state('states:language')
                    .input('1')
                    .check.interaction({
                        state: 'states:age',
                        reply: 'Are you older than 18 years? Text 1 for Yes and 2 for No'
                    })
                    .run();
            });
        });

        describe("S2b. if the user's language choice does not validate", function() {
            it("should ask for their language again", function() {
                return tester
                    .setup.user.state('states:language')
                    .input('english')
                    .check.interaction({
                        state: 'states:language',
                        reply: 'Sorry, your choice was not valid. Preferred language? For English text the number 1, for Amharic text the number 2, for ኣማርኛ text the number 3'
                    })
                    .run();
            });
        });

        describe("S3a. after the user has indicated their age", function() {
            it("should ask for their gender", function() {
                return tester
                    .setup.user.state('states:age')
                    .input('2')
                    .check.interaction({
                        state: 'states:gender',
                        reply: 'What is your gender? Text 1 for Male and 2 for Female'
                    })
                    .run();
            });
        });

        describe("S3b. if the user's age choice does not validate", function() {
            it("should ask for their age again", function() {
                return tester
                    .setup.user.state('states:age')
                    .input('3')
                    .check.interaction({
                        state: 'states:age',
                        reply: 'Sorry, your choice was not valid. 18 or older? Text the number 1. Younger than 18? Text the number 2.'
                    })
                    .run();
            });
        });

        describe("S4a. after the user has selected their gender", function() {
            it("should ask for their Listener Group Name", function() {
                return tester
                    .setup.user.state('states:gender')
                    .input('2')
                    .check.interaction({
                        state: 'states:group_name',
                        reply: 'Please enter your Listener Group Name'
                    })
                    .run();
            });
        });

        describe("S4b. if the user's gender choice does not validate", function() {
            it("should ask for their gender again", function() {
                return tester
                    .setup.user.state('states:gender')
                    .input('3')
                    .check.interaction({
                        state: 'states:gender',
                        reply: 'Sorry, your choice was not valid. Are you male? Text the number 1. Are you female? Text the number 2'
                    })
                    .run();
            });
        });

        describe("S5a. after the user has entered their group name", function() {
            it("should thank them and end registration process", function() {
                return tester
                    .setup.user.state('states:group_name')
                    .input('35')
                    .check.interaction({
                        state: 'states:end_registered',
                        reply: 'Thank you! You are now registered as a member of the Yegna Listener Group. Please share your feedback with us every week. Your input is very important to us.'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("S5b. if the user's group name choice does not validate", function() {
            it("should ask for their group name again", function() {
                return tester
                    .setup.user.state('states:group_name')
                    .input('36')
                    .check.interaction({
                        state: 'states:group_name',
                        reply: 'Sorry, your choice was not valid. Please enter your Listener Group Name (number) again'
                    })
                    .run();
            });
        });
    });
});
