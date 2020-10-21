const Eris = require('eris');
const Chrono = require('chrono-node');
const embed = require('./embed.js');
const text = require('./text.js');
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
});

function getUser(args, msg) {
    console.log("getUser");
    let users = bot.users;
    let returningUser = null;
    let user = users.filter(user => (args.includes(user.id) || args.includes(user.username)) && !args.includes(msg.author.id));
    if (user.length > 0) {
        returningUser = user[0];
        console.log(returningUser.username);
    } else {
        bot.emit("messageReturn", msg.channel.id, embed.error(msg.command.label, text.COMMAND_SELECT_NO_USERS_ERROR));
    }
    return returningUser;
}

function getUsernames(args) {
    console.log("getUsernames");
    let users = bot.users;
    let user = users.filter(user => args.includes(user.id) || args.includes(user.username));
    console.log(user.map(user => user.username));
    return user.map(user => user.username);
}

const tracking = bot.registerCommand(text.TRACK_COMMAND, () => {
        bot.emit("messageReturn", msg.channel.id, embed.command(text.TRACK_COMMAND, text.TRACK_COMMAND_FULL_DESCRIPTION));
    },
    {
        description: text.TRACK_COMMAND_DESCRIPTION,
        fullDescription: text.TRACK_COMMAND_FULL_DESCRIPTION,
    });

tracking.registerSubcommand(text.TRACK_RESET_SUBCOMMAND, async (msg, args) => {
    console.log(text.TRACK_RESET_SUBCOMMAND);
    let successHandler = function (_user) {
        bot.emit("messageReturn", msg.channel.id, embed.response(text.TRACK_RESET_SUBCOMMAND, text.GENERATE_RESET()));
    }
    let failureHandler = function (error) {
        bot.emit("messageReturn", msg.channel.id, embed.command(text.TRACK_RESET_SUBCOMMAND, error));
    }
    await dbConnection.reset(msg.author, successHandler, failureHandler);
})
tracking.registerSubcommand(text.TRACK_DATE_SUBCOMMAND, async (msg, args) => {
    console.log(text.TRACK_DATE_SUBCOMMAND);
    const parse = args.join(" ");
    // Make a string of the text after the command label
    const results = Chrono.parse(parse);
    const timestamp = results[0].start.date().getTime();
    console.log(timestamp);
    // Finding the difference in milliseconds and converting to days.
    const streak = dbConnection.getDaysDifference(timestamp);
    // return date that can is stored as a reference point for restoring streak data.
    console.log(results[0].start.date());
    let userEventListener;

    await dbConnection.isUserExists(msg.author).then((exists) => {
        if (exists) {
            bot.emit("messageReturn", msg.channel.id, embed.command(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_ALREADY_TRACKED_WARNING));
        }
        return bot.createMessage(msg.channel.id, embed.command(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_RETURN_STREAK(streak)));
    })
        .then((message) => {
                message.addReaction('✅');
                message.addReaction('❌');
                userEventListener = function (user_msg, emoji, id) {
                    if (user_msg.id === message.id && id === msg.author.id) {
                        if (emoji.name === '❌') {
                            bot.emit("messageReturn", msg.channel.id, embed.response(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_USER_ABORTED));
                            message.delete();
                            bot.off("messageReactionAdd", userEventListener);
                        } else if (emoji.name === '✅') {
                            dbConnection.addUser(msg.author, timestamp, streak);
                            bot.emit("messageReturn", msg.channel.id, embed.response(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_USER_CONFIRMED));
                            message.delete();
                            bot.off("messageReactionAdd", userEventListener);
                        }
                    }
                };
                bot.on("messageReactionAdd", userEventListener);
            }
        );
}, {
    description: text.TRACK_DATE_SUBCOMMAND_DESCRIPTION,
    fullDescription: text.TRACK_DATE_SUBCOMMAND_FULL_DESCRIPTION
})

