const Eris = require('eris');
const Chrono = require('chrono-node');
const vault = require('node-vault-client');
const Redis = require('ioredis');
const sp = require('synchronized-promise')
const db = require('./app/db.js');
const embed = require('./app/embed.js');
const text = require('./app/text.js');

const vaultClient = vault.boot('main', {
    api: { url: process.env.VAULT_URL },
    auth: {
        type: 'token',
        config: { token: process.env.VAULT_TOKEN }
    },
    request: { ca: process.env.VAULT_CA }
});
console.log("Initialized vault.");

const dbConnectionInit = () => {
    return vaultClient.read('samwise/redis')
        .then(v => {
            return new Redis({
                port: 6379, // Redis port
                host: process.env.REDIS_HOST, // Redis host
                family: 4, // 4 (IPv4) or 6 (IPv6)
                password: v.getValue('password'),
                db: 0,
            });
        }).then(redis => {
            return new db.database(redis);
        }).catch(e => console.error(e));
}

let dbConnectionPromise = sp(dbConnectionInit);
const dbConnection = dbConnectionPromise();

console.log("Initialized redis client.");

const botInit = () => {
    return vaultClient.read('samwise/bot')
        .then(v => {
            return new Eris.CommandClient(v.getValue('token'), {}, {
                description: text.BOT_DESCRIPTION,
                owner: text.BOT_OWNER,
                deleteCommand: true,
                prefix: "!"
            });
        }).catch(e => console.error(e))
};

let botPromise = sp(botInit);
const bot = botPromise();

console.log("Initialized bot client.");

bot.on("ready", () => {
    console.log("Ready to roll.");
});

bot.on("messageReturn", async (id, msgToReturn) => {
    await bot.getDMChannel(id).then((channel) => {
        bot.createMessage(channel.id, msgToReturn);
    });
});

function getUser(msg) {
    console.log("getUser");
    let users = msg.mentions;
    let returningUser = null;
    let user = users.filter(user => !user.id.includes(msg.author.id));
    if (user.length > 0) {
        returningUser = user[0];
        console.log(returningUser.username);
    } else {
        bot.emit("messageReturn", msg.author.id, embed.error(msg.command.label, text.COMMAND_SELECT_NO_USERS_ERROR));
    }
    return returningUser;
}

const tracking = bot.registerCommand(text.TRACK_COMMAND, () => {
        bot.emit("messageReturn", msg.author.id, embed.command(text.TRACK_COMMAND, text.TRACK_COMMAND_FULL_DESCRIPTION));
    },
    {
        dmOnly: true,
        description: text.TRACK_COMMAND_DESCRIPTION,
        fullDescription: text.TRACK_COMMAND_FULL_DESCRIPTION,
    });

