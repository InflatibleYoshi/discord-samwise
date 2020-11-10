exports.BOT_DESCRIPTION = "A discord bot that brings community within arm's reach when dealing with the lowest lows to giving life updates.";
exports.BOT_OWNER = "InflatibleYoshi";

exports.COMMAND_SELECT_NO_USERS_ERROR = "You did not match any users with your command.";
exports.COMMAND_SELECT_CANCEL = "You have canceled the operation.";
exports.COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE = function(username) {return `You have been added to the fellowship of ${username}!`};
exports.COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE = function(username) {return `You have added ${username} to your fellowship!`};

exports.TRACK_RESPONSE = "This command is only available to tracked users.";
exports.TRACK_COMMAND = "track";
exports.TRACK_COMMAND_DESCRIPTION = "Type !help track to get info on the subcommands available: \'date\', \'streak\', \'reset\', \'focus\', \'list\', and \'threshold\'.\n";
exports.TRACK_COMMAND_FULL_DESCRIPTION = "Type !help track <subcommand> for more information on each subcommand.";
exports.TRACK_DATE_SUBCOMMAND = "date";
exports.TRACK_DATE_SUBCOMMAND_DESCRIPTION = "Track user with user-entered start date.";
exports.TRACK_DATE_SUBCOMMAND_FULL_DESCRIPTION = "If you would like to track the days you've spent dedicated towards a single goal such as being free from addiction, " +
    "\ntype '!track date \"timestamp\" filling" +
    "\n\"timestamp\" with your Day 1 as: \'DD Mon YYYY HH:mm:ss TZ\'" +
    "e.g. !track date 01 Jan 1970 00:00:00 GMT";
exports.TRACK_DATE_SUBCOMMAND_INVALID_DATE = "Invalid date entered."
exports.TRACK_DATE_SUBCOMMAND_ALREADY_TRACKED_WARNING = "You are already tracked so this command will overwrite your data including your maximum streak.";
exports.TRACK_DATE_SUBCOMMAND_RETURN_STREAK = function(streak) {return `This puts your current streak at ${streak} days.\n Do you want to proceed with these options?`};
exports.TRACK_DATE_SUBCOMMAND_USER_ABORTED = "Your tracking configuration was not saved.";
exports.TRACK_DATE_SUBCOMMAND_USER_CONFIRMED = "Your tracking configuration was saved.";
exports.TRACK_STREAK_SUBCOMMAND = "streak";
exports.TRACK_STREAK_SUBCOMMAND_DESCRIPTION = "View your max and current streak.";
exports.TRACK_STREAK_SUBCOMMAND_FULL_DESCRIPTION = "View your current streak and maximum streak.";
exports.TRACK_STREAK_SUBCOMMAND_RETURN_STREAK = function(streak, max) {return `Your current streak is ${streak} days. Your max streak is ${max}`}
exports.TRACK_RESET_SUBCOMMAND = "reset";
exports.TRACK_RESET_SUBCOMMAND_DESCRIPTION = "Reset tracked user's streak.";
exports.TRACK_RESET_SUBCOMMAND_FULL_DESCRIPTION = "This command resets the tracked user's streak. And can optionally notify the rest of the user's fellowship.";
exports.TRACK_RESET_SUBCOMMAND_RESPONSE = "Aw shucks, you'll get em next time.";
exports.TRACK_RESET_SUBCOMMAND_FOLLOWUP = "Would you like to notify the rest of your fellowship?";
exports.TRACK_RESET_SUBCOMMAND_FOLLOWUP_SUCCESS = "You have notified the rest of your fellowship.";
exports.TRACK_RESET_SUBCOMMAND_FOLLOWUP_TEXT = function(username, focus) {return `Please pray for/support ${username}, he is dealing with issues of ${focus}.`};
exports.TRACK_FOCUS_SUBCOMMAND = "focus";
exports.TRACK_FOCUS_SUBCOMMAND_SUCCESS = "You have set your focus successfully.";
exports.TRACK_FOCUS_SUBCOMMAND_DESCRIPTION = "This command defines what you are tracking.";
exports.TRACK_FOCUS_SUBCOMMAND_INPUT_ERROR = "Please type a focus for yourself."
exports.TRACK_FOCUS_SUBCOMMAND_FULL_DESCRIPTION = "Use this command if you would like to notify your fellowship when you have a reset." +
    "e.g. !track focus alcoholism";
