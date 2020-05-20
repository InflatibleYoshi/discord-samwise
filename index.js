import {Command, Emoji, PossiblyUncachedMessage} from "eris";

const Eris = require('eris');
const Chrono = require('chrono-node');
const text = require('./text.js')
const db = require('./db.js');
const {token} = require('./variables');
const bot = new Eris.CommandClient(token, {}, {
    description: text.BOT_DESCRIPTION,
    owner: text.BOT_OWNER,
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
    users.filter(user => dbConnection.isUserExists(user));
    if(args === null){
        return users
    }
    else {
        return users.filter(user => args.includes(user.id) || args.includes(user.username))
    }
}

const registration = bot.registerCommand(text.REGISTER_COMMAND, () => {
        return text.REGISTER_COMMAND_RESPONSE;
    },
    {
        description: text.REGISTER_COMMAND_DESCRIPTION,
        fullDescription: text.REGISTER_COMMAND_FULL_DESCRIPTION,
    });
registration.registerSubcommand(text.REGISTER_SILENT_SUBCOMMAND, (msg) => {
        console.log(text.REGISTER_SILENT_SUBCOMMAND);
        dbConnection.addUser(msg.author, 0, 0, 0, 0, false);
        return text.REGISTER_COMMAND_USER_CREATED;
    },
    {
        description: text.REGISTER_SILENT_SUBCOMMAND_DESCRIPTION,
        fullDescription:  text.REGISTER_SILENT_SUBCOMMAND_FULL_DESCRIPTION,
    })
registration.registerSubcommand(text.REGISTER_DATE_SUBCOMMAND, async (msg, args) => {
    console.log(text.REGISTER_DATE_SUBCOMMAND);
    const parse = args.join(" ");
    // Make a string of the text after the command label
    const results = Chrono.parse(parse);
    // Finding the difference in milliseconds and converting to days.
    const streak = Math.floor((results[0].ref.getTime() - results[0].start.date().getTime()) / (1000 * 3600 * 24));
    // return date that can is stored as a reference point for restoring streak data.
    const date = results[0].start.date().getTime();

    let userEventListener;

    if(dbConnection.isUserExists(msg.author)){
        bot.emit("messageReturn", msg.channel.id, text.REGISTER_DATE_SUBCOMMAND_ALREADY_REGISTERED_WARNING);
    }
    await bot.createMessage(msg.author.id, text.REGISTER_DATE_SUBCOMMAND_RETURN_STREAK(streak))
        .then((message) => {
                message.addReaction('✅');
                message.addReaction('❌');
                userEventListener = function (user_msg, emoji, id) {
                    if (user_msg.id === message.id && id === msg.author.id) {
                        if (emoji.name === "x") {
                            bot.off("messageReactionAdd", userEventListener);
                            bot.emit("messageReturn", msg.channel.id, text.REGISTER_COMMAND_USER_ABORTED);
                        } else if (emoji.name === "white_check_mark") {
                            bot.off("messageReactionAdd", userEventListener);
                            dbConnection.addUser(msg.author, streak, date, date.getUTCHours(), date.getUTCMinutes(), true);
                            bot.emit("messageReturn", msg.channel.id, text.REGISTER_COMMAND_USER_CREATED);
                        }
                    }
                }
                bot.on("messageReactionAdd", userEventListener);
            }
        );
}, {
    description: text.REGISTER_DATE_SUBCOMMAND_DESCRIPTION,
    fullDescription: text.REGISTER_DATE_SUBCOMMAND_FULL_DESCRIPTION
})

bot.registerCommand(text.RESET_COMMAND, async (msg, args) => {
    console.log(text.RESET_COMMAND);
    const date = Date.now();
    dbConnection.addUser(msg.author, 0, date, date.getUTCHours(), date.getUTCMinutes(), true)
})

bot.registerCommand(text.REQUEST_COMMAND, async (msg, args) => {
        console.log(text.REQUEST_COMMAND);
        if(args === null){
            return text.COMMAND_SELECT_NO_USERS_ERROR
        }
        //Get list of all users included in the arguments.
        const users = getUsers(args);
        //Remove all users who are already in the fellowship.
        users.filter((user) => !dbConnection.isUserInFellowship(msg.author, user))
        //Loop through all users and promisify them.
        if (users.length > 0) {
            await Promise.all(
                users.map(async (user) => {

                    let onFellowshipAdd;
                    let failureHandler;
                    let fellowshipEventListener;

                    bot.emit("messageReturn", msg.channel.id, text.REQUEST_COMMAND_ON_FELLOWSHIP_ADDING_REQUEST(user.username));

                    await bot.getDMChannel(user.id)
                        .then((channel) => {
                            onFellowshipAdd = function (user) {
                                bot.emit("messageReturn", msg.channel.id, text.REQUEST_COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE(user.username));
                                bot.emit("messageReturn", channel.id, text.REQUEST_COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE(msg.author));
                            }
                            failureHandler = function (_error) {
                                bot.emit("messageReturn", channel.id, text.REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR(msg.author));
                            }
                            return channel.createMessage(text.REQUEST_COMMAND_ON_FELLOWSHIP_TARGET_REQUEST(msg.author.username))
                        })
                        .then((user_message) => {
                            user_message.addReaction('✅');
                            user_message.addReaction('❌');
                            fellowshipEventListener = async function (user_msg, emoji, id) {
                                if (user_msg.id === user_message.id && id === user.id) {
                                    if (emoji.name === "x") {
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    } else if (emoji.name === "white_check_mark") {
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                        await dbConnection.addToFellowship(msg.author, user, onFellowshipAdd, failureHandler);
                                    }
                                }
                            }
                            bot.on("messageReactionAdd", fellowshipEventListener);
                        })
                }))
        } else {
            return "You did not match any registered users with your command who aren't already in your fellowship."
        }
    },
    {
        description: "Request to join",
        fullDescription: "Request to join another user's fellowship by typing any amount " +
            "of user id's or usernames separated by space to the right of the !request command",
    });

bot.registerCommand("invite", async (msg, args) => {
        console.log("invite");
        if(args === null){
            return "You did not match any registered users with your command."
        }
        const users = getUsers(args);
        if (users.length > 0) {
            await Promise.all(
                users.map(async (user) => {
                    let fellowshipEventListener;
                    let onFellowshipAdd = function (user) {
                        bot.emit("messageReturn", msg.channel.id, "You have been added to the fellowship of " + user.username + "!");
                    }
                    let failureHandler = function (reason) {
                        bot.emit("messageReturn", msg.channel.id, reason);
                    }

                    bot.emit("messageReturn", msg.channel.id, "You have invited " + user.username + "to join your fellowship!");
                    await bot.getDMChannel(user.id)
                        .then((channel) => {
                            return channel.createMessage(msg.author.username + " has asked you to join his/her/its fellowship!\n" +
                                "Use the reaction buttons to choose whether or not to accept or decline the invite!")
                        })
                        .then((user_message) => {
                            user_message.addReaction('✅');
                            user_message.addReaction('❌');
                            fellowshipEventListener = async function (user_msg, emoji, id) {
                                if (user_msg.id === user_message.id && id === user.id) {
                                    if (emoji.name === "x") {
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    } else if (emoji.name === "white_check_mark") {
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                        await dbConnection.addToFellowship(user, msg.author, onFellowshipAdd, failureHandler);
                                    }
                                }
                                bot.on("messageReactionAdd", fellowshipEventListener);
                            }
                        })
                })
            )
        } else {
            return "You did not match any registered users with your command."
        }
    },
    {
        description: "Invite to join",
        fullDescription: "Invite another person to your fellowship by typing any amount " +
            "of user id's or usernames separated by space to the right of the !invite command",
    });

bot.registerCommand("kick", (msg, args) => {
    
});

bot.registerCommand("leave",(msg, args)=>{

})

bot.registerCommand("getRegisteredUsers", (msg) => {

});


bot.registerCommand("listFellowships", (msg) => {

});

bot.registerCommand("listMemberships",  (msg) => {

});

bot.connect();