bot.registerCommand(text.REQUEST_COMMAND, async (msg, args) => {
        console.log(text.REQUEST_COMMAND);
        //Get first command.
        if (args.length === 0) {
            bot.emit("messageReturn", msg.channel.id, embed.error(text.REQUEST_COMMAND, text.COMMAND_SELECT_NO_USERS_ERROR));
            return;
        }
        let user = getUser(args, msg);
        console.log(user.username);
        await dbConnection.isUserInFellowship(msg.author, user)
            .then((inFellowship) => {
                if (inFellowship) {
                    bot.emit("messageReturn", msg.channel.id, embed.error(text.REQUEST_COMMAND, text.REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE(user.username)));
                } else {
                    let fellowshipEventListener;
                    let onFellowshipAdd;
                    let failureHandler;
                    bot.emit("messageReturn", msg.channel.id, embed.command(text.REQUEST_COMMAND, text.REQUEST_COMMAND_ON_FELLOWSHIP_ADDING_REQUEST(user.username)));
                    return bot.getDMChannel(user.id)
                        .then((channel) => {
                            onFellowshipAdd = function (_user) {
                                bot.emit("messageReturn", msg.channel.id, embed.response(text.REQUEST_COMMAND, text.COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE(user.username)));
                                bot.emit("messageReturn", channel.id, embed.response(text.REQUEST_COMMAND, text.COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE(msg.author.username)));
                            };
                            failureHandler = function (_error) {
                                bot.emit("messageReturn", channel.id, embed.error(text.REQUEST_COMMAND, text.REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST(msg.author.username)));
                            };
                            return channel.createMessage(embed.command(text.REQUEST_COMMAND, text.REQUEST_COMMAND_ON_FELLOWSHIP_TARGET_REQUEST(msg.author.username)))
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
                            }
                            bot.on("messageReactionAdd", fellowshipEventListener);
                        })
                }
            })


    },
    {
        description: text.REQUEST_COMMAND_DESCRIPTION,
        fullDescription: text.REQUEST_COMMAND_FULL_DESCRIPTION,
    });