exports.TRACK_THRESHOLD_SUBCOMMAND = "threshold";
exports.TRACK_THRESHOLD_SUBCOMMAND_INPUT_ERROR = "Please set your threshold to a number and make sure that you only type 1 number."
exports.TRACK_THRESHOLD_SUBCOMMAND_ZERO_ERROR = "Please set your threshold to a number that is not zero."
exports.TRACK_THRESHOLD_SUBCOMMAND_SUCCESS = "You have set your threshold successfully.";
exports.TRACK_THRESHOLD_SUBCOMMAND_DESCRIPTION = "Set a threshold of days in which you would like more moral support.";
exports.TRACK_THRESHOLD_SUBCOMMAND_FULL_DESCRIPTION = "Use this command if you would like your fellowship to know when you're struggling especially with your focus" +
    "by setting an amount of days since last reset in which you would need the most moral support. If you are within this threshold, you'll be mentoned on the danger zone table.";
exports.TRACK_LIST_SUBCOMMAND = "list";
exports.TRACK_LIST_SUBCOMMAND_DESCRIPTION = "This command will list all the users you know that are in their threshold.";
exports.TRACK_LIST_SUBCOMMAND_FULL_DESCRIPTION = "This command will list check your personal membership and list all the users that are in their threshold.";
exports.TRACK_LIST_SUBCOMMAND_TITLE = function(usernames) {return `This is the list of fellowships that you're a member of that are tracked and are within their threshold of needing prayer/moral support:\n\n${usernames}`};

exports.JOIN_COMMAND = "join";
exports.JOIN_COMMAND_DESCRIPTION = "Request to join a user's fellowship.";
exports.JOIN_COMMAND_FULL_DESCRIPTION = "Request to join another user's fellowship by typing that user's" +
    "username or user id to the right of the !join command.";
exports.JOIN_COMMAND_ON_FELLOWSHIP_ADDING_REQUEST = function(username) {return `You have sent your request to ${username}!`};
exports.JOIN_COMMAND_ON_FELLOWSHIP_TARGET_REQUEST = function(username) {return `${username} has requested to join your fellowship!\n
Use the reaction buttons to choose whether or not to accept or decline the request.`};
exports.JOIN_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE = function(username) {return `You are already in ${username}'s fellowship.`};
exports.JOIN_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST = function(username) {return `${username} is already in your fellowship.`};

exports.INVITE_COMMAND = "invite";
exports.INVITE_COMMAND_DESCRIPTION = "Invite another user to your fellowship.";
exports.INVITE_COMMAND_FULL_DESCRIPTION = "Invite a user to your fellowship by typing that user's" +
    "username or user id to the right of the !invite command.";
exports.INVITE_COMMAND_ON_FELLOWSHIP_ADDING_INVITE = function(username) {return `${username} has asked you to join his/her/its fellowship!
Use the reaction buttons to choose whether or not to accept or decline the invite!`};
exports.INVITE_COMMAND_ON_FELLOWSHIP_TARGET_INVITE = function(username) {return `You have invited ${username} to join your fellowship!`};
exports.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE = function(username) {return `${username} is already in your fellowship.`};
exports.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST = function(username) {return `You are already in ${username}'s fellowship.`};

exports.KICK_COMMAND = "kick";
exports.KICK_COMMAND_DESCRIPTION = "Kick a user from your fellowship.";
exports.KICK_COMMAND_FULL_DESCRIPTION = "Kick a user from your fellowship by typing that user's" +
    "username or user id to the right of the !kick command.";
exports.KICK_COMMAND_ON_KICK = function(username) {return `You have decided to remove ${username} from your fellowship.
Use the reaction buttons to confirm or deny.`};
exports.KICK_COMMAND_SUCCESS_RESPONSE = function(username) {return `You have removed ${username} from your fellowship.`};
exports.KICK_COMMAND_NOT_IN_FELLOWSHIP_ERROR = function(username) {return `${username} was not part of your fellowship to begin with.`};

exports.LEAVE_COMMAND = "leave";
exports.LEAVE_COMMAND_DESCRIPTION = "Leave a fellowship.";
exports.LEAVE_COMMAND_FULL_DESCRIPTION = "Leave a user's fellowship by typing that user's" +
    "username or user id to the right of the !leave command";
