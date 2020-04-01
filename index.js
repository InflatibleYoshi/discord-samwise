const Eris = require('eris');

const { token } = require('./variables');
const bot = new Eris(token);
bot.on("ready", () => {
    console.log("Ready!");
});
bot.on("messageCreate", (msg) => {
    if(msg.content.startsWith("samwise!")) {
        switch (msg.content.slice(8)) {
            case "register":
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

        bot.createMessage(msg.channel.id, "Pong!");
    }
});
bot.connect();