bot.registerCommand(text.INVITE_COMMAND, async (msg, args) => {
        console.log(text.INVITE_COMMAND);
        //Get first command.
        if (args.length === 0) {
            bot.emit("messageReturn", msg.channel.id, embed.error(text.INVITE_COMMAND, text.COMMAND_SELECT_NO_USERS_ERROR));
            return;
        }
        let user = getUser(args, msg);
        console.log(user.username);
        await dbConnection.isUserInFellowship(user, msg.author)
            .then((inFellowship) => {
                if (inFellowship) {
                    bot.emit("messageReturn", msg.channel.id, embed.error(text.INVITE_COMMAND, text.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE(user.username)));
                } else {
                    let fellowshipEventListener;
                    let onFellowshipAdd;
                    let failureHandler;
                    bot.emit("messageReturn", msg.channel.id, embed.command(text.INVITE_COMMAND, text.INVITE_COMMAND_ON_FELLOWSHIP_TARGET_INVITE(user.username)));
                    return bot.getDMChannel(user.id)
                        .then((channel) => {
                            onFellowshipAdd = function (_user) {
                                bot.emit("messageReturn", msg.channel.id, embed.response(text.INVITE_COMMAND, text.COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE(user.username)));
                                bot.emit("messageReturn", channel.id, embed.command(text.INVITE_COMMAND, text.COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE(msg.author.username)));
                            };
                            failureHandler = function (_error) {
                                bot.emit("messageReturn", channel.id, embed.error(text.INVITE_COMMAND, text.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST(msg.author.username)));
                            };

                            return channel.createMessage(embed.command(text.INVITE_COMMAND, text.INVITE_COMMAND_ON_FELLOWSHIP_ADDING_INVITE(user.username)))
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
    },
    {
        description: text.INVITE_COMMAND_DESCRIPTION,
        fullDescription: text.INVITE_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.KICK_COMMAND, async (msg, args) => {
        console.log(text.KICK_COMMAND);
        //Get list of all users included in the arguments.
        if (args.length === 0) {
            bot.emit("messageReturn", msg.channel.id, embed.error(text.KICK_COMMAND, text.COMMAND_SELECT_NO_USERS_ERROR));
            return;
        }
        let user = getUser(args, msg);
        console.log(user.username);
        await dbConnection.isUserInFellowship(user, msg.author)
            .then((exists) => {
                if (!exists) {
                    bot.emit("messageReturn", msg.channel.id, text.KICK_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username));
                } else {
                    return bot.createMessage(msg.channel.id, embed.command(text.KICK_COMMAND, text.KICK_COMMAND_ON_KICK(user.username)))
                        .then((message) => {
                            message.addReaction('✅');
                            message.addReaction('❌');
                            let onFellowshipRemove = function (_user) {
                                bot.emit("messageReturn", msg.channel.id, embed.response(text.KICK_COMMAND, text.KICK_COMMAND_SUCCESS_RESPONSE(user.username)));
                            };
                            let failureHandler = function (_user) {
                                bot.emit("messageReturn", msg.channel.id, embed.error(text.KICK_COMMAND, text.KICK_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username)));
                            };
                            let fellowshipEventListener = async function (user_msg, emoji, id) {
                                if (user_msg.id === message.id && id === msg.author.id) {
                                    if (emoji.name === '❌') {
                                        await message.delete();
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    } else if (emoji.name === '✅') {
                                        await dbConnection.removeFromFellowship(user, msg.author, onFellowshipRemove, failureHandler);
                                        await message.delete();
                                        bot.off("messageReactionAdd", fellowshipEventListener);

                                    }
                                }
                            }
                            bot.on("messageReactionAdd", fellowshipEventListener);
                        })
                }
            })
    },
    {
        description: text.KICK_COMMAND_DESCRIPTION,
        fullDescription: text.KICK_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.LEAVE_COMMAND, async (msg, args) => {
        //Get list of all users included in the arguments.
        if (args.length === 0) {
            bot.emit("messageReturn", msg.channel.id, embed.error(text.LEAVE_COMMAND, text.COMMAND_SELECT_NO_USERS_ERROR));
            return;
        }
        let user = getUser(args, msg);
        console.log(user.username);
        await dbConnection.isUserInFellowship(msg.author, user)
            .then((exists) => {
                if (!exists) {
                    bot.emit("messageReturn", msg.channel.id, text.LEAVE_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username));
                } else {
                    return bot.createMessage(msg.channel.id, embed.command(text.LEAVE_COMMAND, text.LEAVE_COMMAND_ON_LEAVE(user.username)))
                        .then((message) => {
                            message.addReaction('✅');
                            message.addReaction('❌');
                            let onFellowshipRemove = function (_user) {
                                bot.emit("messageReturn", msg.channel.id, embed.response(text.LEAVE_COMMAND, text.LEAVE_COMMAND_SUCCESS_RESPONSE(user.username)));
                            }
                            let failureHandler = function (_user) {
                                bot.emit("messageReturn", msg.channel.id, embed.error(text.LEAVE_COMMAND, text.LEAVE_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username)));
                            }
                            let fellowshipEventListener = async function (user_msg, emoji, id) {
                                if (user_msg.id === message.id && id === msg.author.id) {
                                    if (emoji.name === '❌') {
                                        await message.delete();
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    } else if (emoji.name === '✅') {
                                        await dbConnection.removeFromFellowship(msg.author, user, onFellowshipRemove, failureHandler);
                                        await message.delete();
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    }
                                }
                            }
                            bot.on("messageReactionAdd", fellowshipEventListener);
                        })
                }
            })
    },
    {
        description: text.LEAVE_COMMAND_DESCRIPTION,
        fullDescription: text.LEAVE_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.GET_MEMBERSHIP_COMMAND, async (msg) => {
    let successHandler = function (users) {
        bot.emit("messageReturn", msg.channel.id, embed.response(text.GET_MEMBERSHIP_COMMAND, getUsernames(users).toString()));
    }
    let failureHandler = function (_error) {
        bot.emit("messageReturn", msg.channel.id, embed.error(text.GET_MEMBERSHIP_COMMAND, text.GET_MEMBERSHIP_COMMAND_ERROR));
    }
    await dbConnection.getMembership(msg.author, successHandler, failureHandler)
},
    {
        description: text.GET_MEMBERSHIP_DESCRIPTION,
        fullDescription: text.GET_MEMBERSHIP_FULL_DESCRIPTION
    });

bot.registerCommand(text.GET_FELLOWSHIP_COMMAND, async (msg) => {
    let successHandler = function (users) {
        bot.emit("messageReturn", msg.channel.id, embed.response(text.GET_FELLOWSHIP_COMMAND, getUsernames(users).toString()));
    }
    let failureHandler = function (_error) {
        bot.emit("messageReturn", msg.channel.id, embed.error(text.GET_FELLOWSHIP_COMMAND, text.GET_FELLOWSHIP_COMMAND_ERROR));
    }
    await dbConnection.getFellowship(msg.author, successHandler, failureHandler)
},
    {
        description: text.GET_FELLOWSHIP_DESCRIPTION,
        fullDescription: text.GET_FELLOWSHIP_FULL_DESCRIPTION
    });

// bot.registerCommand(text.NOTIFY_COMMAND, async (msg) => {
//     bot.emit("messageReturn", msg.channel.id, text.NOTIFY);
//     let userMessageList = [];
//     let notifyMessageIngest = async function (user_msg, emoji, id) {
//         if (user_msg.id === user_message.id && id === user.id) {
//             if (emoji.name === '❌') {
//                 await user_message.delete();
//                 bot.off("messageReactionAdd", notifyMessageIngest);
//             } else if (emoji.name === '✅') {
//
//                 await user_message.delete();
//                 bot.off("messageReactionAdd", notifyMessageIngest);
//             }
//         }
//     }
//     bot.on("messageCreate", notifyMessageIngest);
//     let messageIngest = async function (message) {
//         userMessageList.push(message);
//         if (message.content.startsWith("!")) {
//             await Promise.all(userMessageList).delete();
//             bot.off("messageCreate", messageIngest);
//         }
//     }
//     bot.on("messageCreate", messageIngest);
// })




bot.connect();