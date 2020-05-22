export const    BOT_DESCRIPTION = "A discord bot that brings community within arm's reach when dealing with destructive habits, or just for giving life updates.";
export const    BOT_OWNER = "InflatibleYoshi";

export const    COMMAND_SELECT_NO_USERS_ERROR = "You did not match any registered users with your command.";
export const    COMMAND_SELECT_CANCEL = "You have canceled the operation.";
export function COMMAND_ON_FELLOWSHIP_ADDING_RESPONSE(username) {return `You have been added to the fellowship of ${username}!`}
export function COMMAND_ON_FELLOWSHIP_TARGET_RESPONSE(username) {return `You have added ${username} to your fellowship!`}

export const    REGISTER_COMMAND = "register";
export const    REGISTER_COMMAND_RESPONSE = "If you would like to track the days you've spent dedicated towards a single goal such as being free from addiction or exercising daily, " +
    "\ntype '!register date \"timestamp\" filling" +
    "\n\"timestamp\" with the last day you partook in your habit or forgot a day in the format: " +
    "\n'DD Mon YYYY HH:mm:ss TZ' (!register date 01 Jan 1970 00:00:00 GMT).\"" +
    "Otherwise, type '!register silent' to register without tracking your day.";
export const    REGISTER_COMMAND_DESCRIPTION = "Register User";
export const    REGISTER_COMMAND_FULL_DESCRIPTION = "Register user to the database managed by the Samwise bot which contains all fellowship data.";
export const    REGISTER_SILENT_SUBCOMMAND = "silent";
export const    REGISTER_SILENT_SUBCOMMAND_DESCRIPTION = "Register user with tracking.";
export const    REGISTER_SILENT_SUBCOMMAND_FULL_DESCRIPTION = "Register user to the Samwise bot without tracking.";
export const    REGISTER_DATE_SUBCOMMAND = "date";
export const    REGISTER_DATE_SUBCOMMAND_DESCRIPTION = "Register user with date selection.";
export const    REGISTER_DATE_SUBCOMMAND_FULL_DESCRIPTION = "If you would like to track the days you've spent dedicated towards a single goal such as being free from addiction or exercising daily, " +
    "\ntype '!register date \"timestamp\" filling" +
    "\n\"timestamp\" with the last day you partook in your habit or forgot a day in the format: " +
    "\n'DD Mon YYYY HH:mm:ss TZ' (!register date 01 Jan 1970 00:00:00 GMT).";
export const    REGISTER_DATE_SUBCOMMAND_ALREADY_REGISTERED_WARNING = "You have already registered so this command will only overwrite your settings and not your current fellowship data.";
export function REGISTER_DATE_SUBCOMMAND_RETURN_STREAK(streak) {return `This puts your current streak at ${streak} days.\n Do you want to proceed with these options?`}
export const    REGISTER_COMMAND_USER_CREATED = "Your user has been created/configured." +
    "\nInvite people to join your fellowship and/or ask people to join theirs!";
export const    REGISTER_COMMAND_USER_ABORTED = "The creation/configuration of your user was rejected.";

export const    RESET_COMMAND = "reset";

export const    REQUEST_COMMAND = "request";
export const    REQUEST_COMMAND_DESCRIPTION = "Request to join a user's fellowship.";
export const    REQUEST_COMMAND_FULL_DESCRIPTION = "Request to join another user's fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !request command";
export function REQUEST_COMMAND_ON_FELLOWSHIP_ADDING_REQUEST(username) {return `You have sent your request to ${username}!`}
export function REQUEST_COMMAND_ON_FELLOWSHIP_TARGET_REQUEST(username) {return `${username} has requested to join your fellowship!\n
Use the reaction buttons to choose whether or not to accept or decline the request.`}
export function REQUEST_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR(username) {return `${username} is already in your fellowship.`}

export const    INVITE_COMMAND = "invite";
export const    INVITE_COMMAND_DESCRIPTION = "Invite another user to your fellowship.";
export const    INVITE_COMMAND_FULL_DESCRIPTION = "Invite users to your fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !request command. Use";
export function INVITE_COMMAND_ON_FELLOWSHIP_ADDING_INVITE(username) {return `${username} has asked you to join his/her/its fellowship!\n" +
"Use the reaction buttons to choose whether or not to accept or decline the invite!`}
export function INVITE_COMMAND_ON_FELLOWSHIP_TARGET_INVITE(username) {return `You have invited ${username} to join your fellowship!`}
export function INVITE_COMMAND_ALREADY_IN_FELLOWSHIP_ERROR(username) {return `You are already in ${username}'s fellowship.`}

export const    KICK_COMMAND = "kick";
export const    KICK_COMMAND_DESCRIPTION = "Kick a user from your fellowship";
export const    KICK_COMMAND_FULL_DESCRIPTION = "Kick a user from your fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !kick command";
export function KICK_COMMAND_ON_KICK(users) {return `You have decided to remove ${users.toString()} from your fellowship.\n" +
"Use the reaction buttons to choose whether or not to go through with the kick.`}
export function KICK_COMMAND_SUCCESS_RESPONSE(username) {return `You have removed ${username} from your fellowship.`}
export function KICK_COMMAND_NOT_IN_FELLOWSHIP_ERROR(username) {return `${username} was not part of your fellowship to begin with.`}

export const    LEAVE_COMMAND = "leave";
export const    LEAVE_COMMAND_DESCRIPTION = "Leave a fellowship";
export const    LEAVE_COMMAND_FULL_DESCRIPTION = "Leave a fellowships fellowship by typing any amount " +
    "of user id's or usernames separated by space to the right of the !leave command";
export function LEAVE_COMMAND_ON_LEAVE(users) {return `You have decided to leave the fellowship(s) of ${users.toString()}.\n" +
"Use the reaction buttons to choose whether or not to leave.`}
export function LEAVE_COMMAND_SUCCESS_RESPONSE(username) {return `You have left ${username}'s fellowship.`}
export function LEAVE_COMMAND_NOT_IN_FELLOWSHIP_ERROR(username) {return `You were not part of ${username}'s fellowship to begin with.`}