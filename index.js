const Eris = require('eris');
const {token, backup_channel} = require('./variables');
const db = require('./db');
const bot = new Eris(token);

bot.on("ready", () => {
    console.log("Ready!");
});
bot.on("messageCreate", (msg) => {


    switch (msg.content) {
        case "register":
            bot.createMessage(msg.channel.id, "Pong!");
            break;

        case "listUsers":
            break;
        case "invite":
            break;
        case "join":
            break;
        case "leave":
            break;
        case "kick":
            break;
        case "fellowship":
            break;
        case "memberOf":
            break;
        case "panic":
            break;
        case "reset":
            break;
        case "resetHistory":
            break;
        case "undoReset":
            break;
        default:
            break;
    }
});
bot.connect();