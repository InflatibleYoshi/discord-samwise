const Eris = require('eris');
const Chrono = require('chrono-node');
const db = require('./db.js');
const {token} = require('./variables');
const bot = new Eris.CommandClient(token, {}, {
    description: "A discord bot that brings community within arm's reach when dealing with destructive habits, or just for giving life updates.",
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
registration.registerSubcommand("simple", async (msg) => {
        console.log("simple");
        await dbConnection.addUser(msg.author.id, "",0, false);
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
        await dbConnection.addUser(msg.author, results[0].start.toString(),  streak, true, successHandler, failureHandler);

    }, {
        description: "Register user - tracking",
        fullDescription: "Fill in the space to the right of 'date' with your starting point" +
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
                    dbConnection.requestToJoin(msg.author, user, successHandler, failureHandler)
                }));
        } else {
            bot.emit("messageReturn", msg.channel.id, "You did not match any users with your command.");
        }
    },
    {
        description: "Request to join",
        fullDescription: "Request to join another user's fellowship by typing any amount " +
            "of user id's or usernames separated by space to the right of the !request command",
    });

bot.registerCommand("invite", async (msg, args) => {
        console.log("invite");
        const users = getUsers(args);
        if(users.length > 0){
            await Promise.all(
                users.map((user) => {
                    let successHandler = function (user) {
                        bot.emit("messageReturn", msg.channel.id, `You have invited ${user.username} to join your fellowship!`);
                        bot.getDMChannel(user.id).then((channel) => {
                            channel.createMessage(`You have been invited to join ${msg.author.username}'s fellowship!`)
                        })
                    }
                    let failureHandler = function (reason) {
                        bot.emit("messageReturn", msg.channel.id, reason);
                    }
                    dbConnection.inviteToJoin(msg.author, user, successHandler, failureHandler)
                }));
        } else {
            bot.emit("messageReturn", msg.channel.id, "You did not match any users with your command.");
        }
    },
    {
        description: "Invite to join",
        fullDescription: "Invite another person to your fellowship by typing any amount " +
            "of user id's or usernames separated by space to the right of the !invite command",
    });

bot.registerCommand("acceptRequest", async (msg, args) => {
        console.log("acceptRequest");
        const users = getUsers(args);
        if(users.length > 0){
            await Promise.all(
                users.map((user) => {
                    let successHandler = function (user) {
                        bot.emit("messageReturn", msg.channel.id, `You have accepted ${user.username}'s request to join your fellowship!`);
                        bot.getDMChannel(user.id).then((channel) => {
                            channel.createMessage(`You are now part of ${msg.author.username}'s fellowship!`)
                        })
                    }
                    let failureHandler = function (reason) {
                        bot.emit("messageReturn", msg.channel.id, reason);
                    }
                    dbConnection.answerRequest(msg.author, user.id, true, successHandler, failureHandler)
                }));
        } else {
            bot.emit("messageReturn", msg.channel.id, "You did not match any users with your command.");
        }
    },
    {
        description: "Accept Request to join",
        fullDescription: "Accept the request from another fellowship by typing any amount " +
            "of user id's or usernames separated by space to the right of the !acceptRequest command",
    });


bot.registerCommand("acceptInvite", async (msg, args) => {
        console.log("acceptInvite");
        const users = getUsers(args);
        if(users.length > 0){
            await Promise.all(
                users.map((user) => {
                    let successHandler = function (user) {
                        bot.emit("messageReturn", msg.channel.id, `You have accepted the invite to join ${user.username}'s fellowship!`);
                        bot.getDMChannel(user.id).then((channel) => {
                            channel.createMessage(`${msg.author.username}'s is now a part of your fellowship!`)
                        })
                    }
                    let failureHandler = function (reason) {
                        bot.emit("messageReturn", msg.channel.id, reason);
                    }
                    dbConnection.answerRequest(msg.author, user.id, true, successHandler, failureHandler)
                }));
        } else {
            bot.emit("messageReturn", msg.channel.id, "You did not match any users with your command.");
        }
    },
    {
        description: "Accept Invite to join",
        fullDescription: "Accept the invite from another fellowship by typing any amount " +
            "of user id's or usernames separated by space to the right of the !acceptInvite command",
    });

bot.registerCommand("rejectRequest", async (msg, args) => {
        console.log("rejectRequest");
        const users = getUsers(args);
        if(users.length > 0){
            await Promise.all(
                users.map((user) => {
                    let successHandler = function (user) {
                        bot.emit("messageReturn", msg.channel.id, `You have rejected ${user.username}'s request to join your fellowship!`);
                    }
                    let failureHandler = function (reason) {
                        bot.emit("messageReturn", msg.channel.id, reason);
                    }
                    dbConnection.answerRequest(msg.author, user.id, true, successHandler, failureHandler)
                }));
        } else {
            bot.emit("messageReturn", msg.channel.id, "You did not match any users with your command.");
        }
    },
    {
        description: "Reject Request to join",
        fullDescription: "Reject the request from another fellowship by typing any amount " +
            "of user id's or usernames separated by space to the right of the !rejectRequest command",
    });


bot.registerCommand("rejectInvite", async (msg, args) => {
        console.log("rejectInvite");
        const users = getUsers(args);
        if(users.length > 0){
            await Promise.all(
                users.map((user) => {
                    let successHandler = function (user) {
                        bot.emit("messageReturn", msg.channel.id, `You have rejected the invite to join ${user.username}'s fellowship!`);
                    }
                    let failureHandler = function (reason) {
                        bot.emit("messageReturn", msg.channel.id, reason);
                    }
                    dbConnection.answerRequest(msg.author, user.id, true, successHandler, failureHandler)
                }));
        } else {
            bot.emit("messageReturn", msg.channel.id, "You did not match any users with your command.");
        }
    },
    {
        description: "Reject Invite to join",
        fullDescription: "Reject the invite from another fellowship by typing any amount " +
            "of user id's or usernames separated by space to the right of the !rejectInvite command",
    });

bot.connect();