tracking.registerSubcommand(text.TRACK_RESET_SUBCOMMAND, async (msg) => {
        console.log(text.TRACK_RESET_SUBCOMMAND);
        let successHandler = async function (focus) {
            bot.emit("messageReturn", msg.author.id, embed.response(text.TRACK_RESET_SUBCOMMAND, text.TRACK_RESET_SUBCOMMAND_RESPONSE));
            let fellowshipNotEmpty = function (users) {
                //3. If fellowship not empty, send message asking if you would like to notify your fellowship of your reset.
                bot.getDMChannel(msg.author.id).then((channel) => {
                    return bot.createMessage(channel.id, embed.command(text.TRACK_RESET_SUBCOMMAND, text.TRACK_RESET_SUBCOMMAND_FOLLOWUP));
                }).then((message) => {
                    message.addReaction('✅');
                    message.addReaction('❌');
                    userEventListener = async function (user_msg, emoji, reactor) {
                        if (user_msg.id === message.id && reactor.id === msg.author.id) {
                            if (emoji.name === '❌') {
                                bot.off("messageReactionAdd", userEventListener);
                            } else if (emoji.name === '✅') {
                                //4. Send to all users
                                for (user of users) {
                                    bot.emit("messageReturn", user, embed.alert(text.TRACK_RESET_SUBCOMMAND, text.TRACK_RESET_SUBCOMMAND_FOLLOWUP_TEXT(msg.author.username, focus)));
                                }
                                bot.emit("messageReturn", msg.author.id, embed.response(text.TRACK_RESET_SUBCOMMAND, text.TRACK_RESET_SUBCOMMAND_FOLLOWUP_SUCCESS));
                                bot.off("messageReactionAdd", userEventListener);
                            }
                        }
                    };
                    bot.on("messageReactionAdd", userEventListener);
                }).catch(e => console.error(e));
            }
            if (focus !== null) {
                //2. if focus exists then try to get the fellowship
                await dbConnection.getFellowship(msg.author, fellowshipNotEmpty,);
            } else {
                bot.emit("messageReturn", msg.author.id, embed.response(text.TRACK_RESET_SUBCOMMAND, error));
            }
        };
        let failureHandler = function (error) {
            bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_RESET_SUBCOMMAND, error));
        };
        // 1. reset the tracking
        await dbConnection.reset(msg.author, successHandler, failureHandler);

    },
    {
        dmOnly: true,
        description: text.TRACK_RESET_SUBCOMMAND_DESCRIPTION,
        fullDescription: text.TRACK_RESET_SUBCOMMAND_FULL_DESCRIPTION,
    });

tracking.registerSubcommand(text.TRACK_STREAK_SUBCOMMAND, async (msg) => {
    console.log(text.TRACK_STREAK_SUBCOMMAND);
    let successHandler = function (streak) {
        bot.emit("messageReturn", msg.author.id, embed.response(text.TRACK_STREAK_SUBCOMMAND,
            text.TRACK_STREAK_SUBCOMMAND_RETURN_STREAK(
                dbConnection.getDaysDifference(streak[0]), streak[1])));
    };
    let failureHandler = function (error) {
        bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_STREAK_SUBCOMMAND, error));
    };
    await dbConnection.getStreak(msg.author, successHandler, failureHandler);
}, {
    dmOnly: true,
    description: text.TRACK_STREAK_SUBCOMMAND_DESCRIPTION,
    fullDescription: text.TRACK_STREAK_SUBCOMMAND_FULL_DESCRIPTION
});

tracking.registerSubcommand(text.TRACK_FOCUS_SUBCOMMAND, async (msg, args) => {
    console.log(text.TRACK_FOCUS_SUBCOMMAND);
    if (args.length !== 0) {
        const focus = args.join(" ");
        let successHandler = function (_user) {
            bot.emit("messageReturn", msg.author.id, embed.response(text.TRACK_FOCUS_SUBCOMMAND, text.TRACK_FOCUS_SUBCOMMAND_SUCCESS));
        };
        let failureHandler = function (error) {
            bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_FOCUS_SUBCOMMAND, error));
        };
        await dbConnection.setFocus(msg.author, focus, successHandler, failureHandler);
    } else {
        bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_FOCUS_SUBCOMMAND, text.TRACK_FOCUS_SUBCOMMAND_INPUT_ERROR));
    }
}, {
    dmOnly: true,
    description: text.TRACK_FOCUS_SUBCOMMAND_DESCRIPTION,
    fullDescription: text.TRACK_FOCUS_SUBCOMMAND_FULL_DESCRIPTION
})

