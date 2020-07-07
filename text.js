exports.BOT_DESCRIPTION = "A discord bot that brings community within arm's reach when dealing with destructive habits, or just for giving life updates.";
exports.BOT_OWNER = "InflatibleYoshi";

exports.COMMAND_SELECT_NO_USERS_ERROR = "You did not match any registered users with your command.";
exports.COMMAND_SELECT_CANCEL = "You have canceled the operation.";
exports.COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE = function(username) {return `You have been added to the fellowship of ${username}!`}
exports.COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE = function(username) {return `You have added ${username} to your fellowship!`}

exports.REGISTER_COMMAND = "register";
exports.REGISTER_COMMAND_RESPONSE = "If you would like to track the days you've spent dedicated towards a single goal such as being free from addiction or exercising daily, " +
    "\ntype '!register date \"timestamp\" filling" +
    "\n\"timestamp\" with the last day you partook in your habit or forgot a day in the format: " +
    "\n'DD Mon YYYY HH:mm:ss TZ' (!register date 01 Jan 1970 00:00:00 GMT).\"" +
    "Otherwise, type '!register silent' to register without tracking your day.";
exports.REGISTER_COMMAND_DESCRIPTION = "Register User";
exports.REGISTER_COMMAND_FULL_DESCRIPTION = "Register user to the database managed by the Samwise bot which contains all fellowship data.";
exports.REGISTER_SILENT_SUBCOMMAND = "silent";
exports.REGISTER_SILENT_SUBCOMMAND_DESCRIPTION = "Register user with tracking.";
exports.REGISTER_SILENT_SUBCOMMAND_FULL_DESCRIPTION = "Register user to the Samwise bot without tracking.";
exports.REGISTER_DATE_SUBCOMMAND = "date";
exports.REGISTER_DATE_SUBCOMMAND_DESCRIPTION = "Register user with date selection.";
exports.REGISTER_DATE_SUBCOMMAND_FULL_DESCRIPTION = "If you would like to track the days you've spent dedicated towards a single goal such as being free from addiction or exercising daily, " +
    "\ntype '!register date \"timestamp\" filling" +
    "\n\"timestamp\" with the last day you partook in your habit or forgot a day in the format: " +
    "\n'DD Mon YYYY HH:mm:ss TZ' (!register date 01 Jan 1970 00:00:00 GMT).";
exports.REGISTER_DATE_SUBCOMMAND_ALREADY_REGISTERED_WARNING = "You have already registered so this command will only overwrite your settings and not your current fellowship data.";
exports.REGISTER_DATE_SUBCOMMAND_RETURN_STREAK = function(streak) {return `This puts your current streak at ${streak} days.\n Do you want to proceed with these options?`}
exports.REGISTER_COMMAND_USER_CREATED = "Your user has been created/configured." +
    "\nInvite people to join your fellowship and/or ask people to join theirs!";
exports.REGISTER_COMMAND_USER_ABORTED = "The creation/configuration of your user was rejected.";

exports.RESET_COMMAND = "reset";

exports.REQUEST_COMMAND = "request";
exports.REQUEST_COMMAND_DESCRIPTION = "Request to join a user's fellowship.";
exports.REQUEST_COMMAND_FULL_DESCRIPTION = "Request to join another user's fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !request command";
exports.REQUEST_COMMAND_ON_FELLOWSHIP_ADDING_REQUEST = function(username) {return `You have sent your request to ${username}!`}
exports.REQUEST_COMMAND_ON_FELLOWSHIP_TARGET_REQUEST = function(username) {return `${username} has requested to join your fellowship!\n
Use the reaction buttons to choose whether or not to accept or decline the request.`}
exports.REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE = function(username) {return `You are already in ${username}'s fellowship.`}
exports.REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST = function(username) {return `${username} is already in your fellowship.`}

exports.INVITE_COMMAND = "invite";
exports.INVITE_COMMAND_DESCRIPTION = "Invite another user to your fellowship.";
exports.INVITE_COMMAND_FULL_DESCRIPTION = "Invite users to your fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !request command. Use";
exports.INVITE_COMMAND_ON_FELLOWSHIP_ADDING_INVITE = function(username) {return `${username} has asked you to join his/her/its fellowship!\n" +
"Use the reaction buttons to choose whether or not to accept or decline the invite!`};
exports.INVITE_COMMAND_ON_FELLOWSHIP_TARGET_INVITE = function(username) {return `You have invited ${username} to join your fellowship!`}
exports.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE = function(username) {return `${username} is already in your fellowship.`}
exports.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST = function(username) {return `You are already in ${username}'s fellowship.`}

exports.KICK_COMMAND = "kick";
exports.KICK_COMMAND_DESCRIPTION = "Kick a user from your fellowship";
exports.KICK_COMMAND_FULL_DESCRIPTION = "Kick a user from your fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !kick command";
exports.KICK_COMMAND_ON_KICK = function(users) {return `You have decided to remove ${users.toString()} from your fellowship.\n" +
"Use the reaction buttons to choose whether or not to go through with the kick.`}
exports.KICK_COMMAND_SUCCESS_RESPONSE = function(username) {return `You have removed ${username} from your fellowship.`}
exports.KICK_COMMAND_NOT_IN_FELLOWSHIP_ERROR = function(username) {return `${username} was not part of your fellowship to begin with.`}

exports.LEAVE_COMMAND = "leave";
exports.LEAVE_COMMAND_DESCRIPTION = "Leave a fellowship";
exports.LEAVE_COMMAND_FULL_DESCRIPTION = "Leave a fellowships fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !leave command";
exports.LEAVE_COMMAND_ON_LEAVE = function(users) {return `You have decided to leave the fellowship(s) of ${users.toString()}.\n" +
"Use the reaction buttons to choose whether or not to leave.`}
exports.LEAVE_COMMAND_SUCCESS_RESPONSE = function(username) {return `You have left ${username}'s fellowship.`}
exports.LEAVE_COMMAND_NOT_IN_FELLOWSHIP_ERROR = function(username) {return `You were not part of ${username}'s fellowship to begin with.`}
exports.GENERATE_RESET = function() {return "Aw shucks, trust God and you'll get em next time"}