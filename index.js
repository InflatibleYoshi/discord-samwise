const Eris = require('eris');
import * as db from './db.js';
const {token, backup_channel} = require('./variables');
const bot = new Eris.CommandClient(token, {}, {
    description: "A discord bot that brings community within arm's reach when dealing with destructive habits.",
    owner: "InflatibleYoshi",
    prefix: "!"
});

bot.on("ready", () => {
    console.log("Ready!");
});

bot.registerCommand("!register", (msg, args) => {
        db.addUser(msg.author.id);
    },
    {
    description: "Register User",
    fullDescription: "Register user to the Samwise bot, create an empty fellowship, and set last date of reset.",
    hooks:{
        preCommand(msg){
            try{
                let streak = 0;
                let datePromise = bot.createMessage(msg.channel.id,
                    "Please enter the date of your last 'reset' " +
                    "in the format 'DD Mon YYYY HH:mm:ss TZ' (01 Jan 1970 00:00:00 GMT).")
                    .then(once(bot.on("messageCreate", (msg) =>
                        Math.abs(Date.now() - new Date.parse(msg.content)) / 86400000))
                    );

                let streakPromise = streak => (bot.createMessage(msg.channel.id,
                    ("This puts your current streak at %d days, is this correct? Type 'yes' if correct and 'no' if not.", streak))
                    .then(once(bot.on("messageCreate", (msg) => {
                        if(msg.content !== "yes") throw ""
                    }))));

            } catch (e){

                this.preCommand(msg);

            } finally {
                bot.createMessage(msg.channel.id, "Your user has been created and you've been given an empty fellowship. " +
                    "Invite people to join your fellowship!").once();
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