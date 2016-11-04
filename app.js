// Define Variables
var restify = require('restify'); 
var builder = require('botbuilder'); 

var appId = process.env.MY_APP_ID;
var appPassword = process.env.MY_APP_PASSWORD;

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.PORT || 3000, function() 
{
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat bot
var connector = new builder.ChatConnector // Create Chat Connector to talk to different chanels (FBm / Skype etc)
({ appId: process.env.MY_APP_ID, appPassword: process.env.MY_APP_PASSWORD }); // setup the APP ID and Password for our published bot
var bot = new builder.UniversalBot(connector); // Create a new instance of Universal boit and bind bot with the chat connector 
server.post('/api/messages', connector.listen()); // Set the URL and listen

//=========================================================
// Bots Middleware
//=========================================================

// Anytime the major version is incremented any existing conversations will be restarted.
bot.use(builder.Middleware.dialogVersion({ version: 1.0, resetCommand: /^reset/i }));

//=========================================================
// Bots Global Actions
//=========================================================

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^goodbye/i });
bot.beginDialogAction('help', '/help', { matches: /^help/i });

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        session.send("Hi... I'm the Rob-Bot, a virtual bar tender here to help you find a drink!!");
    },
    function (session, results) {
        // Display menu
        session.beginDialog('/menu');
    },
    function (session, results) {
        // Always say goodbye
        session.send("Ok... See you later!");
    }
]);

bot.dialog('/menu', [
    function (session) {
        builder.Prompts.choice(session, "What type of drink do you like most?", "|Beer|Wine|Spirts|(quit)");
    },
    function (session, results) {
        if (results.response && results.response.entity != '(quit)') {
            // Launch demo dialog
            session.beginDialog('/' + results.response.entity);
        } else {
            // Exit the menu
            session.endDialog();
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/menu');
    }
]).reloadAction('reloadMenu', null, { matches: /^menu|show menu/i });