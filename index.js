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

async function filter(arr, callback) {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i=>i!==fail)
}


async function getSelectedUsers(args) {
    console.log("getSelectedUsers");
    const users = bot.users;
    console.log(users);
    users.filter(user => args.includes(user.id) || args.includes(user.username));
    const dbUsers = await dbConnection.getAllUsers();
    users.filter(value => dbUsers.includes(value))
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
        dbConnection.addUser(msg.author);
        return text.REGISTER_COMMAND_USER_CREATED;
    },
    {
        description: text.REGISTER_SILENT_SUBCOMMAND_DESCRIPTION,
        fullDescription: text.REGISTER_SILENT_SUBCOMMAND_FULL_DESCRIPTION,
    })
registration.registerSubcommand(text.REGISTER_DATE_SUBCOMMAND, async (msg, args) => {
    console.log(text.REGISTER_DATE_SUBCOMMAND);
    const parse = args.join(" ");
    // Make a string of the text after the command label
    const results = Chrono.parse(parse);
    const timestamp = results[0].start.date().getTime();
    // Finding the difference in milliseconds and converting to days.
    const streak = dbConnection.getDaysDifference(results[0].start.date().getTime());
    // return date that can is stored as a reference point for restoring streak data.
    console.log(results[0].start.date());
    let userEventListener;

    if(await dbConnection.isUserExists(msg.author)) {
        bot.emit("messageReturn", msg.channel.id, text.REGISTER_DATE_SUBCOMMAND_ALREADY_REGISTERED_WARNING)
    }

    await bot.createMessage(msg.channel.id, text.REGISTER_DATE_SUBCOMMAND_RETURN_STREAK(streak))
        .then((message) => {
                message.addReaction('✅');
                message.addReaction('❌');
                userEventListener = function (user_msg, emoji, id) {
                    console.log(emoji);
                    if (user_msg.id === message.id && id === msg.author.id) {
                        if (emoji.name === '❌') {
                            bot.emit("messageReturn", msg.channel.id, text.REGISTER_COMMAND_USER_ABORTED);
                            message.delete();
                            bot.off("messageReactionAdd", userEventListener);
                        } else if (emoji.name === '✅') {
                            dbConnection.addUser(msg.author, streak, timestamp);
                            bot.emit("messageReturn", msg.channel.id, text.REGISTER_COMMAND_USER_CREATED);
                            message.delete();
                            bot.off("messageReactionAdd", userEventListener);
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
    let successHandler = function (_user) {
        bot.emit("messageReturn", msg.channel.id, text.GENERATE_RESET());
    }
    let failureHandler = function (error) {
        bot.emit("messageReturn", msg.channel.id, error);
    }
    await dbConnection.reset(msg.author);
})

bot.registerCommand(text.REQUEST_COMMAND, async (msg, args) => {
        console.log(text.REQUEST_COMMAND);
        //Get list of all users included in the arguments.
        const users = await getSelectedUsers(args);
        //Loop through all users and promisify them.
        console.log(users);
        if (users.length > 0) {
            await Promise.all(
                users.map(async (user) => {
                    dbConnection.isUserInFellowship(msg.author, user)
                        .then((inFellowship) => {
                            if (inFellowship) {
                                bot.emit("messageReturn", msg.channel.id, text.REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE(user.username));
                            } else {
                                let fellowshipEventListener;
                                let onFellowshipAdd;
                                let failureHandler;

                                bot.emit("messageReturn", msg.channel.id, text.REQUEST_COMMAND_ON_FELLOWSHIP_ADDING_REQUEST(user.username));

                                return bot.getDMChannel(user.id)
                                    .then((channel) => {
                                        onFellowshipAdd = function (_user) {
                                            bot.emit("messageReturn", msg.channel.id, text.COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE(user.username));
                                            bot.emit("messageReturn", channel.id, text.COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE(msg.author.username));
                                        }
                                        failureHandler = function (_error) {
                                            bot.emit("messageReturn", channel.id, text.REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST(msg.author.username));
                                        }
                                        return channel.createMessage(text.REQUEST_COMMAND_ON_FELLOWSHIP_TARGET_REQUEST(msg.author.username))
                                    })
                                    .then((user_message) => {
                                        user_message.addReaction('✅');
                                        user_message.addReaction('❌');
                                        fellowshipEventListener = async function (user_msg, emoji, id) {
                                            if (user_msg.id === user_message.id && id === user.id) {
                                                if (emoji.name === '❌') {
                                                    await user_message.delete();
                                                    bot.off("messageReactionAdd", fellowshipEventListener);
                                                } else if (emoji.name === '✅') {
                                                    await dbConnection.addToFellowship(user, msg.author, onFellowshipAdd, failureHandler);
                                                    await user_message.delete();
                                                    bot.off("messageReactionAdd", fellowshipEventListener);
                                                }
                                            }
                                        }
                                        bot.on("messageReactionAdd", fellowshipEventListener);
                                    })
                            }
                        })
                }))
        } else {
            return text.COMMAND_SELECT_NO_USERS_ERROR
        }
    },
    {
        description: text.REQUEST_COMMAND_DESCRIPTION,
        fullDescription: text.REQUEST_COMMAND_FULL_DESCRIPTION,
    });

bot.registerCommand(text.INVITE_COMMAND, async (msg, args) => {
        //Get list of all users included in the arguments.
        const users = await getSelectedUsers(args);
        //Loop through all users and promisify them.
        if (users.length > 0) {
            await Promise.all(
                users.map(async (user) => {

                    dbConnection.isUserInFellowship(user, msg.author)
                        .then((inFellowship) => {
                                if (inFellowship) {

                                    bot.emit("messageReturn", msg.channel.id, text.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE(user.username));

                                } else {
                                    let fellowshipEventListener;
                                    let onFellowshipAdd;
                                    let failureHandler;

                                    bot.emit("messageReturn", msg.channel.id, text.INVITE_COMMAND_ON_FELLOWSHIP_TARGET_INVITE(user.username));

                                    return bot.getDMChannel(user.id)
                                        .then((channel) => {
                                            onFellowshipAdd = function (_user) {
                                                bot.emit("messageReturn", msg.channel.id, text.COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE(msg.author.username));
                                                bot.emit("messageReturn", channel.id, text.COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE(user.username));
                                            }
                                            failureHandler = function (_error) {
                                                bot.emit("messageReturn", channel.id, text.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST(msg.author.username));
                                            }

                                            return channel.createMessage(text.INVITE_COMMAND_ON_FELLOWSHIP_ADDING_INVITE(user.username))
                                        })
                                        .then((user_message) => {
                                            user_message.addReaction('✅');
                                            user_message.addReaction('❌');
                                            fellowshipEventListener = async function (user_msg, emoji, id) {
                                                if (user_msg.id === user_message.id && id === user.id) {
                                                    if (emoji.name === '❌') {
                                                        await user_message.delete();
                                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                                    } else if (emoji.name === '✅') {
                                                        await dbConnection.addToFellowship(msg.author, user, onFellowshipAdd, failureHandler);
                                                        await user_message.delete();
                                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                                    }
                                                }
                                                bot.on("messageReactionAdd", fellowshipEventListener);
                                            }
                                        })
                                }
                            }
                        )
                })
            )
        } else {
            return text.COMMAND_SELECT_NO_USERS_ERROR
        }
    },
    {
        description: text.INVITE_COMMAND_DESCRIPTION,
        fullDescription: text.INVITE_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.KICK_COMMAND, async (msg, args) => {
        if (args === null) {
            return text.COMMAND_SELECT_NO_USERS_ERROR
        }
        //Get list of all users included in the arguments.
        const users = getSelectedUsers(args);
        //Keep all users whose fellowships the author is already a part of.
        if (users.length > 0) {
            await bot.createMessage(msg.channel.id, text.KICK_COMMAND_ON_KICK(users))
                .then((message) => {
                    message.addReaction('✅');
                    message.addReaction('❌');
                    let onFellowshipRemove = function (user) {
                        bot.emit("messageReturn", msg.channel.id, text.KICK_COMMAND_SUCCESS_RESPONSE(user.username));
                    }
                    let failureHandler = function (user) {
                        bot.emit("messageReturn", msg.channel.id, text.KICK_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username));
                    }
                    let fellowshipEventListener = async function (user_msg, emoji, id) {
                        if (user_msg.id === message.id && id === msg.author.id) {
                            if (emoji.name === '❌') {
                                await message.delete();
                                bot.off("messageReactionAdd", fellowshipEventListener);
                            } else if (emoji.name === '✅') {
                                await Promise.all(users.map(user => dbConnection.removeFromFellowship(msg.author, user, onFellowshipRemove, failureHandler)));
                                await message.delete();
                                bot.off("messageReactionAdd", fellowshipEventListener);

                            }
                        }
                        bot.on("messageReactionAdd", fellowshipEventListener);
                    }
                })
        } else {
            return text.COMMAND_SELECT_NO_USERS_ERROR
        }
    },
    {
        description: text.KICK_COMMAND_DESCRIPTION,
        fullDescription: text.KICK_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.LEAVE_COMMAND, async (msg, args) => {
        if (args === null) {
            return text.COMMAND_SELECT_NO_USERS_ERROR
        }
        //Get list of all users included in the arguments.
        const users = getSelectedUsers(args);
        if (users.length > 0) {
            await bot.createMessage(msg.channel.id, text.LEAVE_COMMAND_ON_LEAVE(users))
                .then((message) => {
                    message.addReaction('✅');
                    message.addReaction('❌');
                    let onFellowshipRemove = function (user) {
                        bot.emit("messageReturn", msg.channel.id, text.LEAVE_COMMAND_SUCCESS_RESPONSE(user.username));
                    }
                    let failureHandler = function (user) {
                        bot.emit("messageReturn", msg.channel.id, text.LEAVE_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username));
                    }
                    let fellowshipEventListener = async function (user_msg, emoji, id) {
                        if (user_msg.id === message.id && id === msg.author.id) {
                            if (emoji.name === '❌') {
                                await message.delete();
                                bot.off("messageReactionAdd", fellowshipEventListener);
                            } else if (emoji.name === '✅') {
                                await Promise.all(users.map(user => dbConnection.removeFromFellowship(user, msg.author, onFellowshipRemove, failureHandler)));
                                await message.delete();
                                bot.off("messageReactionAdd", fellowshipEventListener);
                            }
                        }
                        bot.on("messageReactionAdd", fellowshipEventListener);
                    }
                })
        } else {
            return text.COMMAND_SELECT_NO_USERS_ERROR
        }
    },
    {
        description: text.LEAVE_COMMAND_DESCRIPTION,
        fullDescription: text.LEAVE_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand("getRegisteredUsers", (msg) => {
    dbConnection.returnAllUsers(msg, bot)

});


bot.registerCommand("listFellowship", (msg) => {
    dbConnection.returnFellowship(msg.author.id, msg, bot)
});

bot.registerCommand("listMemberships", (msg) => {
    dbConnection.returnMembership(msg.author.id, msg, bot)
});

bot.connect();