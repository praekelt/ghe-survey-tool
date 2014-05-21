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
                .setup.config.app({
                    name: 'test_app'
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                });
        });

        describe("1. when the user starts a session", function() {
            it("should ask if they want to receive survey questions", function() {
                return tester
                    .start()
                    .check.interaction({
                        state: 'states:start',
                        reply: 'In order to continue receiving survey questions please Text 1 for Yes and 2 for No\n1. Yes\n2. No'
                        //askmike: using choice state generates new lines
                    })
                    .run();
            });
        });

        describe("2. when the user chooses not to receive survey questions", function() {
            it("should thank them and end registration process", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('2')
                    .check.interaction({
                        state: 'states:end_no_consent',
                        reply: 'Thank you, you will not receive any survey questions.'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("3. when the user gives consent to receive survey questions", function() {
            it("should ask if they are older than 18", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('1')
                    .check.interaction({
                        state: 'states:age',
                        reply: 'Are you older than 18 years? Text 1 for Yes and 2 for No\n1. Yes\n2. No'
                    })
                    .run();
            });
        });

        describe("4. when the user is younger than 18", function() {
            it("should thank them and end registration process", function() {
                return tester
                    .setup.user.state('states:age')
                    .input('2')
                    .check.interaction({
                        state: 'states:end_under_age',
                        reply: 'Thank you. Unfortunately, you are too young to partake in the surveys.'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("5. when the user is older than 18", function() {
            it("should ask for their preferred language", function() {
                return tester
                    .setup.user.state('states:age')
                    .input('1')
                    .check.interaction({
                        state: 'states:language',
                        reply: 'What is your preferred language? Text 1 for English, 2 for Amharic and 3 for ኣማርኛ\n1. English\n2. Amharic\n3. ኣማርኛ'
                    })
                    .run();
            });
        });

        describe("6. after the user has selected their language", function() {
            it("should ask for their gender", function() {
                return tester
                    .setup.user.state('states:language')
                    .input('3')
                    .check.interaction({
                        state: 'states:gender',
                        reply: 'What is your gender? Test 1 for Male and 2 for Female\n1. Male\n2. Female'
                    })
                    .run();
            });
        });

        describe("7. after the user has selected their gender", function() {
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

        describe("8. after the user has entered their LG name", function() {
            it("should ask for their group type", function() {
                return tester
                    .setup.user.state('states:group_name')
                    .input('group name')
                    .check.interaction({
                        state: 'states:group_type',
                        reply: 'What is your group type? Text 1 for Mixed group, 2 or Girls only and 3 for Gatekeepers\n1. Mixed\n2. Girls Only\n3. Gatekeepers'
                    })
                    .run();
            });
        });

        describe("9. after the user has entered their group type", function() {
            it("should thank them and end registration process", function() {
                return tester
                    .setup.user.state('states:group_type')
                    .input('2')
                    .check.interaction({
                        state: 'states:end_registered',
                        reply: 'Thank you. You are now registered to receive survey questions.'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });
        
    });
});
