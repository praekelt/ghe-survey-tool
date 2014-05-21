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
                        reply: 'Thank you for reaching out to Yegna Listener Group Registration Survey'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });

        describe("3. when the user gives consent to receive survey questions", function() {
            it("should ask for their preferred language", function() {
                return tester
                    .setup.user.state('states:start')
                    .input('1')
                    .check.interaction({
                        state: 'states:language',
                        reply: 'What is your preferred language? Text 1 for English, 2 for Amharic and 3 for ኣማርኛ\n1. English\n2. Amharic\n3. ኣማርኛ'
                    })
                    .run();
            });
        });

        describe("4. after the user has selected their language", function() {
            it("should ask about their age", function() {
                return tester
                    .setup.user.state('states:language')
                    .input('1')
                    .check.interaction({
                        state: 'states:age',
                        reply: 'Are you older than 18 years? Text 1 for Yes and 2 for No\n1. Yes\n2. No'
                    })
                    .run();
            });
        });

        describe("5. after the user has indicated their age", function() {
            it("should ask for their gender", function() {
                return tester
                    .setup.user.state('states:age')
                    .input('2')
                    .check.interaction({
                        state: 'states:gender',
                        reply: 'What is your gender? Test 1 for Male and 2 for Female\n1. Male\n2. Female'
                    })
                    .run();
            });
        });

        describe("6. after the user has selected their gender", function() {
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

        describe("7. after the user has entered their group name", function() {
            it("should thank them and end registration process", function() {
                return tester
                    .setup.user.state('states:group_name')
                    .input('2')
                    .check.interaction({
                        state: 'states:end_registered',
                        reply: 'Thank you! You are now registered as a member of the Yegna Listener Group. Please share your feedback with us every week. Your input is very important to us.'
                    })
                    .check.reply.ends_session()
                    .run();
            });
        });
        
    });
});