tracking.registerSubcommand(text.TRACK_THRESHOLD_SUBCOMMAND, async (msg, args) => {
    console.log(text.TRACK_THRESHOLD_SUBCOMMAND);
    const threshold = parseInt(args.join(" "), 10);
    console.log(threshold);
    if(isNaN(threshold)){
        bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_THRESHOLD_SUBCOMMAND, text.TRACK_THRESHOLD_SUBCOMMAND_INPUT_ERROR));
        return;
    } else if (threshold === 0){
        bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_THRESHOLD_SUBCOMMAND, text.TRACK_THRESHOLD_SUBCOMMAND_ZERO_ERROR));
        return;
    }
    let successHandler = function (_users) {
        bot.emit("messageReturn", msg.author.id, embed.response(text.TRACK_THRESHOLD_SUBCOMMAND, text.TRACK_THRESHOLD_SUBCOMMAND_SUCCESS));
    };
    let failureHandler = function (error) {
        bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_THRESHOLD_SUBCOMMAND, error));
    };
    await dbConnection.setThreshold(msg.author, threshold, successHandler, failureHandler);
}, {
    dmOnly: true,
    description: text.TRACK_THRESHOLD_SUBCOMMAND_DESCRIPTION,
    fullDescription: text.TRACK_THRESHOLD_SUBCOMMAND_FULL_DESCRIPTION
});

tracking.registerSubcommand(text.TRACK_LIST_SUBCOMMAND, async (msg, args) => {
    console.log(text.TRACK_LIST_SUBCOMMAND);
    let successHandler = async function (users) {
        let returnHandler = function (usernames) {
            bot.emit("messageReturn", msg.author.id, embed.response(text.TRACK_LIST_SUBCOMMAND, text.TRACK_LIST_SUBCOMMAND_TITLE(usernames)));
        };
        await dbConnection.getUsernames(users, returnHandler);
    };
    let failureHandler = function (error) {
        bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_LIST_SUBCOMMAND, error));
    };
    await dbConnection.trackedList(msg.author, successHandler, failureHandler);
}, {
    dmOnly: true,
    description: text.TRACK_LIST_SUBCOMMAND_DESCRIPTION,
    fullDescription: text.TRACK_LIST_SUBCOMMAND_FULL_DESCRIPTION
})

tracking.registerSubcommand(text.TRACK_DATE_SUBCOMMAND, async (msg, args) => {
    console.log(text.TRACK_DATE_SUBCOMMAND);
    const parse = args.join(" ");
    // Make a string of the text after the command label
    if(!parse){
        bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_INVALID_DATE));
        return;
    }
    const results = Chrono.parse(parse);
    if(!results){
        bot.emit("messageReturn", msg.author.id, embed.error(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_INVALID_DATE));
        return;
    }
    const timestamp = results[0].start.date().getTime();
    console.log(timestamp);
    // Finding the difference in milliseconds and converting to days.
    const streak = dbConnection.getDaysDifference(timestamp);
    // return date that can is stored as a reference point for restoring streak data.
    console.log(results[0].start.date());
    let userEventListener;
    await dbConnection.isUserTracked(msg.author).then((exists) => {
        if (exists) {
            bot.emit("messageReturn", msg.author.id, embed.command(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_ALREADY_TRACKED_WARNING));
        }
        return bot.getDMChannel(msg.author.id)})
        .then((channel) => {
            return bot.createMessage(channel.id, embed.command(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_RETURN_STREAK(streak)))
        }).then((message) => {
                message.addReaction('✅');
                message.addReaction('❌');
                userEventListener = function (user_msg, emoji, reactor) {
                    if (user_msg.id === message.id && reactor.id === msg.author.id) {
                        if (emoji.name === '❌') {
                            bot.emit("messageReturn", msg.author.id, embed.response(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_USER_ABORTED));
                            bot.off("messageReactionAdd", userEventListener);
                        } else if (emoji.name === '✅') {
                            dbConnection.trackUser(msg.author, timestamp, streak);
                            bot.emit("messageReturn", msg.author.id, embed.response(text.TRACK_DATE_SUBCOMMAND, text.TRACK_DATE_SUBCOMMAND_USER_CONFIRMED));
                            bot.off("messageReactionAdd", userEventListener);
                        }
                    }
                };
                bot.on("messageReactionAdd", userEventListener);
            }
        );
}, {
    dmOnly: true,
    deleteCommand: true,
    description: text.TRACK_DATE_SUBCOMMAND_DESCRIPTION,
    fullDescription: text.TRACK_DATE_SUBCOMMAND_FULL_DESCRIPTION
})

