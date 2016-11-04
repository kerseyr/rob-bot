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
        // Send a greeting and show help.
        var card = new builder.HeroCard(session)
            .title("Rob-Bot Virtual Bar Tender")
            .text("Getting you drunk everywhere!")
            .images([
                 builder.CardImage.create(session, "http://static.ibnlive.in.com/pix/slideshow/07-2013/meet-the-humanoid/main-1-robot-290713.jpg")
            ]);
        var msg = new builder.Message(session).attachments([card]);
        session.send(msg);
        session.send("Hi... I'm Rob-Bot Here to help you find a drink!.");
        session.beginDialog('/help');
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
        builder.Prompts.choice(session, "What type of drink would you like?", "Beer|Wine|Spirt|(quit)");
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

bot.dialog('/help', [
    function (session) {
        session.endDialog("Global commands that are available anytime:\n\n* menu - Exits a demo and returns to the menu.\n* goodbye - End this conversation.\n* help - Displays these commands.");
    }
]);