exports.LEAVE_COMMAND_ON_LEAVE = function(username) {return `You have decided to leave the fellowship(s) of ${username}.
Use the reaction buttons to confirm or deny.`};
exports.LEAVE_COMMAND_SUCCESS_RESPONSE = function(username) {return `You have left ${username}'s fellowship.`};
exports.LEAVE_COMMAND_NOT_IN_FELLOWSHIP_ERROR = function(username) {return `You were not part of ${username}'s fellowship to begin with.`};
exports.GENERATE_RESET = "Aw shucks, trust God and you'll get em next time.";

exports.GET_MEMBERSHIP_COMMAND = "getMembership";
exports.GET_MEMBERSHIP_COMMAND_DESCRIPTION = " Get a list of your membership.";
exports.GET_MEMBERSHIP_COMMAND_FULL_DESCRIPTION = " Get a list of all the peoples' fellowships that you are a part of.";
exports.GET_MEMBERSHIP_COMMAND_ERROR = "You are not a part of any user's fellowships.";
exports.GET_MEMBERSHIP_COMMAND_TITLE = function(usernames) {return `This is a list of users' fellowships you're a member of: \n\n${usernames}`};

exports.GET_FELLOWSHIP_COMMAND = "getFellowship";
exports.GET_FELLOWSHIP_COMMAND_DESCRIPTION = "Get a list of users in your fellowship.";
exports.GET_FELLOWSHIP_COMMAND_FULL_DESCRIPTION = "Get a list of all the users in your fellowship.";
exports.GET_FELLOWSHIP_COMMAND_ERROR = "Your fellowship is empty.";
exports.GET_FELLOWSHIP_COMMAND_TITLE = function(usernames) {return `This is a list of users that are in your fellowship: \n\n${usernames}`};

exports.NOTIFY_COMMAND = "notify";
exports.NOTIFY_COMMAND_DESCRIPTION = "Notify all the members of your fellowship.";
exports.NOTIFY_COMMAND_FULL_DESCRIPTION = "When you have a struggle or fun thing to share with your fellowship, use the !notify command to initiate the message.";
exports.NOTIFY_COMMAND_INITIALIZATION =  "Type in the chat below to the bot and once you are finished writing your message," +
    " click on the check emoji to finalize the message. You'll have a chance to review it before sending.";
exports.NOTIFY_COMMAND_SUCCESS = "You have successfully sent your message to your fellowship!";
exports.NOTIFY_COMMAND_NO_FELLOWSHIP_ERROR = "Your fellowship is empty.";
exports.NOTIFY_COMMAND_CANCELLATION = "You've cancelled writing your message.";

exports.FAQ_COMMAND = "faq";
exports.FAQ_COMMAND_DESCRIPTION = "Frequently asked questions.";
exports.FAQ_COMMAND_FULL_DESCRIPTION = "Answers to commonly asked questions that will help you use the bot.";
exports.FAQ_COMMAND_QUESTION_1 = "What are fellowships and what is membership?";
exports.FAQ_COMMAND_ANSWER_1 = "Fellowships are groups owned by one person who can give life updates through the !notify command." +
    " You can join one by typing the !join command @'ing the person's fellowship you want to join or you can invite people into your fellowship with the !invite command." +
    " You can check the members of your fellowship by typing in the !getFellowship command." +
    " Membership is the list of all the fellowships you are a part of and this list can be checked by the !getMembership command.";
exports.FAQ_COMMAND_QUESTION_2 = "Where should I start? How do I use this bot?";
exports.FAQ_COMMAND_ANSWER_2 = "If you want to go straight to tools that help you deal with addiction, then use the" +
    " !track date command, the !track focus command, and the !track threshold command to set this up (type !help track for more information)." +
    " If you want a group of friends to give life updates to, use the !invite command to add people to your fellowship and the !notify command to send out an update.";
exports.FAQ_COMMAND_QUESTION_3 = "Can I DM the bot?";
exports.FAQ_COMMAND_ANSWER_3 = "Yes, it is actually encouraged that you DM the bot for all the commands that don't require mentioning a user for the command." +
    " Only use the open channel for !invite, !join, !kick, and !leave";
exports.FAQ_COMMAND_QUESTION_4 = "Wait a sec wouldn't it be really awkward if someone noticed that you kicked them out of your fellowship on the open channel?";
exports.FAQ_COMMAND_ANSWER_4 = "Yes it would, but there's only a small chance of that happening since all open channels message commands are deleted immediately " +
    " after you post them and followups are DM'ed to you. Make sure you turn off @mention notifications for the channel this bot is running in.";
exports.FAQ_COMMAND_QUESTION_5 = "Why did you make this app?"
exports.FAQ_COMMAND_ANSWER_5 = "Too many Christian Coomers"