const Eris = require('eris');
const db = require('./db.js');
const {token} = require('./variables');
const bot = new Eris.CommandClient(token, {}, {
    description: "A discord bot that brings community within arm's reach when dealing with destructive habits.",
    owner: "InflatibleYoshi",
    prefix: "!"
});

bot.on("ready", () => {
    console.log("Ready!");
});

bot.registerCommand("register", (msg, args) => {
        console.log("Register User.");
        if (args.length < 2 || args.length > 2) {
            return "Invalid input";
        }
        let streak = Number(args[0]);
        let isMentor = Boolean(args[1]);
        db.addUser(msg.author.id);
        bot.createMessage(msg.channel.id, `Your user has been created!`);

    },
    {
        description: "Register User",
        fullDescription: "Register user to the Samwise bot.",
    })
    .registerSubcommand("silent", (msg) => "0 false",
        {
            description: "Register user - silent",
            fullDescription: "Register user to the Samwise bot without reporting.",
        }
    )
    .registerSubcommand("date", (msg, args) => {
        const text = args.join(" "); // Make a string of the text after the command label
        let streak = Math.abs(Date.now() - new Date.parse(text)) / 86400000;
        bot.createMessage(msg.channel.id, `This puts your current streak at ${streak} days.`);
        return `${streak} true`
    },{
        description: "Set date",
        fullDescription: "Fill in the space to the right of date with the last day you partook in your 'habit'" +
            " in the format 'DD Mon YYYY HH:mm:ss TZ' (01 Jan 1970 00:00:00 GMT)."
    });
bot.connect();