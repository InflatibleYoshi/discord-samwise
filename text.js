exports.BOT_DESCRIPTION = "A discord bot that brings community within arm's reach when dealing with the lowest lows to giving life updates.";
exports.BOT_OWNER = "InflatibleYoshi";

exports.COMMAND_SELECT_NO_USERS_ERROR = "You did not match any users with your command.";
exports.COMMAND_SELECT_CANCEL = "You have canceled the operation.";
exports.COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE = function(username) {return `You have been added to the fellowship of ${username}!`}
exports.COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE = function(username) {return `You have added ${username} to your fellowship!`}

exports.TRACK_RESPONSE = "This command is only available to tracked users.";
exports.TRACK_COMMAND = "track";
exports.TRACK_COMMAND_DESCRIPTION = "The two subcommands available are \'date\' and \'reset\'.";
exports.TRACK_COMMAND_FULL_DESCRIPTION = "The two subcommands available are \'date\' and \'reset\'. " +
    "\nThe date command allows the user to track the days spent dedicated towards a single goal." +
    "\nThe reset command allows the user to reset the date in the case of a relapse.";
exports.TRACK_DATE_SUBCOMMAND = "date";
exports.TRACK_DATE_SUBCOMMAND_DESCRIPTION = "Track user with user-entered start date.";
exports.TRACK_DATE_SUBCOMMAND_FULL_DESCRIPTION = "If you would like to track the days you've spent dedicated towards a single goal such as being free from addiction, " +
    "\ntype '!track date \"timestamp\" filling" +
    "\n\"timestamp\" with your Day 1 as: \'DD Mon YYYY HH:mm:ss TZ\'" +
    "e.g. !track date 01 Jan 1970 00:00:00 GMT";
exports.TRACK_DATE_SUBCOMMAND_ALREADY_TRACKED_WARNING = "You are already tracked so this command will overwrite your maximum streak.";
exports.TRACK_DATE_SUBCOMMAND_RETURN_STREAK = function(streak) {return `This puts your current streak at ${streak} days.\n Do you want to proceed with these options?`}
exports.TRACK_DATE_SUBCOMMAND_USER_ABORTED = "Your tracking configuration was not saved.";
exports.TRACK_DATE_SUBCOMMAND_USER_CONFIRMED = "Your tracking configuration was saved.";
exports.TRACK_RESET_SUBCOMMAND = "reset";
exports.TRACK_RESET_SUBCOMMAND_DESCRIPTION = "Reset tracked user's streak.";
exports.TRACK_RESET_SUBCOMMAND_FULL_DESCRIPTION = "This command resets the tracked user's streak. This command requires no arguments.";
exports.GENERATE_RESET = function() {return "Aw shucks, trust God and you'll get em next time."}

exports.REQUEST_COMMAND = "request";
exports.REQUEST_COMMAND_DESCRIPTION = "Request to join a user's fellowship.";
exports.REQUEST_COMMAND_FULL_DESCRIPTION = "Request to join another user's fellowship by typing" +
    "!request <user-id/username>";
exports.REQUEST_COMMAND_ON_FELLOWSHIP_ADDING_REQUEST = function(username) {return `You have sent your request to ${username}!`}
exports.REQUEST_COMMAND_ON_FELLOWSHIP_TARGET_REQUEST = function(username) {return `${username} has requested to join your fellowship!\n
Use the reaction buttons to choose whether or not to accept or decline the request.`}
exports.REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE = function(username) {return `You are already in ${username}'s fellowship.`}
exports.REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST = function(username) {return `${username} is already in your fellowship.`}

exports.INVITE_COMMAND = "invite";
exports.INVITE_COMMAND_DESCRIPTION = "Invite another user to your fellowship.";
exports.INVITE_COMMAND_FULL_DESCRIPTION = "Invite users to your fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !request command. Use";
exports.INVITE_COMMAND_ON_FELLOWSHIP_ADDING_INVITE = function(username) {return `${username} has asked you to join his/her/its fellowship!
Use the reaction buttons to choose whether or not to accept or decline the invite!`}
exports.INVITE_COMMAND_ON_FELLOWSHIP_TARGET_INVITE = function(username) {return `You have invited ${username} to join your fellowship!`}
exports.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_PRE = function(username) {return `${username} is already in your fellowship.`}
exports.INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR_POST = function(username) {return `You are already in ${username}'s fellowship.`}

exports.KICK_COMMAND = "kick";
exports.KICK_COMMAND_DESCRIPTION = "Kick a user from your fellowship";
exports.KICK_COMMAND_FULL_DESCRIPTION = "Kick a user from your fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !kick command";
exports.KICK_COMMAND_ON_KICK = function(username) {return `You have decided to remove ${username} from your fellowship.
Use the reaction buttons to confirm or deny.`}
exports.KICK_COMMAND_SUCCESS_RESPONSE = function(username) {return `You have removed ${username} from your fellowship.`}
exports.KICK_COMMAND_NOT_IN_FELLOWSHIP_ERROR = function(username) {return `${username} was not part of your fellowship to begin with.`}

exports.LEAVE_COMMAND = "leave";
exports.LEAVE_COMMAND_DESCRIPTION = "Leave a fellowship";
exports.LEAVE_COMMAND_FULL_DESCRIPTION = "Leave a fellowships fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !leave command";
exports.LEAVE_COMMAND_ON_LEAVE = function(username) {return `You have decided to leave the fellowship(s) of ${username}.
Use the reaction buttons to confirm or deny.`}
exports.LEAVE_COMMAND_SUCCESS_RESPONSE = function(username) {return `You have left ${username}'s fellowship.`}
exports.LEAVE_COMMAND_NOT_IN_FELLOWSHIP_ERROR = function(username) {return `You were not part of ${username}'s fellowship to begin with.`}
exports.GENERATE_RESET = function() {return "Aw shucks, trust God and you'll get em next time"}