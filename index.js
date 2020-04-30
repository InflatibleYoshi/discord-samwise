const Eris = require('eris');
const Chrono = require('chrono-node');
const db = require('./db.js');
const {token} = require('./variables');
const bot = new Eris.CommandClient(token, {}, {
    description: "A discord bot that brings community within arm's reach when dealing with destructive habits.",
    owner: "InflatibleYoshi",
    prefix: "!"
});
let dbConnection;

bot.on("ready", () => {
    dbConnection = new db.database();
    console.log("Ready!");
});

bot.on("messageReturn", (msg, msgToReturn) => {
    bot.createMessage(msg.channel.id, msgToReturn);
})

const registration = bot.registerCommand("register", () => {
        return "In order to register, type '!register silent' to register without tracking your clean days." +
            "\nIf you would like to track your clean days, type '!register date \"timestamp\" filling" +
            "\n\"timestamp\" with the last day you partook in your 'habit' in the format: " +
            "\n'DD Mon YYYY HH:mm:ss TZ' (01 Jan 1970 00:00:00 GMT).\""
    },
    {
        description: "Register User",
        fullDescription: "Register user to the Samwise bot.",
    });

registration.registerSubcommand("silent", (msg) => {
        console.log("silent");
        dbConnection.addUser(msg.author.id, 0, false);
        },
    {
        description: "Register user - silent",
        fullDescription: "Register user to the Samwise bot without reporting.",
    }
);

registration.registerSubcommand("date", async (msg, args) => {
        console.log("date");
        const text = args.join(" "); // Make a string of the text after the command label
        console.log(text);
        const results = Chrono.parse(text);
        const streak = Math.floor((results[0].ref.getTime() - results[0].start.date().getTime()) / (1000 * 3600 * 24));
        console.log(streak);

        let successHandler = function(value) {
            bot.emit("messageReturn", msg, "This puts your current streak at " + value + " clean days.\n" +
                "Invite people to join your fellowship or ask people to join theirs!")
        }

        let failureHandler = function(reason) {
            bot.emit("messageReturn", msg, reason);
        }
        await dbConnection.addUser(msg.author.id, streak, true, successHandler, failureHandler);

    }, {
        description: "Register user - tracking",
        fullDescription: "Fill in the space to the right of date with the last day you partook in your 'habit'" +
            " in the format 'DD Mon YYYY HH:mm:ss TZ' (01 Jan 1970 00:00:00 GMT)."
    }
);

bot.connect();