bot.registerCommand(text.GET_MEMBERSHIP_COMMAND, async (msg) => {
        console.log(text.GET_MEMBERSHIP_COMMAND)
        let successHandler = async function (users) {
            let returnHandler = function (usernames){
                bot.emit("messageReturn", msg.author.id, embed.response(text.GET_MEMBERSHIP_COMMAND, text.GET_MEMBERSHIP_COMMAND_TITLE(usernames)));
            };
            await dbConnection.getUsernames(users, returnHandler);
        };
        let failureHandler = function (_error) {
            bot.emit("messageReturn", msg.author.id, embed.error(text.GET_MEMBERSHIP_COMMAND, text.GET_MEMBERSHIP_COMMAND_ERROR));
        };
        await dbConnection.getMembership(msg.author, successHandler, failureHandler)
    },
    {
        dmOnly: true,
        description: text.GET_MEMBERSHIP_COMMAND_DESCRIPTION,
        fullDescription: text.GET_MEMBERSHIP_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.GET_FELLOWSHIP_COMMAND, async (msg) => {
        console.log(text.GET_FELLOWSHIP_COMMAND);
        let successHandler = async function (users) {
            let returnHandler = function (usernames) {
                bot.emit("messageReturn", msg.author.id, embed.response(text.GET_FELLOWSHIP_COMMAND, text.GET_FELLOWSHIP_COMMAND_TITLE(usernames)));
            };
            await dbConnection.getUsernames(users, returnHandler);
        };
        let failureHandler = function (_error) {
            bot.emit("messageReturn", msg.author.id, embed.error(text.GET_FELLOWSHIP_COMMAND, text.GET_FELLOWSHIP_COMMAND_ERROR));
        };
        await dbConnection.getFellowship(msg.author, successHandler, failureHandler)
    },
    {
        dmOnly: true,
        description: text.GET_FELLOWSHIP_COMMAND_DESCRIPTION,
        fullDescription: text.GET_FELLOWSHIP_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.NOTIFY_COMMAND, async (msg) => {
        //initial check for empty fellowship.
        console.log(text.NOTIFY_COMMAND);
        let fellowshipEmpty = function (_error) {
            console.log("fellowship empty");
            bot.emit("messageReturn", msg.author.id, embed.error(text.NOTIFY_COMMAND, text.NOTIFY_COMMAND_NO_FELLOWSHIP_ERROR));
        };
        let fellowshipNotEmpty = async function (users) {
            console.log("fellowship not empty");
            console.log(users);
            let userMessageList = [];
            var handlerList = {};
            //Aggregate all the messages that need to go into the notification.
            console.log("messageIngest")
            let messageIngest = async function (message) {
                if (message.content.startsWith("!")) {
                    await Promise.all(userMessageList).delete();
                    bot.emit("messageReturn", msg.author.id, embed.response(text.NOTIFY_COMMAND, text.NOTIFY_COMMAND_CANCELLATION));
                    for (const [key, value] of Object.entries(handlerList)) {
                        bot.off(key, value)
                    }
                } else {
                    userMessageList.push(message);
                }
            };
            bot.on("messageCreate", messageIngest);
            handlerList["messageCreate"] = messageIngest;
            //Emotes will send/cancel message.
            await bot.getDMChannel(msg.author.id)
                .then((channel) => {
                    return bot.createMessage(channel.id, embed.command(text.NOTIFY_COMMAND, text.NOTIFY_COMMAND_INITIALIZATION));
                })
                .then((message) => {
                    message.addReaction('✅');
                    message.addReaction('❌');
                    //confirm message / erase message
                    let messageSendTrigger = async function (user_msg, emoji, reactor) {
                        if (user_msg.id === message.id && reactor.id === msg.author.id) {
                            if (emoji.name === '❌') {
                                for (const [key, value] of Object.entries(handlerList)) {
                                    bot.off(key, value);
                                }
                                bot.emit("messageReturn", msg.author.id, embed.response(text.NOTIFY_COMMAND, text.NOTIFY_COMMAND_CANCELLATION));
                            } else if (emoji.name === '✅') {
                                let userNotification = "";
                                for (userMessage of userMessageList) {
                                    userNotification = userNotification + "\n" + userMessage.content;
                                }
                                for (user of users) {
                                    bot.emit("messageReturn", user, embed.alert(msg.author.username, userNotification));
                                }
                                bot.emit("messageReturn", msg.author.id, embed.response(text.NOTIFY_COMMAND, text.NOTIFY_COMMAND_SUCCESS));
                                for (const [key, value] of Object.entries(handlerList)) {
                                    bot.off(key, value);
                                }
                            }
                        }
                    };
                    bot.on("messageReactionAdd", messageSendTrigger);
                    handlerList["messageReactionAdd"] = messageSendTrigger;
                });
        };
        await dbConnection.getFellowship(msg.author, fellowshipNotEmpty, fellowshipEmpty);
    },
    {
        dmOnly: true,
        description: text.NOTIFY_COMMAND_DESCRIPTION,
        fullDescription: text.NOTIFY_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.JOIN_COMMAND, async (msg) => {
        console.log(text.JOIN_COMMAND);
        //Get first command.
        if (msg.mentions.length === 0) {
            bot.emit("messageReturn", msg.author.id, embed.error(text.JOIN_COMMAND, text.COMMAND_SELECT_NO_USERS_ERROR));
            return;
        }
        let user = getUser(msg);
        console.log(user.username);
        await dbConnection.isUserInFellowship(msg.author, user)
            .then((inFellowship) => {
                if (inFellowship) {
                    //Will not add message sender to fellowship if already exists in fellowship.
                    bot.emit("messageReturn", msg.author.id, embed.error(text.JOIN_COMMAND, text.JOIN_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE(user.username)));
                } else {
                    let fellowshipEventListener;
                    let onFellowshipAdd;
                    let failureHandler;
                    bot.emit("messageReturn", msg.author.id, embed.command(text.JOIN_COMMAND, text.JOIN_COMMAND_ON_FELLOWSHIP_ADDING_REQUEST(user.username)));
                    //Notify other user of intent to join fellowship and this will be approved by emote selection.
                    return bot.getDMChannel(user.id)
                        .then((channel) => {
                            onFellowshipAdd = function (_user) {
                                bot.emit("messageReturn", msg.author.id, embed.response(text.JOIN_COMMAND, text.COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE(user.username)));
                                bot.emit("messageReturn", user.id, embed.response(text.JOIN_COMMAND, text.COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE(msg.author.username)));
                            };
                            failureHandler = function (_error) {
                                bot.emit("messageReturn", user.id, embed.error(text.JOIN_COMMAND, text.JOIN_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST(msg.author.username)));
                            };
                            return channel.createMessage(embed.command(text.JOIN_COMMAND, text.JOIN_COMMAND_ON_FELLOWSHIP_TARGET_REQUEST(msg.author.username)))
                        })
                        .then((user_message) => {
                            user_message.addReaction('✅');
                            user_message.addReaction('❌');
                            fellowshipEventListener = async function (user_msg, emoji, reactor) {
                                if (user_msg.id === user_message.id && reactor.id === user.id) {
                                    if (emoji.name === '❌') {
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    } else if (emoji.name === '✅') {
                                        await dbConnection.addToFellowship(msg.author, user, onFellowshipAdd, failureHandler);
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    }
                                }
                            };
                            bot.on("messageReactionAdd", fellowshipEventListener);
                        })
                }
            }).catch(e => console.error(e));
    },
    {
        guildOnly: true,
        deleteCommand: true,
        description: text.JOIN_COMMAND_DESCRIPTION,
        fullDescription: text.JOIN_COMMAND_FULL_DESCRIPTION,
    });

bot.registerCommand(text.INVITE_COMMAND, async (msg) => {
        console.log(text.INVITE_COMMAND);
        //Get first command.
        if (msg.mentions.length === 0) {
            bot.emit("messageReturn", msg.author.id, embed.error(text.INVITE_COMMAND, text.COMMAND_SELECT_NO_USERS_ERROR));
            return;
        }
        let user = getUser(msg);
        console.log(user.username);
        await dbConnection.isUserInFellowship(user, msg.author)
            .then(async (inFellowship) => {
                if (inFellowship) {
                    //Will not add user to fellowship if already exists in fellowship.
                    bot.emit("messageReturn", msg.author.id, embed.error(text.INVITE_COMMAND, text.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE(user.username)));
                } else {
                    let fellowshipEventListener;
                    let onFellowshipAdd;
                    let failureHandler;
                    bot.emit("messageReturn", msg.author.id, embed.command(text.INVITE_COMMAND, text.INVITE_COMMAND_ON_FELLOWSHIP_TARGET_INVITE(user.username)));
                    //Notify other user of intent to add to fellowship and this will be approved by emote selection.
                    await bot.getDMChannel(user.id)
                        .then((channel) => {
                            onFellowshipAdd = function (_user) {
                                bot.emit("messageReturn", msg.author.id, embed.response(text.INVITE_COMMAND, text.COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE(user.username)));
                                bot.emit("messageReturn", user.id, embed.response(text.INVITE_COMMAND, text.COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE(msg.author.username)));
                            };
                            failureHandler = function (_error) {
                                bot.emit("messageReturn", user.id, embed.error(text.INVITE_COMMAND, text.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST(msg.author.username)));
                            };

                            return channel.createMessage(embed.command(text.INVITE_COMMAND, text.INVITE_COMMAND_ON_FELLOWSHIP_ADDING_INVITE(user.username)))
                        })
                        .then((user_message) => {
                            user_message.addReaction('✅');
                            user_message.addReaction('❌');
                            fellowshipEventListener = async function (user_msg, emoji, reactor) {
                                if (user_msg.id === user_message.id && reactor.id === user.id) {
                                    if (emoji.name === '❌') {
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    } else if (emoji.name === '✅') {
                                        await dbConnection.addToFellowship(user, msg.author, onFellowshipAdd, failureHandler);
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    }
                                }
                            };
                            bot.on("messageReactionAdd", fellowshipEventListener);
                        })
                }
            }).catch(e => console.error(e));
    },
    {
        guildOnly: true,
        deleteCommand: true,
        description: text.INVITE_COMMAND_DESCRIPTION,
        fullDescription: text.INVITE_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.KICK_COMMAND, async (msg) => {
        console.log(text.KICK_COMMAND);
        //Get list of all users included in the arguments.
        if (msg.mentions.length === 0) {
            bot.emit("messageReturn", msg.author.id, embed.error(text.KICK_COMMAND, text.COMMAND_SELECT_NO_USERS_ERROR));
            return;
        }
        let user = getUser(msg);
        console.log(user.username);
        await dbConnection.isUserInFellowship(user, msg.author)
            .then((exists) => {
                if (!exists) {
                    bot.emit("messageReturn", msg.author.id, embed.error(text.KICK_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username)));
                } else {
                    return bot.getDMChannel(msg.author.id)
                        .then((channel) => {
                            return bot.createMessage(channel.id, embed.command(text.KICK_COMMAND, text.KICK_COMMAND_ON_KICK(user.username)));
                        })
                        .then((message) => {
                            message.addReaction('✅');
                            message.addReaction('❌');
                            let onFellowshipRemove = function (_user) {
                                bot.emit("messageReturn", msg.author.id, embed.response(text.KICK_COMMAND, text.KICK_COMMAND_SUCCESS_RESPONSE(user.username)));
                            };
                            let failureHandler = function (_user) {
                                bot.emit("messageReturn", msg.author.id, embed.error(text.KICK_COMMAND, text.KICK_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username)));
                            };
                            let fellowshipEventListener = async function (user_msg, emoji, reactor) {
                                if (user_msg.id === message.id && reactor.id === msg.author.id) {
                                    if (emoji.name === '❌') {
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    } else if (emoji.name === '✅') {
                                        await dbConnection.removeFromFellowship(user, msg.author, onFellowshipRemove, failureHandler);
                                        bot.off("messageReactionAdd", fellowshipEventListener);

                                    }
                                }
                            };
                            bot.on("messageReactionAdd", fellowshipEventListener);
                        })
                }
            }).catch(e => console.error(e));
    },
    {
        guildOnly: true,
        deleteCommand: true,
        description: text.KICK_COMMAND_DESCRIPTION,
        fullDescription: text.KICK_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.LEAVE_COMMAND, async (msg) => {
        console.log(text.LEAVE_COMMAND);
        //Get list of all users included in the arguments.
        if (msg.mentions.length === 0) {
            bot.emit("messageReturn", msg.author.id, embed.error(text.LEAVE_COMMAND, text.COMMAND_SELECT_NO_USERS_ERROR));
            return;
        }
        let user = getUser(msg);
        console.log(user.username);
        await dbConnection.isUserInFellowship(msg.author, user)
            .then((exists) => {
                if (!exists) {
                    bot.emit("messageReturn", msg.author.id, text.LEAVE_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username));
                } else {
                    return bot.getDMChannel(msg.author.id)
                        .then((channel) => {
                            return bot.createMessage(channel.id, embed.command(text.LEAVE_COMMAND, text.LEAVE_COMMAND_ON_LEAVE(user.username)));
                        })
                        .then((message) => {
                            message.addReaction('✅');
                            message.addReaction('❌');
                            let onFellowshipRemove = function (_user) {
                                bot.emit("messageReturn", msg.author.id, embed.response(text.LEAVE_COMMAND, text.LEAVE_COMMAND_SUCCESS_RESPONSE(user.username)));
                            };
                            let failureHandler = function (_user) {
                                bot.emit("messageReturn", msg.author.id, embed.error(text.LEAVE_COMMAND, text.LEAVE_COMMAND_NOT_IN_FELLOWSHIP_ERROR(user.username)));
                            };
                            let fellowshipEventListener = async function (user_msg, emoji, reactor) {
                                if (user_msg.id === message.id && reactor.id === msg.author.id) {
                                    if (emoji.name === '❌') {
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    } else if (emoji.name === '✅') {
                                        await dbConnection.removeFromFellowship(msg.author, user, onFellowshipRemove, failureHandler);
                                        bot.off("messageReactionAdd", fellowshipEventListener);
                                    }
                                }
                            };
                            bot.on("messageReactionAdd", fellowshipEventListener);
                        })
                }
            }).catch(e => console.error(e));
    },
    {
        guildOnly: true,
        deleteCommand: true,
        description: text.LEAVE_COMMAND_DESCRIPTION,
        fullDescription: text.LEAVE_COMMAND_FULL_DESCRIPTION
    });

bot.registerCommand(text.FAQ_COMMAND, async (msg) => {
        console.log(text.FAQ_COMMAND);
        bot.emit("messageReturn", msg.author.id, embed.command(text.FAQ_COMMAND_QUESTION_1, text.FAQ_COMMAND_ANSWER_1));
        bot.emit("messageReturn", msg.author.id, embed.command(text.FAQ_COMMAND_QUESTION_2, text.FAQ_COMMAND_ANSWER_2));
        bot.emit("messageReturn", msg.author.id, embed.command(text.FAQ_COMMAND_QUESTION_3, text.FAQ_COMMAND_ANSWER_3));
        bot.emit("messageReturn", msg.author.id, embed.command(text.FAQ_COMMAND_QUESTION_4, text.FAQ_COMMAND_ANSWER_4));
    },
    {
        description: text.FAQ_COMMAND_DESCRIPTION,
        fullDescription: text.FAQ_COMMAND_FULL_DESCRIPTION
    });

bot.connect();