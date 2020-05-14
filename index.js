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
    console.log("Ready! Database initialized.");
});

bot.on("messageReturn", async (id, msgToReturn) => {
    await bot.createMessage(id, msgToReturn);
})

function getUsers(args) {
    const users = bot.users;
    return users.filter(user => args.includes(user.id) || args.includes(user.username))
}

const registration = bot.registerCommand("register", () => {
        return "If you would like to track the days you've spent dedicated towards a goal such as being free from addiction or reading your bible, " +
            "\ntype '!register date \"timestamp\" filling" +
            "\n\"timestamp\" with the last day you partook in your 'habit' in the format: " +
            "\n'DD Mon YYYY HH:mm:ss TZ' (01 Jan 1970 00:00:00 GMT).\"" +
            "Otherwise, type '!register silent' to register without tracking your day.";
    },
    {
        description: "Register User",
        fullDescription: "Register user to the Samwise bot.",
    });
registration.registerSubcommand("silent", async (msg) => {
        console.log("silent");
        await dbConnection.addUser(msg.author.id, 0, false);
    },
    {
        description: "Register user - silent",
        fullDescription: "Register user to the Samwise bot without reporting.",
    }
);
registration.registerSubcommand("date", async (msg, args) => {
        console.log("date");
        const text = args.join(" "); // Make a string of the text after the command label
        const results = Chrono.parse(text);
        const streak = Math.floor((results[0].ref.getTime() - results[0].start.date().getTime()) / (1000 * 3600 * 24));

        let successHandler = function (value) {
            bot.emit("messageReturn", msg.channel.id, "This puts your current streak at " + value + " clean days.\n" +
                "Invite people to join your fellowship or ask people to join theirs!")
        }

        let failureHandler = function (reason) {
            bot.emit("messageReturn", msg.channel.id, reason);
        }
        await dbConnection.addUser(msg.author, streak, true, successHandler, failureHandler);

    }, {
        description: "Register user - tracking",
        fullDescription: "Fill in the space to the right of date with the last day you partook in your 'habit'" +
            " in the format 'DD Mon YYYY HH:mm:ss TZ' (01 Jan 1970 00:00:00 GMT)."
    }
);

bot.registerCommand("request", async (msg, args) => {
        console.log("request");
        const users = getUsers(args);
        if(users.length > 0){
            await Promise.all(
                users.map((user) => {
                    let successHandler = function (user) {
                        bot.emit("messageReturn", msg.channel.id, "You have requested to join the fellowship of " + user.username + "!");
                        bot.getDMChannel(user.id).then((channel) => {
                            channel.createMessage(msg.author.username + " has requested to join your fellowship!")
                        })
                    }
                    let failureHandler = function (reason) {
                        bot.emit("messageReturn", msg.channel.id, reason);
                    }
                    dbConnection.requestToJoinFellowship(msg.author, user, successHandler, failureHandler)
                }));
        } else {
            bot.emit("messageReturn", msg.channel.id, "You did not match any users with your request.");
        }
    },
    {
        description: "Request to join",
        fullDescription: "Request to join another user's fellowship.",
    });



bot.connect();