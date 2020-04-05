const Eris = require('eris');
const {token, backup_channel} = require('./variables');
const db = require('./db');
const bot = new Eris.CommandClient(token, {}, {
    description: "A discord bot that brings community within arm's reach when dealing with destructive habits.",
    owner: "InflatibleYoshi",
    prefix: "!"
});

bot.on("ready", () => {
    console.log("Ready!");
});

bot.registerCommand("register", "Register User", {
    description: "Register User",
    fullDescription: "Register user to the Samwise bot, create an empty fellowship, and set last date of reset.",
    hooks:{
        preCommand(msg){
            try{
                let datePromise = bot.createMessage(msg.channel.id,
                    "Please enter the date of your last 'reset' " +
                    "in the format 'DD Mon YYYY HH:mm:ss TZ' (01 Jan 1970 00:00:00 GMT).")
                    .then(once(bot.on("messageCreate", (msg) => {
                        let d = new Date.parse(msg.content);
                    })));
                let streakPromise = bot.createMessage(msg.channel.id,
                    "Please enter the date of your last 'reset' " +
                    "in the format 'DD Mon YYYY HH:mm:ss TZ' (01 Jan 1970 00:00:00 GMT).")
                    .then(once(bot.on("messageCreate", (msg) => {
                        let d = new Date.parse(msg.content);
                    })));

            } catch (e){
                this.preCommand();
            } finally {

            }
        }
    }
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